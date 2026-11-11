using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

namespace WhatStatus;

// spotify window title is "Artist - Song" while playing
static class Media
{
    public sealed record Track(string Song, string Artist, string App);

    public static volatile Track? Current;
    static long lastSeen;

    public static async Task LoopAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            Track? now = null;
            try { now = Spotify(); } catch { }
            // title is empty between tracks, keep the last one for a few seconds
            if (now != null) lastSeen = Environment.TickCount64;
            else if (Current != null && Environment.TickCount64 - lastSeen < 4000) now = Current;
            if (now != Current)
            {
                Log.Write("music: " + (now is null ? "nothing playing" : $"{now.Artist} - {now.Song}"));
                Current = now;
            }
            await Task.Delay(1000, ct);
        }
    }

    static Track? Spotify()
    {
        var pids = new HashSet<uint>();
        foreach (var p in Process.GetProcessesByName("Spotify"))
            using (p) pids.Add((uint)p.Id);
        if (pids.Count == 0) return null;

        string? title = null;
        EnumWindows((hwnd, _) =>
        {
            GetWindowThreadProcessId(hwnd, out uint pid);
            if (!pids.Contains(pid)) return true;
            int len = GetWindowTextLengthW(hwnd);
            if (len == 0) return true;
            var sb = new StringBuilder(len + 1);
            GetWindowTextW(hwnd, sb, sb.Capacity);
            string t = sb.ToString();
            if (t.Contains(" - ") && !t.StartsWith("Spotify", StringComparison.Ordinal))
            {
                title = t;
                return false;
            }
            return true;
        }, IntPtr.Zero);

        if (title == null) return null;
        int i = title.IndexOf(" - ", StringComparison.Ordinal);
        return new Track(Song: title[(i + 3)..].Trim(), Artist: title[..i].Trim(), App: "Spotify");
    }

    delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);

    [DllImport("user32.dll")]
    static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);

    [DllImport("user32.dll")]
    static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    static extern int GetWindowTextLengthW(IntPtr hwnd);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    static extern int GetWindowTextW(IntPtr hwnd, StringBuilder text, int max);
}
