using System.Diagnostics;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Globalization;
using System.Runtime.InteropServices;

namespace WhatStatus;

sealed class Gui : Form
{
    const int W = 544, H = 355;
    enum Pg { Warn, Choose, Working, Done }

    static readonly Color Bg = Color.FromArgb(0x0F, 0x10, 0x14), Edge = Color.FromArgb(0x1C, 0x1E, 0x24),
        Card = Color.FromArgb(0x17, 0x18, 0x1D), Txt = Color.FromArgb(0xE8, 0xEA, 0xF0), Muted = Color.FromArgb(0x9A, 0xA0, 0xAE),
        Dim = Color.FromArgb(0x5C, 0x61, 0x70), Green = Color.FromArgb(0x25, 0xD3, 0x66), OnGreen = Color.FromArgb(0x06, 0x26, 0x0F),
        Line = Color.FromArgb(0x2A, 0x2C, 0x33), BtnTxt = Color.FromArgb(0xB4, 0xB9, 0xC6), Amber = Color.FromArgb(0xE8, 0xA3, 0x3D),
        Track = Color.FromArgb(0x1B, 0x1D, 0x23), Red = Color.FromArgb(0xE5, 0x5B, 0x5B);

    // Material Symbols codepoints
    const string GWarn = "", GGear = "", GSync = "", GDone = "", GDownload = "",
        GTrash = "", GBoxOff = "", GBoxOn = "", GMin = "", GClose = "";

    static readonly System.Drawing.Text.PrivateFontCollection Pfc = LoadFonts();

    static System.Drawing.Text.PrivateFontCollection LoadFonts()
    {
        var c = new System.Drawing.Text.PrivateFontCollection();
        foreach (var n in new[] { "Inter-Regular.ttf", "Inter-SemiBold.ttf", "MSym.ttf", "MSymF.ttf" })
        {
            using var s = typeof(Gui).Assembly.GetManifestResourceStream("font/" + n)!;
            var b = new byte[s.Length];
            s.ReadExactly(b);
            var h = Marshal.AllocHGlobal(b.Length); // must stay allocated
            Marshal.Copy(b, 0, h, b.Length);
            c.AddMemoryFont(h, b.Length);
        }
        return c;
    }

    static FontFamily Fam(string n) => Pfc.Families.FirstOrDefault(f => f.Name == n) ?? Pfc.Families.First(f => f.Name.StartsWith(n + " "));

    readonly Str t = Str.ForSystem();
    readonly Dictionary<string, float> hover = new();
    readonly float[] selAnim = { 1, 0 };
    readonly Stopwatch clock = Stopwatch.StartNew();
    readonly System.Windows.Forms.Timer timer = new() { Interval = 15 };

    Pg page = Pg.Warn;
    float pageT = 1;
    int sel;
    bool accepted;
    float shown, target, spin;
    float warnScroll, warnScrollTo, warnMax;
    volatile int stage;
    volatile bool finished;
    volatile bool ok;
    string? hot;
    double last;

    RectangleF rMin, rClose, rBack, rNext, rChk;
    readonly RectangleF[] rRows = new RectangleF[2];
    bool installed = Program.IsInstalled();
    string backText = "", nextText = "";
    bool backOn, nextOn;

