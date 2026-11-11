using System.Buffers.Binary;
using System.Text;
using System.Text.Json.Nodes;

namespace Whatstauts;

// native messaging host, started by WhatsApp. stdin closing means WhatsApp quit
static class Host
{
    public static async Task<int> RunAsync()
    {
        Log.ToFile(Path.Combine(Program.Dir, "log.txt"), console: false); // stdout is the message channel
        Log.Write("started by WhatsApp");

        using var cts = new CancellationTokenSource();
        var stdin = Console.OpenStandardInput();
        var stdout = Console.OpenStandardOutput();
        _ = Task.Run(async () =>
        {
            var buf = new byte[4096];
            try { while (await stdin.ReadAsync(buf) > 0) { } } catch { }
            cts.Cancel();
        });

        try
        {
            await Games.LoadAsync();
            Games.ScanOnce(); // scan once before the first message
            var background = new[]
            {
                Games.ScanLoopAsync(cts.Token),
                DiscordIpc.RunAsync(cts.Token),
                Media.LoopAsync(cts.Token),
            };

            string? lastJson = null;
            while (!cts.IsCancellationRequested)
            {
                var music = Media.Current;
                var msg = new JsonObject
                {
                    ["game"] = Program.CurrentGame(),
                    ["music"] = music is null ? null : new JsonObject
                    {
                        ["song"] = music.Song, ["artist"] = music.Artist, ["app"] = music.App,
                    },
                };
                string json = msg.ToJsonString();
                if (json != lastJson)
                {
                    await SendAsync(stdout, msg, cts.Token);
                    Log.Write("-> WhatsApp: " + json);
                    lastJson = json;
                }
                await Task.Delay(1000, cts.Token);
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception e) { Log.Write("host error: " + e); }
        Log.Write("WhatsApp closed, exiting");
        return 0;
    }

    static async Task SendAsync(Stream stdout, JsonNode msg, CancellationToken ct)
    {
        byte[] body = Encoding.UTF8.GetBytes(msg.ToJsonString());
        byte[] frame = new byte[4 + body.Length];
        BinaryPrimitives.WriteInt32LittleEndian(frame, body.Length);
        body.CopyTo(frame, 4);
        await stdout.WriteAsync(frame, ct);
        await stdout.FlushAsync(ct);
    }
}
