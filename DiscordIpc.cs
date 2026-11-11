using System.Buffers.Binary;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO.Pipes;
using System.Text;
using System.Text.Json.Nodes;

namespace WhatStatus;

// proxies discord-ipc-0 to the real Discord pipe and reads what games send
static class DiscordIpc
{
    const uint OpHandshake = 0, OpFrame = 1, OpClose = 2, OpPing = 3, OpPong = 4;

    sealed class Session { public string? Name, Details, State; }
    static readonly ConcurrentDictionary<int, Session> sessions = new();
    static int lastId;

    public static string? CurrentGame() =>
        sessions.OrderByDescending(kv => kv.Key).Select(kv => kv.Value.Name).FirstOrDefault(n => n != null);

    public static async Task RunAsync(CancellationToken ct)
    {
        const string prefix = "discord-ipc-";
        string name = prefix + "0";
        if (PipeNames().Contains(name))
        {
            Log.Write($"{name} is already taken (Discord running?). IPC intercept OFF, process scan only.");
            return;
        }

        bool first = true;
        while (!ct.IsCancellationRequested)
        {
            var server = new NamedPipeServerStream(name, PipeDirection.InOut,
                NamedPipeServerStream.MaxAllowedServerInstances, PipeTransmissionMode.Byte,
                PipeOptions.Asynchronous | (first ? PipeOptions.FirstPipeInstance : PipeOptions.None));
            if (first)
            {
                first = false;
                Log.Write($@"listening on \\.\pipe\{name}");
            }
            try { await server.WaitForConnectionAsync(ct); }
            catch { server.Dispose(); throw; }
            _ = HandleClientAsync(server, prefix, ct);
        }
    }

