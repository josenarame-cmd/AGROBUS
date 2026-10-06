import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sprout, ArrowRight, Sun, Moon, Wifi, Landmark, Tractor, BarChart3, ShieldCheck, Smartphone, Phone, CheckCircle2 } from "lucide-react";

/* ─── Dark mode ─────────────────────────────────────────────────── */
function useDark() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("agb-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("agb-theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, setDark] as const;
}

/* ─── Data ──────────────────────────────────────────────────────── */
const FEATURES = [
  { title: "Agricultural Credit", desc: "Apply for input loans and track every stage of your approval in real time." },
  { title: "Farm Management", desc: "Register plots, log crop cycles and organise all farm data securely." },
  { title: "Smart Analytics", desc: "Visualise credit scores, repayment trends and harvest performance." },
  { title: "USSD / SMS Access", desc: "No internet needed. Access core services on any phone via *810#." },
];

const FEATURES_RICH = [
  {
    icon: Landmark,
    accent: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50/60 dark:bg-emerald-900/10",
    title: "Agricultural Credit",
    desc: "Apply for input loans, receive instant status updates, and manage repayments — all without visiting a branch.",
    stat: "5,000+",
    statLabel: "Loans processed",
  },
  {
    icon: Tractor,
    accent: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
    bg: "bg-teal-50/60 dark:bg-teal-900/10",
    title: "Farm Management",
    desc: "Register multiple plots, map GPS coordinates, log crop cycles, and keep your agricultural history in one place.",
    stat: "30",
    statLabel: "Districts covered",
  },
  {
    icon: BarChart3,
    accent: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50/60 dark:bg-blue-900/10",
    title: "Smart Analytics",
    desc: "Live dashboards for credit scores, repayment history, harvest yields, and financial performance at a glance.",
    stat: "94%",
    statLabel: "Repayment rate",
  },
  {
    icon: Wifi,
    accent: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-50/60 dark:bg-cyan-900/10",
    title: "IoT Integration",
    desc: "Connect soil sensors and weather stations. Receive precision field data directly inside your farm profile.",
    stat: "4",
    statLabel: "Sensor types supported",
  },
  {
    icon: Smartphone,
    accent: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
    bg: "bg-violet-50/60 dark:bg-violet-900/10",
    title: "USSD / SMS Access",
    desc: "No smartphone? No problem. Access credit status and farm records on any basic phone via *810#.",
    stat: "*810#",
    statLabel: "USSD shortcode",
  },
  {
    icon: ShieldCheck,
    accent: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50/60 dark:bg-rose-900/10",
    title: "Bank-grade Security",
    desc: "JWT tokens, role-based permissions, and encrypted communications protect every farmer's data.",
    stat: "256-bit",
    statLabel: "Encryption standard",
  },
];

const TESTIMONIALS = [
  { name: "Uwimana Diane", loc: "Musanze", text: "I got fertiliser on credit before the season and repaid after harvest. The process was seamless." },
  { name: "Habimana J.P.", loc: "Huye", text: "Checking my loan balance from my phone changed everything. My agent now comes to me." },
  { name: "Mukamana Solange", loc: "Rwamagana", text: "My credit score improved every season. AGROBUS gave me the tools to build trust." },
];

