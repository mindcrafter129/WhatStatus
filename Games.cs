using System.Collections.Concurrent;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace WhatStatus;

// running processes vs Discord's detectable games list
static class Games
{
    const string Api = "https://discord.com/api/v10";
    static readonly HttpClient Http = CreateHttp();

    static readonly ConcurrentDictionary<string, string> appsById = new();
    static readonly Dictionary<string, List<(string Suffix, string Name)>> exeIndex = new();
    static readonly Dictionary<string, string> steamIndex = new();
    static readonly Dictionary<string, (DateTime Read, Dictionary<string, string> Dirs)> steamLibs = new(); // steamapps dir -> installdir -> appid

    public static volatile string? ScanGame;

    static HttpClient CreateHttp()
    {
        var h = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
        h.DefaultRequestHeaders.UserAgent.ParseAdd("WhatStatus/" + Updater.Current);
        return h;
    }

    public static async Task LoadAsync()
    {
        string cache = Path.Combine(Program.Dir, "detectable.json");
        var fi = new FileInfo(cache);
        if (!fi.Exists || DateTime.UtcNow - fi.LastWriteTimeUtc > TimeSpan.FromDays(1))
        {
            try
            {
                Log.Write("downloading Discord detectable games list...");
                byte[] data = await Http.GetByteArrayAsync(Api + "/applications/detectable");
                await File.WriteAllBytesAsync(cache + ".tmp", data);
                File.Move(cache + ".tmp", cache, overwrite: true);
            }
            catch (Exception e) { Log.Write("download failed: " + e.Message); }
        }
        if (!File.Exists(cache)) return;

        await using var fs = File.OpenRead(cache);
        using var doc = await JsonDocument.ParseAsync(fs);
        foreach (var app in doc.RootElement.EnumerateArray())
        {
            string? id = Str(app, "id"), name = Str(app, "name");
            if (id == null || name == null) continue;
            appsById[id] = name;

            if (app.TryGetProperty("third_party_skus", out var skus) && skus.ValueKind == JsonValueKind.Array)
                foreach (var sku in skus.EnumerateArray())
                    if (Str(sku, "distributor") == "steam" && Str(sku, "id") is string appid)
                        steamIndex[appid] = name;

            if (!app.TryGetProperty("executables", out var exes) || exes.ValueKind != JsonValueKind.Array) continue;
            foreach (var ex in exes.EnumerateArray())
            {
                // skip launchers and entries that need specific args
                if (Str(ex, "os") != "win32" || ex.TryGetProperty("is_launcher", out var l) && l.ValueKind == JsonValueKind.True
                    || !string.IsNullOrEmpty(Str(ex, "arguments")))
                    continue;
                string? exeName = Str(ex, "name");
                if (string.IsNullOrEmpty(exeName)) continue;
                string suffix = exeName.ToLowerInvariant().TrimStart('>').Replace('\\', '/');
                string bn = suffix[(suffix.LastIndexOf('/') + 1)..];
                if (!exeIndex.TryGetValue(bn, out var list)) exeIndex[bn] = list = new();
                list.Add((suffix, name));
            }
        }
        Log.Write($"loaded {appsById.Count} detectable apps ({steamIndex.Count} with Steam ids)");
    }

    static string? Str(JsonElement e, string prop) =>
        e.TryGetProperty(prop, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

    public static async Task<string> AppNameAsync(string clientId)
    {
        if (appsById.TryGetValue(clientId, out var name)) return name;
        try
        {
            using var doc = JsonDocument.Parse(await Http.GetStringAsync($"{Api}/applications/{Uri.EscapeDataString(clientId)}/rpc"));
            name = doc.RootElement.GetProperty("name").GetString() ?? throw new Exception();
        }
        catch { name = $"unknown app {clientId}"; }
        return appsById[clientId] = name;
    }

    static (int Rank, string Name)? Match(string path)
    {
        string bn = path[(path.LastIndexOf('/') + 1)..];
        if (exeIndex.TryGetValue(bn, out var list))
            foreach (var (suffix, name) in list)
                if (path == suffix || path.EndsWith("/" + suffix))
                    return (0, name);

        const string common = "/steamapps/common/";
        int i = path.IndexOf(common, StringComparison.Ordinal);
        if (i >= 0)
        {
            string rest = path[(i + common.Length)..];
            int j = rest.IndexOf('/');
            string installDir = j < 0 ? rest : rest[..j];
            string? appid = SteamAppId(path[..i] + "/steamapps", installDir);
            if (appid != null && steamIndex.TryGetValue(appid, out var name))
                return (1, name);
        }
        return null;
    }

    static string? SteamAppId(string steamapps, string installDir)
    {
        // reread manifests on a miss, at most once a minute
        if (steamLibs.TryGetValue(steamapps, out var lib) &&
            (lib.Dirs.ContainsKey(installDir) || DateTime.UtcNow - lib.Read < TimeSpan.FromMinutes(1)))
            return lib.Dirs.GetValueOrDefault(installDir);

        var dirs = new Dictionary<string, string>();
        try
        {
            foreach (var acf in Directory.EnumerateFiles(steamapps.Replace('/', '\\'), "appmanifest_*.acf"))
            {
                try
                {
                    string txt = File.ReadAllText(acf);
                    string? id = Acf(txt, "appid"), dir = Acf(txt, "installdir");
                    if (id != null && dir != null) dirs[dir.ToLowerInvariant()] = id;
                }
                catch { }
            }
        }
        catch { }
        steamLibs[steamapps] = (DateTime.UtcNow, dirs);
        return dirs.GetValueOrDefault(installDir);
    }

    static string? Acf(string text, string key)
    {
        var m = Regex.Match(text, "\"" + key + "\"\\s+\"([^\"]*)\"");
        return m.Success ? m.Groups[1].Value : null;
    }

    public static async Task ScanLoopAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            ScanOnce();
            await Task.Delay(5000, ct);
        }
    }

    public static void ScanOnce()
    {
        int me = Environment.ProcessId;
        {
            ((int Rank, long Age) Key, string Name)? best = null;
            foreach (var p in Process.GetProcesses())
            {
                using (p)
                {
                    try
                    {
                        if (p.Id is 0 or 4 || p.Id == me) continue;
                        string path = (ExePath(p.Id) ?? p.ProcessName + ".exe").ToLowerInvariant().Replace('\\', '/');
                        if (Match(path) is not { } hit) continue;
                        long start = 0;
                        try { start = p.StartTime.Ticks; } catch { }
                        var key = (hit.Rank, -start); // best rank, then newest
                        if (best == null || key.CompareTo(best.Value.Key) < 0) best = (key, hit.Name);
                    }
                    catch { } // process exited
                }
            }
            string? found = best?.Name;
            if (found != ScanGame)
            {
                Log.Write("process scan: " + (found ?? "no game"));
                ScanGame = found;
            }
        }
    }

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern IntPtr OpenProcess(uint access, bool inherit, int pid);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    static extern bool QueryFullProcessImageNameW(IntPtr process, uint flags, StringBuilder name, ref int size);

    [DllImport("kernel32.dll")]
    static extern bool CloseHandle(IntPtr handle);

    public static string? ExePath(int pid)
    {
        IntPtr h = OpenProcess(0x1000 /* PROCESS_QUERY_LIMITED_INFORMATION */, false, pid);
        if (h == IntPtr.Zero) return null;
        try
        {
            var sb = new StringBuilder(1024);
            int size = sb.Capacity;
            return QueryFullProcessImageNameW(h, 0, sb, ref size) ? sb.ToString(0, size) : null;
        }
        finally { CloseHandle(h); }
    }
}