    static HashSet<string> PipeNames()
    {
        try { return Directory.EnumerateFiles(@"\\.\pipe\").Select(Path.GetFileName).ToHashSet(StringComparer.OrdinalIgnoreCase)!; }
        catch { return new(); }
    }

    static async Task HandleClientAsync(NamedPipeServerStream client, string prefix, CancellationToken ct)
    {
        int sid = Interlocked.Increment(ref lastId);
        var pipes = PipeNames();
        string? upName = Enumerable.Range(1, 9).Select(i => prefix + i).FirstOrDefault(pipes.Contains);
        NamedPipeClientStream? up = null;
        if (upName != null)
        {
            try
            {
                up = new NamedPipeClientStream(".", upName, PipeDirection.InOut, PipeOptions.Asynchronous);
                await up.ConnectAsync(2000, ct);
            }
            catch (Exception e)
            {
                Log.Write($"[{sid}] can't reach Discord at {upName}: {e.Message}");
                up?.Dispose();
                up = null;
            }
        }
        Log.Write($"[{sid}] client connected, " + (up != null ? $"forwarding to {upName}" : "stub mode (no Discord)"));

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        var tasks = new List<Task> { ClientToDiscordAsync(sid, client, up, cts.Token) };
        if (up != null) tasks.Add(DiscordToClientAsync(sid, up, client, cts.Token));
        try { await Task.WhenAny(tasks); }
        finally
        {
            cts.Cancel();
            client.Dispose();
            up?.Dispose();
            try { await Task.WhenAll(tasks); } catch { }
            sessions.TryRemove(sid, out var s);
            Log.Write($"[{sid}] disconnected" + (s?.Name != null ? $" ({s.Name})" : ""));
        }
    }

    static async Task ClientToDiscordAsync(int sid, Stream client, Stream? up, CancellationToken ct)
    {
        while (true)
        {
            var (op, body) = await ReadFrameAsync(client, ct);
            var msg = Json.ParseObject(body);
            try { await InspectAsync(sid, op, msg); }
            catch (Exception e) { Log.Write($"[{sid}] couldn't parse frame: {e.Message}"); }

            if (up != null) await WriteFrameAsync(up, op, body, ct);
            else if (StubReply(op, msg) is var (rop, reply)) await WriteFrameAsync(client, rop, reply, ct);
            if (op == OpClose) return;
        }
    }

    static async Task DiscordToClientAsync(int sid, Stream up, Stream client, CancellationToken ct)
    {
        while (true)
        {
            var (op, body) = await ReadFrameAsync(up, ct);
            await WriteFrameAsync(client, op, body, ct);
            if (Json.Str(Json.ParseObject(body)["evt"]) == "ERROR")
                Log.Write($"[{sid}] Discord error: {Encoding.UTF8.GetString(body, 0, Math.Min(body.Length, 200))}");
        }
    }

    static async Task InspectAsync(int sid, uint op, JsonObject msg)
    {
        if (op == OpHandshake)
        {
            string clientId = msg["client_id"]?.ToString() ?? "?";
            string name = await Games.AppNameAsync(clientId);
            Log.Write($"[{sid}] HANDSHAKE client_id={clientId} -> {name}");
            sessions.AddOrUpdate(sid, _ => new Session { Name = name }, (_, s) => { s.Name = name; return s; });
        }
        else if (op == OpFrame && Json.Str(msg["cmd"]) == "SET_ACTIVITY")
        {
            var act = (msg["args"] as JsonObject)?["activity"] as JsonObject;
            var s = sessions.GetOrAdd(sid, _ => new Session());
            s.Details = Json.Str(act?["details"]);
            s.State = Json.Str(act?["state"]);
            Log.Write($"[{sid}] SET_ACTIVITY details={s.Details ?? "-"} state={s.State ?? "-"}");
        }
        else if (op == OpFrame)
        {
            Log.Write($"[{sid}] FRAME cmd={Json.Str(msg["cmd"])}");
        }
    }

    static (uint Op, byte[] Body)? StubReply(uint op, JsonObject msg)
    {
        JsonNode? reply = op switch
        {
            OpHandshake => new JsonObject
            {
                ["cmd"] = "DISPATCH", ["evt"] = "READY", ["nonce"] = null,
                ["data"] = new JsonObject
                {
                    ["v"] = 1,
                    ["config"] = new JsonObject
                    {
                        ["cdn_host"] = "cdn.discordapp.com", ["api_endpoint"] = "//discord.com/api",
                        ["environment"] = "production",
                    },
                    ["user"] = new JsonObject
                    {
                        ["id"] = "0", ["username"] = "whatstatus", ["discriminator"] = "0", ["avatar"] = null,
                    },
                },
            },
            OpFrame => new JsonObject
            {
                ["cmd"] = msg["cmd"]?.DeepClone(), ["evt"] = null, ["nonce"] = msg["nonce"]?.DeepClone(),
                ["data"] = ((msg["args"] as JsonObject)?["activity"])?.DeepClone(),
            },
            OpPing => msg.DeepClone(),
            _ => null,
        };
        if (reply == null) return null;
        return (op == OpPing ? OpPong : OpFrame, Encoding.UTF8.GetBytes(reply.ToJsonString()));
    }

    static async Task<(uint Op, byte[] Body)> ReadFrameAsync(Stream s, CancellationToken ct)
    {
        byte[] header = new byte[8];
        await s.ReadExactlyAsync(header, ct);
        uint op = BinaryPrimitives.ReadUInt32LittleEndian(header);
        int len = (int)BinaryPrimitives.ReadUInt32LittleEndian(header.AsSpan(4));
        if (len is < 0 or > 1 << 20) throw new InvalidDataException("bad frame length");
        byte[] body = new byte[len];
        await s.ReadExactlyAsync(body, ct);
        return (op, body);
    }

    static async Task WriteFrameAsync(Stream s, uint op, byte[] body, CancellationToken ct)
    {
        // write header and body together, some clients read a frame in one go
        byte[] buf = new byte[8 + body.Length];
        BinaryPrimitives.WriteUInt32LittleEndian(buf, op);
        BinaryPrimitives.WriteUInt32LittleEndian(buf.AsSpan(4), (uint)body.Length);
        body.CopyTo(buf, 8);
        await s.WriteAsync(buf, ct);
        await s.FlushAsync(ct);
    }
}
