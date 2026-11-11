using System.Diagnostics;
using System.Reflection;
using System.Text.Json.Nodes;
using Microsoft.Win32;

namespace WhatStatus;

static partial class Program
{
    const string WhatsAppExe = "WhatsApp.Root.exe";
    const string WhatsAppAumid = "5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App";
    const string HostName = "com.whatstatus.host";
    const string ExtensionId = "bgegnmfhchaokkkipolfegciebidcfkc"; // fixed by the key in ext/manifest.json
    const string PolicyKey = @"Software\Policies\Microsoft\Edge\WebView2\AdditionalBrowserArguments";
    static readonly string[] HostKeys =
    {
        @"Software\Microsoft\Edge\NativeMessagingHosts\" + HostName,
        @"Software\Google\Chrome\NativeMessagingHosts\" + HostName,
    };
    static readonly string[] ExtFiles = { "manifest.json", "background.js", "bridge.js", "page.js", "ui.js" };

    public static readonly string Dir = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "WhatStatus");
    public static string InstalledExe => Path.Combine(Dir, "WhatStatus.exe");
    static string ExtDir => Path.Combine(Dir, "ext");
    static string HostManifest => Path.Combine(Dir, HostName + ".json");
    public static Action<int>? Stage;

    public static string? CurrentGame() => DiscordIpc.CurrentGame() ?? Games.ScanGame;

    static async Task<int> Main(string[] args)
    {
        Directory.CreateDirectory(Dir);
        // run by the updater after swapping the exe
        if (args.Contains("--finish-update")) { RefreshInstall(); return 0; }
        // started by WebView2 as the native messaging host
        if (args.Length > 0 && args[0].StartsWith("chrome-extension://", StringComparison.OrdinalIgnoreCase))
            return await Host.RunAsync();

        return RunGui();
    }

    static int RunGui()
    {
        var t = new Thread(() => Gui.Run());
        t.SetApartmentState(ApartmentState.STA);
        t.Start();
        t.Join();
        return 0;
    }

    public static int Patch()
    {
        Stage?.Invoke(0);
        KillHosts();
        string self = Environment.ProcessPath!;
        if (!SamePath(self, InstalledExe)) File.Copy(self, InstalledExe, overwrite: true);

        RefreshInstall();
        RemoveLegacy();

        Stage?.Invoke(1);
        if (!SetPolicy(PolicyValue()))
        {
            return 1;
        }
        Stage?.Invoke(2);
        RestartWhatsApp();
        return 0;
    }

    // extension files + native host registration, no admin needed
    public static void RefreshInstall()
    {
        InstallExtension();
        var manifest = new JsonObject
        {
            ["name"] = HostName,
            ["description"] = "WhatStatus game detector",
            ["path"] = InstalledExe,
            ["type"] = "stdio",
            ["allowed_origins"] = new JsonArray($"chrome-extension://{ExtensionId}/"),
        };
        File.WriteAllText(HostManifest, manifest.ToJsonString(new() { WriteIndented = true }));
        foreach (var k in HostKeys)
            using (var key = Registry.CurrentUser.CreateSubKey(k)) key.SetValue("", HostManifest);
    }

    // versions before 1.1 were installed as "whatstauts"
    static void RemoveLegacy()
    {
        foreach (var k in new[] { @"Software\Microsoft\Edge\NativeMessagingHosts\com.whatstauts.host", @"Software\Google\Chrome\NativeMessagingHosts\com.whatstauts.host" })
            Registry.CurrentUser.DeleteSubKeyTree(k, throwOnMissingSubKey: false);
        try { Directory.Delete(Path.Combine(Path.GetDirectoryName(Dir)!, "whatstauts"), recursive: true); } catch { }
    }

    public static int Unpatch()
    {
        Stage?.Invoke(0);
        KillHosts();
        RemoveLegacy();
        foreach (var k in HostKeys) Registry.CurrentUser.DeleteSubKeyTree(k, throwOnMissingSubKey: false);
        try { File.Delete(HostManifest); } catch { }
        Stage?.Invoke(1);
        bool ok = SetPolicy(null);
        Stage?.Invoke(2);
        RestartWhatsApp();
        try { Directory.Delete(ExtDir, recursive: true); } catch { }
        return ok ? 0 : 1;
    }

    static byte[] Resource(string name)
    {
        using var s = Assembly.GetExecutingAssembly().GetManifestResourceStream("ext/" + name)!;
        using var ms = new MemoryStream();
        s.CopyTo(ms);
        return ms.ToArray();
    }

    // webview2 caches the service worker by url, so name it after its content hash
    static void InstallExtension()
    {
        Directory.CreateDirectory(ExtDir);
        foreach (var old in Directory.GetFiles(ExtDir)) File.Delete(old);

        byte[] worker = Resource("background.js");
        string workerName = $"background-{Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(worker))[..10].ToLowerInvariant()}.js";
        File.WriteAllBytes(Path.Combine(ExtDir, workerName), worker);

        var manifest = JsonNode.Parse(Resource("manifest.json"))!;
        manifest["background"]!["service_worker"] = workerName;
        File.WriteAllText(Path.Combine(ExtDir, "manifest.json"), manifest.ToJsonString(new() { WriteIndented = true }));

        foreach (var f in ExtFiles.Except(new[] { "manifest.json", "background.js" }))
            File.WriteAllBytes(Path.Combine(ExtDir, f), Resource(f));
    }

    static string PolicyValue()
    {
        string ext = ExtDir.Contains(' ') ? $"\"{ExtDir}\"" : ExtDir;
        return $"--load-extension={ext} --disable-features=DisableLoadExtensionCommandLineSwitch";
    }

    public static bool IsInstalled() => CurrentPolicy() == PolicyValue() && File.Exists(Path.Combine(ExtDir, "manifest.json"));

    static string? CurrentPolicy() => Registry.CurrentUser.OpenSubKey(PolicyKey)?.GetValue(WhatsAppExe) as string;

    // HKCU\Software\Policies needs admin, so fall back to an elevated reg.exe. null removes the value
    static bool SetPolicy(string? value)
    {
        if (CurrentPolicy() == value) return true;
        try
        {
            if (value != null)
                using (var k = Registry.CurrentUser.CreateSubKey(PolicyKey)) k.SetValue(WhatsAppExe, value);
            else
                using (var k = Registry.CurrentUser.OpenSubKey(PolicyKey, writable: true)) k?.DeleteValue(WhatsAppExe, false);
            return true;
        }
        catch (Exception e) when (e is UnauthorizedAccessException or System.Security.SecurityException) { }

        string args = value != null
            ? $"add \"HKCU\\{PolicyKey}\" /v {WhatsAppExe} /d \"{value.Replace("\"", "\\\"")}\" /f"
            : $"delete \"HKCU\\{PolicyKey}\" /v {WhatsAppExe} /f";
        try
        {
            using var p = Process.Start(new ProcessStartInfo("reg.exe", args)
            { UseShellExecute = true, Verb = "runas", WindowStyle = ProcessWindowStyle.Hidden });
            p?.WaitForExit();
        }
        catch (System.ComponentModel.Win32Exception) { return false; } // UAC cancelled
        return CurrentPolicy() == value;
    }

    static bool SamePath(string a, string b) =>
        string.Equals(Path.GetFullPath(a), Path.GetFullPath(b), StringComparison.OrdinalIgnoreCase);

    static void KillHosts()
    {
        foreach (var p in new[] { "WhatStatus", "whatstauts" }.SelectMany(Process.GetProcessesByName))
            using (p)
            {
                if (p.Id == Environment.ProcessId) continue;
                try { p.Kill(); p.WaitForExit(5000); } catch { }
            }
    }

    static void RestartWhatsApp()
    {
        var procs = Process.GetProcessesByName(Path.GetFileNameWithoutExtension(WhatsAppExe));
        if (procs.Length == 0)
        {
            return;
        }
        foreach (var p in procs)
            using (p)
            {
                try { p.Kill(); p.WaitForExit(5000); } catch { }
            }
        Thread.Sleep(1500); // wait for webview2 to exit
        Process.Start(new ProcessStartInfo("explorer.exe", @"shell:AppsFolder\" + WhatsAppAumid)
        { UseShellExecute = true })?.Dispose();
    }
}

static class Log
{
    static readonly object Gate = new();
    static string? file;
    static bool toConsole = true;

    public static void ToFile(string path, bool console = true)
    {
        try { if (new FileInfo(path) is { Exists: true, Length: > 1_000_000 }) File.Delete(path); } catch { }
        file = path;
        toConsole = console;
    }

    public static void Write(string msg)
    {
        string line = $"[{DateTime.Now:HH:mm:ss}] {msg}";
        lock (Gate)
        {
            if (toConsole) Console.WriteLine(line);
            if (file != null) try { File.AppendAllText(file, line + Environment.NewLine); } catch { }
        }
    }
}

static class Json
{
    public static string? Str(JsonNode? n) => n is JsonValue v && v.TryGetValue<string>(out var s) ? s : null;

    public static JsonObject ParseObject(ReadOnlySpan<byte> utf8)
    {
        try { return JsonNode.Parse(utf8) as JsonObject ?? new JsonObject(); }
        catch { return new JsonObject(); }
    }
}