/* ─── Component ─────────────────────────────────────────────────── */
export default function LandingPage() {
  const [dark, setDark] = useDark();
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const fn = () => setPinned(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="bg-background text-foreground antialiased transition-colors duration-400">

      {/* ── Navbar ────────────────────────────────────────────── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${pinned ? "bg-surface-50/80 dark:bg-surface-900/80 backdrop-blur-2xl border-b border-border shadow-sm" : "bg-transparent"
        }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary-500/20 text-primary-foreground">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight text-foreground">AGRO<span className="text-primary-500">BUS</span></span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-10">
            <Link to="/features" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <a href="#app" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">App</a>
            <a href="#smart-farm" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Smart Farm</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => setDark(d => !d)} aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/login" className="hidden sm:block text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
              Sign in
            </Link>
            <Link to="/login"
              className="group flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5">
              Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden pb-12 pt-32">
        {/* BG image */}
        <img
          src="/farmer-digital.jpg"
          alt="Rwandan farmer with tablet"
          className="absolute inset-0 h-full w-full object-cover object-center scale-105 animate-hero-zoom"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface-950/90 via-surface-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/40 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary-300">Agricultural Platform · Rwanda</p>
            <h1 className="text-6xl font-black leading-[1.05] text-white sm:text-7xl">
              Farming,<br />
              <span className="bg-gradient-to-r from-primary-200 to-primary-400 bg-clip-text text-transparent">Reimagined.</span>
            </h1>
            <p className="mt-8 text-lg text-surface-200 font-medium leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: '500ms' }}>
              AGROBUS connects farmers, agro-dealers and field agents —
              making agricultural credit, farm management,
              and smart monitoring seamlessly accessible
              across all of Rwanda.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <Link to="/login"
                className="group flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_8px_32px_rgba(74,134,89,0.3)] transition-all hover:-translate-y-1 hover:bg-primary-500 hover:shadow-[0_12px_40px_rgba(74,134,89,0.4)]">
                Start for free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/features"
                className="flex items-center gap-3 rounded-full border border-surface-200/20 bg-surface-50/10 hover:bg-surface-50/20 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:-translate-y-1">
                Explore features
              </Link>
            </div>
          </div>
          {/* Stats */}
          <div className="mt-24 grid grid-cols-3 max-w-md gap-10 opacity-0 animate-fade-in" style={{ animationDelay: '800ms' }}>
            {[["5,000+", "Farmers"], ["30", "Districts"], ["94%", "Repayment"]].map(([n, l]) => (
              <div key={l} className="border-l-2 border-primary-500/30 pl-4">
                <p className="text-3xl font-black text-white">{n}</p>
                <p className="text-sm font-bold uppercase tracking-widest text-surface-300 mt-2">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="py-32 px-6">
        <div className="mx-auto max-w-7xl">
          {/* Header — centered */}
          <div className="mb-24 text-center">
            <h2 className="text-4xl font-black text-foreground sm:text-5xl leading-tight tracking-tight mb-4">
              Platform Capabilities
            </h2>
            <p className="text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-6">
              Built for every stage of the agricultural cycle.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              From your first loan application to real-time IoT monitoring — one platform integrates every tool you need to manage your agricultural operations.
            </p>
          </div>

          {/* Uniform 3-col grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Landmark, gradient: 'from-primary-400 to-primary-300', iconBg: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400', statColor: 'text-primary-600 dark:text-primary-400', title: 'Agricultural Credit', desc: 'Apply for loans and manage repayments seamlessly.', stat: '5,000+', label: 'Loans processed' },
              { icon: Tractor, gradient: 'from-surface-400 to-surface-300', iconBg: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300', statColor: 'text-surface-700 dark:text-surface-300', title: 'Farm Management', desc: 'Map GPS coordinates and log crop cycles easily.', stat: '30', label: 'Districts' },
              { icon: BarChart3, gradient: 'from-blue-400 to-blue-300', iconBg: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', statColor: 'text-blue-600 dark:text-blue-400', title: 'Smart Analytics', desc: 'Live dashboards for credit scores and yields.', stat: '94%', label: 'Repayment rate' },
              { icon: Smartphone, gradient: 'from-violet-400 to-violet-300', iconBg: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400', statColor: 'text-violet-600 dark:text-violet-400', title: 'USSD & Mobile', desc: 'Access credit status offline via *810# shortcode.', stat: '*810#', label: 'USSD code' },
              { icon: ShieldCheck, gradient: 'from-rose-400 to-rose-300', iconBg: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400', statColor: 'text-rose-600 dark:text-rose-400', title: 'Bank-grade Security', desc: 'Role-based permissions protect every transaction.', stat: '256-bit', label: 'Encryption' },
            ].map(({ icon: Icon, gradient, iconBg, statColor, title, desc, stat, label }) => (
              <div key={title} className="relative flex flex-col justify-between rounded-3xl bg-card border border-border p-8 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
                <div>
                  <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
                <div className="mt-8 border-t border-border pt-5">
                  <p className={`text-3xl font-black ${statColor} tracking-tight`}>{stat}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Showcase ──────────────────────────────────────── */}
      <section id="app" className="overflow-hidden py-32 px-6 bg-secondary/50">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Text */}
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-4">Mobile Dashboard</p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">Your farm,<br />in your pocket.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
                Real-time credit scores, loan tracking, and farm performance — beautifully arranged for any screen size, giving you absolute control anywhere.
              </p>
              <ul className="space-y-5 mb-12">
                {["Live credit score updates", "Loan application tracking", "Google sign-in supported", "Works offline via USSD"].map(item => (
                  <li key={item} className="flex items-center gap-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span className="text-base font-semibold text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/login"
                className="inline-flex items-center gap-3 rounded-xl bg-primary hover:bg-primary/90 px-8 py-4 text-base font-bold text-primary-foreground transition-all hover:-translate-y-1 shadow-lg shadow-primary/20">
                Open dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            {/* Phone (Impressive 3D Presentation) */}
            <div className="flex justify-center lg:justify-end perspective-[2000px]">
              <div className="relative group cursor-pointer p-4">
                {/* Glowing backdrop */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-400/40 to-teal-400/20 blur-[80px] opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                {/* Image with 3D rotation */}
                <img
                  src="/phone-mockup.jpg"
                  alt="AGROBUS dashboard on mobile"
                  className="relative w-64 sm:w-[22rem] rounded-[3rem] border-[8px] border-surface-900 shadow-[0_30px_60px_rgba(0,0,0,0.4)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.8)] object-cover transition-all duration-700 ease-out"
                  style={{ transform: 'perspective(1400px) rotateY(-18deg) rotateX(8deg)' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'perspective(2000px) rotateY(0deg) rotateX(0deg)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'perspective(1400px) rotateY(-18deg) rotateX(8deg)'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IoT Section ───────────────────────────────────────── */}
      <section id="smart-farm" className="relative py-32 px-6 overflow-hidden">
        {/* BG */}
        <img src="/iot-device.jpg" alt="IoT farm device" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image card (Impressive floating effect) */}
            <div className="relative group cursor-pointer">
              {/* Glowing backdrop */}
              <div className="absolute -inset-5 rounded-full bg-gradient-to-tr from-cyan-400/30 to-blue-500/30 blur-[50px] opacity-30 group-hover:opacity-60 group-hover:blur-[60px] transition-all duration-500" />
              <img
                src="/iot-device.jpg"
                alt="Smart farm IoT sensor"
                className="relative w-full rounded-[2.5rem] border-2 border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] object-cover aspect-[4/3] group-hover:-translate-y-2 transition-transform duration-500"
              />
              {/* Live data overlay */}
              <div className="absolute -bottom-6 -right-6 rounded-3xl bg-surface-900/60 border border-white/10 backdrop-blur-2xl p-6 w-64 shadow-2xl group-hover:translate-y-[-8px] transition-all duration-300">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-300 mb-5 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  Live sensor data
                </p>
                {[["Soil Temp", "22.4°C"], ["Moisture", "48%"], ["Wind Speed", "12 km/h"], ["Solar Power", "98%"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center mb-3 last:mb-0">
                    <span className="text-sm font-medium text-surface-200">{k}</span>
                    <span className="text-base font-black text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Text */}
            <div className="lg:pl-12 text-white">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 mb-6">
                <Wifi className="h-3 w-3" /> Coming Soon
              </span>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                The future of farming<br />
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">is connected.</span>
              </h2>
              <p className="text-lg text-surface-200 leading-relaxed mb-8 max-w-lg">
                AGROBUS Smart Farm integrates soil sensors, weather stations, and automated irrigation directly into your dashboard — autonomously powered by solar.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                {["Soil sensors", "Weather stations", "Solar nodes", "AI crop insights"].map(t => (
                  <div key={t} className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-md px-4 py-3">
                    <p className="text-sm font-semibold text-white">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-surface-50">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-primary-500 mb-3">Stories</p>
            <h2 className="text-4xl font-black text-foreground">Trusted across Rwanda.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map(({ name, loc, text }) => (
              <div key={name}
                className="rounded-3xl border border-border bg-card p-8 shadow-sm">
                <p className="text-base text-muted-foreground leading-relaxed italic mb-8">"{text}"</p>
                <div className="flex items-center gap-4 border-t border-border pt-6">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0 shadow-inner">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{name}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <img src="/farmer-digital.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-top scale-105" />
        <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm" />
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to grow with <span className="text-primary-400">AGROBUS</span>?
          </h2>
          <p className="text-lg text-surface-200 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join thousands of Rwandan farmers accessing credit, managing farms, and building a prosperous future with professional-grade tools.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-3 rounded-2xl bg-primary hover:bg-primary-400 px-8 py-4 text-base font-bold text-primary-foreground transition-all shadow-[0_8px_32px_rgba(74,134,89,0.3)] hover:-translate-y-1">
            Create free account <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-surface-400">Free for farmers · No credit card · Google sign-in supported</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-card border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sprout className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-black tracking-tight text-foreground">AGROBUS</span>
            <span className="text-xs font-semibold text-muted-foreground ml-2 hidden sm:inline">· Professional Agricultural Credit</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <Link to="/login" className="hover:text-primary transition-colors">Sign in</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Register</Link>
            <span>© {new Date().getFullYear()} AGROBUS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
