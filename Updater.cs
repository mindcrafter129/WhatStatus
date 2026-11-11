using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json.Nodes;

namespace WhatStatus;

// checks GitHub releases while WhatsApp is open and swaps in a newer exe.
// only accepts an exe signed with the same certificate as the running one
static class Updater
{
    const string LatestUrl = "https://api.github.com/repos/mindcrafter129/WhatStatus/releases/latest";
    const string AssetName = "WhatStatus.exe";
    static readonly TimeSpan Every = TimeSpan.FromHours(6);

    static string StampFile => Path.Combine(Program.Dir, "update-check.txt");
    // for testing: put another "latest release" API url in this file
    static string SourceFile => Path.Combine(Program.Dir, "update-source.txt");
    static string NewExe => Path.Combine(Program.Dir, "WhatStatus.new.exe");
    static string OldExe => Path.Combine(Program.Dir, "WhatStatus.old.exe");

    public static Version Current => Assembly.GetExecutingAssembly().GetName().Version ?? new Version(0, 0);

    public static async Task RunAsync(CancellationToken ct)
    {
        try { File.Delete(OldExe); } catch { }
        string self = Environment.ProcessPath ?? "";
        // dev builds run from elsewhere, leave them alone
        if (!string.Equals(Path.GetFullPath(self), Path.GetFullPath(Program.InstalledExe), StringComparison.OrdinalIgnoreCase)) return;

        await Task.Delay(TimeSpan.FromSeconds(20), ct);
        while (!ct.IsCancellationRequested)
        {
            bool test = File.Exists(SourceFile);
            if (test || !File.Exists(StampFile) || DateTime.UtcNow - File.GetLastWriteTimeUtc(StampFile) > Every)
            {
                try { File.WriteAllText(StampFile, DateTime.UtcNow.ToString("o")); } catch { }
                try { if (await CheckAsync(self, ct)) return; }
                catch (Exception e) when (e is not OperationCanceledException) { Log.Write("update check failed: " + e.Message); }
            }
            await Task.Delay(TimeSpan.FromMinutes(test ? 1 : 30), ct);
        }
    }

    static async Task<bool> CheckAsync(string self, CancellationToken ct)
    {
        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(60) };
        http.DefaultRequestHeaders.UserAgent.ParseAdd("WhatStatus-updater/" + Current);
        http.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");

        string source = File.Exists(SourceFile) ? File.ReadAllText(SourceFile).Trim() : LatestUrl;
        var rel = JsonNode.Parse(await http.GetStringAsync(source, ct));
        string tag = Json.Str(rel?["tag_name"]) ?? "";
        if (!Version.TryParse(tag.TrimStart('v', 'V'), out var latest) || latest <= Current) return false;

        string? url = null;
        foreach (var a in rel?["assets"]?.AsArray() ?? new JsonArray())
            if (Json.Str(a?["name"]) == AssetName) url = Json.Str(a?["browser_download_url"]);
        if (url == null) return false;

        Log.Write($"update {Current} -> {latest}: downloading");
        await File.WriteAllBytesAsync(NewExe, await http.GetByteArrayAsync(url, ct), ct);

        if (!SameSigner(self, NewExe))
        {
            Log.Write("update rejected: not signed with the same certificate");
            File.Delete(NewExe);
            return false;
        }

        // a running exe can be renamed but not overwritten
        File.Move(self, OldExe, overwrite: true);
        File.Move(NewExe, self);
        Process.Start(new ProcessStartInfo(self, "--finish-update") { UseShellExecute = false, CreateNoWindow = true })?.Dispose();
        Log.Write($"updated to {latest}, active from the next WhatsApp start");
        return true;
    }

    static bool SameSigner(string current, string candidate)
    {
        if (!SignatureIntact(candidate)) return false;
        try
        {
            using var a = new X509Certificate2(X509Certificate.CreateFromSignedFile(current));
            using var b = new X509Certificate2(X509Certificate.CreateFromSignedFile(candidate));
            return a.Thumbprint == b.Thumbprint;
        }
        catch { return false; } // unsigned
    }

    // checks the file hash against its signature. a self-signed cert is fine, a tampered file isn't
    public static bool SignatureIntact(string file)
    {
        const uint UntrustedRoot = 0x800B0109;
        var info = new WINTRUST_FILE_INFO { cbStruct = (uint)Marshal.SizeOf<WINTRUST_FILE_INFO>(), pcwszFilePath = file };
        IntPtr pInfo = Marshal.AllocHGlobal(Marshal.SizeOf<WINTRUST_FILE_INFO>());
        try
        {
            Marshal.StructureToPtr(info, pInfo, false);
            var data = new WINTRUST_DATA
            {
                cbStruct = (uint)Marshal.SizeOf<WINTRUST_DATA>(),
                dwUIChoice = 2,       // no UI
                fdwRevocationChecks = 0,
                dwUnionChoice = 1,    // file
                pFile = pInfo,
            };
            var action = new Guid("00AAC56B-CD44-11d0-8CC2-00C04FC295EE"); // WINTRUST_ACTION_GENERIC_VERIFY_V2
            uint r = (uint)WinVerifyTrust(IntPtr.Zero, ref action, ref data);
            return r == 0 || r == UntrustedRoot;
        }
        finally
        {
            Marshal.DestroyStructure<WINTRUST_FILE_INFO>(pInfo);
            Marshal.FreeHGlobal(pInfo);
        }
    }

    [DllImport("wintrust.dll", CharSet = CharSet.Unicode)]
    static extern int WinVerifyTrust(IntPtr hwnd, ref Guid action, ref WINTRUST_DATA data);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    struct WINTRUST_FILE_INFO
    {
        public uint cbStruct;
        [MarshalAs(UnmanagedType.LPWStr)] public string pcwszFilePath;
        public IntPtr hFile;
        public IntPtr pgKnownSubject;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct WINTRUST_DATA
    {
        public uint cbStruct;
        public IntPtr pPolicyCallbackData;
        public IntPtr pSIPClientData;
        public uint dwUIChoice;
        public uint fdwRevocationChecks;
        public uint dwUnionChoice;
        public IntPtr pFile;
        public uint dwStateAction;
        public IntPtr hWVTStateData;
        public IntPtr pwszURLReference;
        public uint dwProvFlags;
        public uint dwUIContext;
        public IntPtr pSignatureSettings;
    }
}