    public static void Run()
    {
        Application.SetHighDpiMode(HighDpiMode.PerMonitorV2);
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new Gui());
    }

    float S => DeviceDpi / 96f;

    Gui()
    {
        FormBorderStyle = FormBorderStyle.None;
        StartPosition = FormStartPosition.CenterScreen;
        AutoScaleMode = AutoScaleMode.None;
        BackColor = Bg;
        base.Text = "WhatStatus";
        DoubleBuffered = true;
        SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.UserPaint | ControlStyles.OptimizedDoubleBuffer, true);
        ClientSize = new Size((int)(W * S), (int)(H * S));
        KeyPreview = true;
        timer.Tick += (_, _) => Tick();
        timer.Start();
    }

    protected override CreateParams CreateParams
    {
        get { var cp = base.CreateParams; cp.Style |= 0x20000; /* WS_MINIMIZEBOX */ return cp; }
    }

    [DllImport("dwmapi.dll")] static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int value, int size);
    [DllImport("user32.dll")] static extern bool ReleaseCapture();
    [DllImport("user32.dll")] static extern IntPtr SendMessage(IntPtr hwnd, int msg, IntPtr w, IntPtr l);

    protected override void OnHandleCreated(EventArgs e)
    {
        base.OnHandleCreated(e);
        int round = 2; DwmSetWindowAttribute(Handle, 33, ref round, 4); // rounded corners
        int dark = 1; DwmSetWindowAttribute(Handle, 20, ref dark, 4);
    }

    protected override void OnDpiChanged(DpiChangedEventArgs e)
    {
        base.OnDpiChanged(e);
        ClientSize = new Size((int)(W * S), (int)(H * S));
    }

    void SetPage(Pg p) { page = p; pageT = 0; if (p == Pg.Choose) installed = Program.IsInstalled(); }

    void Start()
    {
        SetPage(Pg.Working);
        shown = target = 0; stage = 0; finished = false; ok = false;
        bool remove = sel == 1;
        Program.Stage = s => stage = s;
        Task.Run(() =>
        {
            try { ok = (remove ? Program.Unpatch() : Program.Patch()) == 0; }
            catch (Exception e) { Log.Write("installer error: " + e); ok = false; }
            finished = true;
        });
    }

    void Back()
    {
        if (page == Pg.Warn) Close();
        else if (page == Pg.Choose) SetPage(Pg.Warn);
        else if (page == Pg.Done) SetPage(Pg.Choose);
    }

    void Next()
    {
        if (page == Pg.Warn) { if (accepted) SetPage(Pg.Choose); }
        else if (page == Pg.Choose) Start();
        else if (page == Pg.Done) Close();
    }

    void Tick()
    {
        double now = clock.Elapsed.TotalSeconds;
        float dt = (float)Math.Min(0.05, now - last);
        last = now;

        pageT = Math.Min(1, pageT + dt / 0.38f);
        spin = (spin + dt * 420) % 360;
        warnScroll += (warnScrollTo - warnScroll) * (1 - MathF.Exp(-dt * 14));
        for (int i = 0; i < 2; i++) selAnim[i] += ((sel == i ? 1 : 0) - selAnim[i]) * (1 - MathF.Exp(-dt * 16));
        foreach (var k in hover.Keys.ToList())
            hover[k] += ((hot == k ? 1 : 0) - hover[k]) * (1 - MathF.Exp(-dt * 18));

        if (page == Pg.Working)
        {
            if (!finished)
            {
                target = Math.Max(target, stage * 33f);
                target = Math.Min((stage + 1) * 33f - 5, target + dt * 7f);
            }
            else target = 100;
            shown += (target - shown) * (1 - MathF.Exp(-dt * 6));
            if (finished && shown > 99.3f) { shown = 100; SetPage(Pg.Done); }
        }
        Invalidate();
    }

    Point Logical(Point p) => new((int)(p.X / S), (int)(p.Y / S));

    string? HitTest(Point p)
    {
        var q = new PointF(p.X, p.Y);
        if (rClose.Contains(q)) return "close";
        if (rMin.Contains(q)) return "min";
        if (backOn && rBack.Contains(q)) return "back";
        if (nextOn && rNext.Contains(q)) return "next";
        if (page == Pg.Warn && rChk.Contains(q)) return "chk";
        if (page == Pg.Choose) for (int i = 0; i < 2; i++) if (rRows[i].Contains(q)) return "row" + i;
        return null;
    }

    protected override void OnMouseMove(MouseEventArgs e)
    {
        base.OnMouseMove(e);
        hot = HitTest(Logical(e.Location));
        if (hot != null && !hover.ContainsKey(hot)) hover[hot] = 0;
        Cursor = hot != null ? Cursors.Hand : Cursors.Default;
    }

    protected override void OnMouseWheel(MouseEventArgs e)
    {
        base.OnMouseWheel(e);
        if (page == Pg.Warn) warnScrollTo = Math.Clamp(warnScrollTo - e.Delta / 120f * 42, 0, warnMax);
    }

    protected override void OnMouseLeave(EventArgs e) { base.OnMouseLeave(e); hot = null; }

    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e);
        var p = Logical(e.Location);
        if (e.Button == MouseButtons.Left && p.Y < 40 && HitTest(p) == null)
        {
            ReleaseCapture();
            SendMessage(Handle, 0xA1, (IntPtr)2, IntPtr.Zero); // WM_NCLBUTTONDOWN, HTCAPTION
        }
    }

    protected override void OnMouseClick(MouseEventArgs e)
    {
        base.OnMouseClick(e);
        if (e.Button != MouseButtons.Left) return;
        switch (HitTest(Logical(e.Location)))
        {
            case "close": Close(); break;
            case "min": WindowState = FormWindowState.Minimized; break;
            case "back": Back(); break;
            case "next": Next(); break;
            case "chk": accepted = !accepted; break;
            case "row0": sel = 0; break;
            case "row1": sel = 1; break;
        }
    }

    // arrow and page keys never reach OnKeyDown on a form, they're eaten as dialog keys
    protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
    {
        if (page == Pg.Warn && keyData is Keys.Down or Keys.Up or Keys.PageDown or Keys.PageUp)
        {
            float step = keyData is Keys.PageDown or Keys.PageUp ? 130 : 42;
            warnScrollTo = Math.Clamp(warnScrollTo + (keyData is Keys.Down or Keys.PageDown ? step : -step), 0, warnMax);
            return true;
        }
        return base.ProcessCmdKey(ref msg, keyData);
    }

    protected override void OnKeyDown(KeyEventArgs e)
    {
        base.OnKeyDown(e);
        if (e.KeyCode == Keys.Enter && nextOn) Next();
        else if (e.KeyCode == Keys.Escape && backOn) Back();
        else if (e.KeyCode == Keys.Space && page == Pg.Warn) accepted = !accepted;
        else if (page == Pg.Choose && e.KeyCode == Keys.Down) sel = Math.Min(1, sel + 1);
        else if (page == Pg.Choose && e.KeyCode == Keys.Up) sel = Math.Max(0, sel - 1);
    }

    float pa = 1; // page alpha

    static Color A(Color c, float a) => Color.FromArgb((int)Math.Clamp(c.A * a, 0, 255), c);
    static Color Mix(Color a, Color b, float k) => Color.FromArgb(
        (int)(a.R + (b.R - a.R) * k), (int)(a.G + (b.G - a.G) * k), (int)(a.B + (b.B - a.B) * k));
    float Hv(string k) => hover.TryGetValue(k, out var v) ? v : 0;

    static GraphicsPath Round(RectangleF r, float rad)
    {
        var p = new GraphicsPath();
        float d = rad * 2;
        p.AddArc(r.X, r.Y, d, d, 180, 90);
        p.AddArc(r.Right - d, r.Y, d, d, 270, 90);
        p.AddArc(r.Right - d, r.Bottom - d, d, d, 0, 90);
        p.AddArc(r.X, r.Bottom - d, d, d, 90, 90);
        p.CloseFigure();
        return p;
    }

    void Fill(Graphics g, RectangleF r, float rad, Color c)
    {
        if (c.A == 0) return;
        if (rad < 0.5f) { using var fb = new SolidBrush(c); g.FillRectangle(fb, r); return; }
        using var path = Round(r, rad);
        using var b = new SolidBrush(c);
        g.FillPath(b, path);
    }

    static readonly StringFormat Lft = new(StringFormat.GenericTypographic) { LineAlignment = StringAlignment.Center, FormatFlags = StringFormatFlags.NoWrap | StringFormatFlags.MeasureTrailingSpaces };
    static readonly StringFormat Mid = new(StringFormat.GenericTypographic) { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center, FormatFlags = StringFormatFlags.NoWrap };
    static readonly StringFormat Wrap = new(StringFormat.GenericDefault) { Trimming = StringTrimming.None };

    Font Ui(float px, bool semi = false) => new(Fam(semi ? "InterSemi" : "Inter"), px, FontStyle.Regular, GraphicsUnit.Pixel);
    Font Ic(float px, string glyph) => new(Fam(glyph is GWarn or GDone or GBoxOff or GBoxOn ? "MSymF" : "MSym"), px, FontStyle.Regular, GraphicsUnit.Pixel);

    void Draw(Graphics g, string s, Font f, Color c, RectangleF r, StringFormat? sf = null)
    {
        using var b = new SolidBrush(c);
        g.DrawString(s, f, b, r, sf ?? Lft);
    }

    float MeasureWrap(Graphics g, string s, Font f, float width) => g.MeasureString(s, f, (int)width, Wrap).Height;

    protected override void OnPaint(PaintEventArgs e)
    {
        var g = e.Graphics;
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.TextRenderingHint = TextRenderingHint.AntiAlias;
        g.Clear(Bg);
        g.ScaleTransform(S, S);
        using (var pen = new Pen(Edge)) g.DrawRectangle(pen, 0, 0, W - 1, H - 1);

        float ease = 1 - MathF.Pow(1 - pageT, 3);
        pa = ease;

        rMin = new RectangleF(W - 88, 0, 44, 40);
        rClose = new RectangleF(W - 44, 0, 44, 40);
        using (var f = Ic(14, GMin))
        {
            float hm = Hv("min"), hc = Hv("close");
            Fill(g, new RectangleF(rMin.X, rMin.Y, rMin.Width, rMin.Height), 0, A(Color.FromArgb(0x25, 0x27, 0x2D), hm));
            Fill(g, new RectangleF(rClose.X, rClose.Y, rClose.Width, rClose.Height), 0, A(Color.FromArgb(0xC4, 0x2B, 0x1C), hc));
            Draw(g, GMin, f, Mix(Muted, Txt, hm), rMin, Mid);
            Draw(g, GClose, f, Mix(Muted, Color.White, hc), rClose, Mid);
        }

        string hdr = page switch { Pg.Warn => t.Warn, Pg.Choose => t.Choose, Pg.Working => t.Working, _ => ok ? t.Done : t.Fail };
        string hdrIcon = page switch { Pg.Warn => GWarn, Pg.Choose => GGear, Pg.Working => GSync, _ => ok ? GDone : GWarn };
        using (var f = Ic(24, hdrIcon)) Draw(g, hdrIcon, f, page == Pg.Done && !ok ? Amber : Green, new RectangleF(19, 44, 26, 32), Mid);
        using (var f = Ui(17, true)) Draw(g, hdr, f, Txt, new RectangleF(55, 44, 440, 32));

        var state = g.Save();
        g.TranslateTransform((1 - ease) * 18, 0);
        switch (page)
        {
            case Pg.Warn: DrawWarn(g); break;
            case Pg.Choose: DrawChoose(g); break;
            case Pg.Working: DrawWorking(g); break;
            default: DrawDone(g); break;
        }
        g.Restore(state);
        pa = 1;

        DrawFooter(g);
    }

    void DrawWarn(Graphics g)
    {
        using var f = Ui(13);
        using var fb = Ui(13, true);
        var card = new RectangleF(19, 90, 506, 150);
        Fill(g, card, 4, A(Card, pa));

        var saved = g.Save();
        g.SetClip(card);
        const float x = 37, w = 462;
        float top = card.Y + 14, y = top - warnScroll;
        float h = MeasureWrap(g, t.WarnBody, f, w);
        Draw(g, t.WarnBody, f, A(BtnTxt, pa), new RectangleF(x, y, w, h + 4), Wrap);
        y += h + 12;
        foreach (var (title, text) in t.Risks)
        {
            float th = MeasureWrap(g, title, fb, w);
            Draw(g, title, fb, A(Txt, pa), new RectangleF(x, y, w, th + 4), Wrap);
            y += th + 1;
            float dh = MeasureWrap(g, text, f, w);
            Draw(g, text, f, A(Muted, pa), new RectangleF(x, y, w, dh + 4), Wrap);
            y += dh + 10;
        }
        float content = y + warnScroll - top;
        warnMax = Math.Max(0, content - (card.Height - 14));
        warnScrollTo = Math.Min(warnScrollTo, warnMax);
        if (warnMax > 0 && warnScroll < warnMax - 2)
        {
            var fade = new RectangleF(card.X, card.Bottom - 36, card.Width, 36);
            using var lg = new LinearGradientBrush(fade, Color.FromArgb(0, Card), A(Card, pa), LinearGradientMode.Vertical);
            g.FillRectangle(lg, fade.X, fade.Y + 1, fade.Width, fade.Height - 1);
        }
        g.Restore(saved);
        if (warnMax > 0)
        {
            float view = card.Height - 8, thumb = Math.Max(24, view * (card.Height / (content + 14)));
            float ty = card.Y + 4 + (view - thumb) * (warnScroll / warnMax);
            Fill(g, new RectangleF(card.Right - 7, ty, 3, thumb), 1.5f, A(Color.FromArgb(0x3A, 0x3D, 0x46), pa));
        }

        rChk = new RectangleF(19, card.Bottom + 12, 506, 40);
        float hv = Hv("chk");
        Fill(g, rChk, 4, A(Mix(Card, Color.FromArgb(0x1E, 0x20, 0x26), hv), pa));
        using (var ic = Ic(24, accepted ? GBoxOn : GBoxOff)) Draw(g, accepted ? GBoxOn : GBoxOff, ic, A(accepted ? Green : Color.FromArgb(0x7B, 0x81, 0x90), pa), new RectangleF(31, rChk.Y, 26, 40), Mid);
        using (var lf = Ui(14, true)) Draw(g, t.WarnCheck, lf, A(Txt, pa), new RectangleF(68, rChk.Y, 440, 40));
    }

    void DrawChoose(Graphics g)
    {
        string[] labels = { installed ? t.Update : t.Install, t.Remove };
        string[] icons = { GDownload, GTrash };
        for (int i = 0; i < 2; i++)
        {
            float hv = Hv("row" + i), sa = selAnim[i];
            var r = new RectangleF(19, 90 + i * 52, 506, 40);
            rRows[i] = r;
            var rr = new RectangleF(r.X + 2 * hv, r.Y, r.Width, r.Height);
            Fill(g, rr, 4, A(Mix(Mix(Card, Color.FromArgb(0x1D, 0x1F, 0x25), hv), Green, sa), pa));
            Color ink = Mix(BtnTxt, OnGreen, sa);
            using (var ic = Ic(22, icons[i])) Draw(g, icons[i], ic, A(ink, pa), new RectangleF(rr.X + 14, rr.Y, 26, 40), Mid);
            using (var lf = Ui(15, true)) Draw(g, labels[i], lf, A(ink, pa), new RectangleF(rr.X + 51, rr.Y, 440, 40));
        }
    }

    void DrawWorking(Graphics g)
    {
        Fill(g, new RectangleF(19, 90, 506, 8), 4, A(Track, pa));
        float w = Math.Max(8, 506 * shown / 100f);
        Fill(g, new RectangleF(19, 90, w, 8), 4, A(Green, pa));

        string[] steps = sel == 1 ? t.RSteps : t.Steps;
        int cur = finished ? 3 : Math.Min(2, stage);
        for (int i = 0; i < 3; i++)
        {
            float y = 120 + i * 32;
            bool done = i < cur, active = i == cur;
            var ir = new RectangleF(19, y, 22, 22);
            if (done) { using var ic = Ic(22, GDone); Draw(g, GDone, ic, A(Green, pa), ir, Mid); }
            else if (active)
            {
                using var pen = new Pen(A(Txt, pa), 2.2f) { StartCap = LineCap.Round, EndCap = LineCap.Round };
                g.DrawArc(pen, ir.X + 3, ir.Y + 3, 16, 16, spin, 250);
            }
            else { using var pen = new Pen(A(Dim, pa), 1.8f); g.DrawEllipse(pen, ir.X + 3, ir.Y + 3, 16, 16); }
            using var lf = Ui(14);
            Draw(g, steps[i], lf, A(done ? Green : active ? Txt : Dim, pa), new RectangleF(51, y - 4, 440, 30));
        }
    }

    void DrawDone(Graphics g)
    {
        string title = ok ? (sel == 1 ? t.DoneRemove : t.DoneInstall) : t.FailTitle;
        string hint = ok ? (sel == 1 ? t.HintRemove : t.HintInstall) : t.FailHint;
        using var hf = Ui(13);
        float hh = MeasureWrap(g, hint, hf, 430);
        var card = new RectangleF(19, 90, 506, 18 + 22 + 4 + hh + 18);
        Fill(g, card, 4, A(Card, pa));
        using (var ic = Ic(28, ok ? GDone : GWarn)) Draw(g, ok ? GDone : GWarn, ic, A(ok ? Green : Amber, pa), new RectangleF(35, 100, 32, 34), Mid);
        using (var tf = Ui(15, true)) Draw(g, title, tf, A(Txt, pa), new RectangleF(77, 104, 430, 22));
        Draw(g, hint, hf, A(Muted, pa), new RectangleF(77, 130, 430, hh + 4), Wrap);
    }

    void DrawFooter(Graphics g)
    {
        backText = page == Pg.Warn ? t.Quit : t.Back;
        nextText = page == Pg.Done ? t.Close : t.Next;
        backOn = page != Pg.Working;
        nextOn = page == Pg.Warn ? accepted : page != Pg.Working;
        if (page == Pg.Working) { hot = null; }

        using var f = Ui(13, true);
        float bw = g.MeasureString(backText, f, 400, StringFormat.GenericTypographic).Width + 34;
        float nw = g.MeasureString(nextText, f, 400, StringFormat.GenericTypographic).Width + 34;
        float y = H - 19 - 32;
        rNext = new RectangleF(W - 19 - nw, y, nw, 32);
        rBack = new RectangleF(rNext.X - 10 - bw, y, bw, 32);

        float hb = backOn ? Hv("back") : 0, hn = nextOn ? Hv("next") : 0;
        float ba = backOn ? 1 : .35f, na = nextOn ? 1 : .45f;
        Fill(g, rBack, 4, A(Card, hb * ba));
        using (var path = Round(rBack, 4)) using (var pen = new Pen(A(Line, ba))) g.DrawPath(pen, path);
        Draw(g, backText, f, A(BtnTxt, ba), rBack, Mid);
        Fill(g, rNext, 4, A(Mix(Green, Color.FromArgb(0x4B, 0xE0, 0x84), hn), na));
        Draw(g, nextText, f, A(OnGreen, na), rNext, Mid);
    }

    sealed class Str
    {
        public string Warn = "", Choose = "", Working = "", Done = "", Fail = "", Install = "", Update = "", Remove = "", Quit = "", Back = "", Next = "", Close = "",
            DoneInstall = "", DoneRemove = "", HintInstall = "", HintRemove = "", WarnBody = "", WarnCheck = "", FailTitle = "", FailHint = "";
        public string[] Steps = Array.Empty<string>(), RSteps = Array.Empty<string>();
        public (string Title, string Text)[] Risks = Array.Empty<(string, string)>();

        public static Str ForSystem()
        {
            string l = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName.ToLowerInvariant();
            return l switch { "es" => Es, "fr" => Fr, "ca" => Ca, _ => En };
        }

        static readonly Str En = new()
        {
            Warn = "Disclaimer", Choose = "Choose an Action", Working = "Working…", Done = "All done", Fail = "Something went wrong",
            Install = "Install", Update = "Update", Remove = "Uninstall", Quit = "Quit", Back = "Back", Next = "Next", Close = "Close",
            Steps = new[] { "Installing files", "Waiting for admin permission", "Restarting WhatsApp" },
            RSteps = new[] { "Removing files", "Waiting for admin permission", "Restarting WhatsApp" },
            DoneInstall = "WhatStatus is installed", DoneRemove = "WhatStatus uninstalled",
            HintInstall = "Open WhatsApp › Settings › Status to choose what it shows.", HintRemove = "WhatsApp is back to normal.",
            WarnBody = "Patching WhatsApp is against WhatsApp’s Terms of Service. Using this tool may lead to account restrictions or bans. I (the developer) am not responsible for any account bans, restrictions or other consequences. Use at your own risk.",
            WarnCheck = "I understand and accept the risk",
            Risks = new[]
            {
                ("Game status", "Changes your About when you start or stop a game. Your contacts can see what you play."),
                ("Spotify status (off by default)", "Changes your About on every song, about 20 times an hour while you listen. This is the riskiest feature and makes your account look automated."),
                ("Time between updates", "Lower values update faster but look less human. Under 30 seconds raises the risk of a ban."),
                ("Discord connection", "WhatStatus takes over Discord's game connection to see what you play. If Discord isn't running, games may act as if it were."),
                ("Auto-update", "While WhatsApp is open, WhatStatus downloads and installs new versions from GitHub on its own."),
                ("The patch", "Needs admin permission once to change a WebView2 setting for WhatsApp, and runs extra code inside WhatsApp."),
            },
            FailTitle = "Something went wrong", FailHint = "Admin permission was refused, or WhatsApp could not be patched. Nothing was changed that you can’t undo with Uninstall.",
        };

        static readonly Str Es = new()
        {
            Warn = "Aviso legal", Choose = "Elige una acción", Working = "Trabajando…", Done = "Todo listo", Fail = "Algo salió mal",
            Install = "Instalar", Update = "Actualizar", Remove = "Desinstalar", Quit = "Salir", Back = "Atrás", Next = "Siguiente", Close = "Cerrar",
            Steps = new[] { "Instalando archivos", "Esperando permiso de administrador", "Reiniciando WhatsApp" },
            RSteps = new[] { "Quitando archivos", "Esperando permiso de administrador", "Reiniciando WhatsApp" },
            DoneInstall = "WhatStatus instalado", DoneRemove = "WhatStatus desinstalado",
            HintInstall = "Abre WhatsApp › Ajustes › Estado para elegir qué se muestra.", HintRemove = "WhatsApp vuelve a la normalidad.",
            WarnBody = "Parchear WhatsApp va en contra de los Términos del Servicio de WhatsApp. Usar esta herramienta puede provocar restricciones o bloqueos de tu cuenta. Yo (el desarrollador) no me hago responsable de bloqueos, restricciones ni otras consecuencias. Úsalo bajo tu propia responsabilidad.",
            WarnCheck = "Entiendo y acepto el riesgo",
            Risks = new[]
            {
                ("Estado de juego", "Cambia tu Info cuando empiezas o dejas un juego. Tus contactos ven a qué juegas."),
                ("Estado de Spotify (desactivado por defecto)", "Cambia tu Info con cada canción, unas 20 veces por hora mientras escuchas. Es la función más arriesgada y hace que tu cuenta parezca automatizada."),
                ("Tiempo entre actualizaciones", "Valores bajos actualizan antes pero parecen menos humanos. Menos de 30 segundos aumenta el riesgo de bloqueo."),
                ("Conexión con Discord", "WhatStatus ocupa la conexión de juegos de Discord para ver a qué juegas. Si Discord no está abierto, los juegos pueden creer que sí lo está."),
                ("Actualizaciones automáticas", "Mientras WhatsApp está abierto, WhatStatus descarga e instala versiones nuevas desde GitHub por su cuenta."),
                ("El parche", "Necesita permiso de administrador una vez para cambiar un ajuste de WebView2 de WhatsApp, y ejecuta código extra dentro de WhatsApp."),
            },
            FailTitle = "Algo salió mal", FailHint = "Se rechazó el permiso de administrador o no se pudo parchear WhatsApp. Todo lo que se haya cambiado se deshace con Desinstalar.",
        };

        static readonly Str Fr = new()
        {
            Warn = "Avertissement", Choose = "Choisis une action", Working = "En cours…", Done = "Terminé", Fail = "Une erreur est survenue",
            Install = "Installer", Update = "Mettre à jour", Remove = "Désinstaller", Quit = "Quitter", Back = "Retour", Next = "Suivant", Close = "Fermer",
            Steps = new[] { "Installation des fichiers", "Autorisation administrateur", "Redémarrage de WhatsApp" },
            RSteps = new[] { "Suppression des fichiers", "Autorisation administrateur", "Redémarrage de WhatsApp" },
            DoneInstall = "WhatStatus est installé", DoneRemove = "WhatStatus désinstallé",
            HintInstall = "Ouvre WhatsApp › Paramètres › Statut pour choisir ce qui s’affiche.", HintRemove = "WhatsApp est revenu à la normale.",
            WarnBody = "Patcher WhatsApp va à l’encontre des Conditions d’utilisation de WhatsApp. Utiliser cet outil peut entraîner des restrictions ou des bannissements de ton compte. Je (le développeur) ne suis pas responsable des bannissements, restrictions ou autres conséquences. À utiliser à tes risques.",
            WarnCheck = "Je comprends et j’accepte le risque",
            Risks = new[]
            {
                ("Statut de jeu", "Change ton Actu quand tu lances ou quittes un jeu. Tes contacts voient à quoi tu joues."),
                ("Statut Spotify (désactivé par défaut)", "Change ton Actu à chaque morceau, environ 20 fois par heure pendant l’écoute. C’est la fonction la plus risquée et ton compte peut sembler automatisé."),
                ("Délai entre les mises à jour", "Des valeurs basses vont plus vite mais semblent moins humaines. Moins de 30 secondes augmente le risque de bannissement."),
                ("Connexion Discord", "WhatStatus prend la connexion de jeu de Discord pour voir à quoi tu joues. Si Discord n’est pas lancé, les jeux peuvent croire qu’il l’est."),
                ("Mises à jour automatiques", "Quand WhatsApp est ouvert, WhatStatus télécharge et installe tout seul les nouvelles versions depuis GitHub."),
                ("Le patch", "Demande une fois l’autorisation administrateur pour modifier un réglage WebView2 de WhatsApp, et exécute du code en plus dans WhatsApp."),
            },
            FailTitle = "Une erreur est survenue", FailHint = "L’autorisation administrateur a été refusée ou WhatsApp n’a pas pu être patché. Tout ce qui a été modifié s’annule avec Désinstaller.",
        };

        static readonly Str Ca = new()
        {
            Warn = "Avís legal", Choose = "Tria una acció", Working = "Treballant…", Done = "Tot fet", Fail = "Alguna cosa ha anat malament",
            Install = "Instal·la", Update = "Actualitza", Remove = "Desinstal·la", Quit = "Surt", Back = "Enrere", Next = "Següent", Close = "Tanca",
            Steps = new[] { "Instal·lant fitxers", "Esperant permís d’administrador", "Reiniciant WhatsApp" },
            RSteps = new[] { "Eliminant fitxers", "Esperant permís d’administrador", "Reiniciant WhatsApp" },
            DoneInstall = "WhatStatus instal·lat", DoneRemove = "WhatStatus desinstal·lat",
            HintInstall = "Obre WhatsApp › Configuració › Estat per triar què es mostra.", HintRemove = "WhatsApp torna a la normalitat.",
            WarnBody = "Aplicar un pedaç a WhatsApp va en contra dels Termes del Servei de WhatsApp. Utilitzar aquesta eina pot provocar restriccions o bloquejos del teu compte. Jo (el desenvolupador) no em faig responsable de bloquejos, restriccions ni altres conseqüències. Usa-ho sota la teva responsabilitat.",
            WarnCheck = "Entenc i accepto el risc",
            Risks = new[]
            {
                ("Estat del joc", "Canvia la teva Info quan comences o deixes un joc. Els teus contactes veuen a què jugues."),
                ("Estat de Spotify (desactivat per defecte)", "Canvia la teva Info a cada cançó, unes 20 vegades per hora mentre escoltes. És la funció més arriscada i fa que el compte sembli automatitzat."),
                ("Temps entre actualitzacions", "Valors baixos actualitzen abans però semblen menys humans. Menys de 30 segons augmenta el risc de bloqueig."),
                ("Connexió amb Discord", "WhatStatus ocupa la connexió de jocs de Discord per veure a què jugues. Si Discord no està obert, els jocs poden creure que sí que ho està."),
                ("Actualitzacions automàtiques", "Mentre WhatsApp està obert, WhatStatus descarrega i instal·la versions noves des de GitHub pel seu compte."),
                ("El pedaç", "Necessita permís d’administrador un cop per canviar un ajust de WebView2 de WhatsApp, i executa codi addicional dins de WhatsApp."),
            },
            FailTitle = "Alguna cosa ha anat malament", FailHint = "S’ha rebutjat el permís d’administrador o no s’ha pogut aplicar el pedaç a WhatsApp. Tot el que s’hagi canviat es desfà amb Desinstal·la.",
        };
    }
}
