import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sprout, ArrowRight, Sun, Moon, Landmark, Tractor, BarChart3, Wifi,
  Smartphone, ShieldCheck, CheckCircle2, ChevronRight, Sparkles, Cpu,
  Layers, MapPin, Zap, RefreshCw, X, Sliders, ArrowUpRight, Search, FileText, Check
} from "lucide-react";

/* ─── Dark Mode Hook ─────────────────────────────────────────────────── */
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

/* ─── Categories & Data ─────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "all", label: "All Capabilities" },
  { id: "credit", label: "Credit & Finance" },
  { id: "iot", label: "Smart IoT & Sensors" },
  { id: "ai", label: "AI Agronomist" },
  { id: "mapping", label: "Farm & GPS Mapping" },
  { id: "ussd", label: "USSD & Mobile" },
  { id: "market", label: "Marketplace & Supply" },
];

interface FeatureItem {
  id: string;
  category: string;
  icon: typeof Landmark;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
  accentColor: string;
  stat: string;
  statLabel: string;
  highlights: string[];
  techStack: string[];
}

const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: "input-credit",
    category: "credit",
    icon: Landmark,
    badge: "MICRO-FINANCING ENGINE",
    title: "Instant Agricultural Input Credit",
    subtitle: "Collateral-free seasonal loans tailored to Rwandan harvest cycles",
    description: "AGROBUS leverages historical yield data, soil quality ratings, and cooperative history to score farmers instantly. Receive credit approval in under 2 minutes and redeem vouchers directly at certified agro-dealer shops.",
    image: "/farmer-digital.jpg",
    gradient: "from-emerald-500 via-teal-500 to-green-600",
    accentColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    stat: "94.2%",
    statLabel: "On-time Repayment Rate",
    highlights: [
      "Automated credit scoring algorithm",
      "Digital voucher redemption at certified agro-dealers",
      "Flexible repayment tied to post-harvest sale",
      "Transparent zero-hidden-fee terms"
    ],
    techStack: ["Spring Security", "JWT", "PostgreSQL / H2", "REST API"]
  },
  {
    id: "farm-mapping",
    category: "mapping",
    icon: Tractor,
    badge: "GPS & SATELLITE TELEMETRY",
    title: "Precision Farm Boundary & Crop Tracking",
    subtitle: "Multi-plot polygon mapping and crop lifecycle management",
    description: "Map exact farm boundaries using GPS positioning or satellite imagery. Monitor crop health stages, plot acreage, crop rotations, and expected yield metrics across all your registered parcels.",
    image: "/smart-field-satellite.jpg",
    gradient: "from-teal-500 via-cyan-500 to-blue-600",
    accentColor: "text-teal-500 bg-teal-500/10 border-teal-500/20",
    stat: "30+",
    statLabel: "Rwandan Districts Mapped",
    highlights: [
      "GPS polygon boundary recording",
      "Crop rotation and sowing history logs",
      "Acreage calculation & expected yield projections",
      "Multi-plot portfolio management"
    ],
    techStack: ["Spatial GeoJSON", "React Leaflet/Maps", "Vite Frontend"]
  },
  {
    id: "iot-sensors",
    category: "iot",
    icon: Wifi,
    badge: "SMART FARM TELEMETRY",
    title: "IoT Environmental & Soil Sensing",
    subtitle: "Real-time field monitoring powered by solar telemetry nodes",
    description: "Connect low-power IoT sensor nodes to track soil moisture levels, soil nitrogen-phosphorus-potassium balance, ground temperature, and localized micro-climate weather forecasts directly in your dashboard.",
    image: "/iot-device.jpg",
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    accentColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    stat: "24 / 7",
    statLabel: "Live Soil & Weather Stream",
    highlights: [
      "Soil moisture & NPK nutrient sensors",
      "Automated irrigation threshold alerts",
      "Solar-powered mesh network node connectivity",
      "Hyper-local rain and humidity predictions"
    ],
    techStack: ["MQTT / WebSockets", "IoT Gateway Protocol", "Recharts Analytics"]
  },
  {
    id: "ai-agronomist",
    category: "ai",
    icon: Sparkles,
    badge: "COMPUTER VISION & AI",
    title: "AI Crop Disease & Advisory System",
    subtitle: "Instant leaf scan diagnosis & Kinyarwanda voice advisory",
    description: "Snap a photo of affected crop leaves with your smartphone camera. Our AI vision model identifies pests or diseases in seconds and delivers targeted treatment advice in Kinyarwanda or English.",
    image: "/crop-ai-scanner.jpg",
    gradient: "from-emerald-400 via-emerald-600 to-teal-700",
    accentColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    stat: "98.4%",
    statLabel: "Diagnostic Accuracy Rate",
    highlights: [
      "Instant leaf disease & pest identification",
      "Kinyarwanda & English audio/text advice",
      "Localized fertilizer & pesticide recommendations",
      "Agronomist escalation for complex cases"
    ],
    techStack: ["TensorFlow Vision", "Deep Learning API", "Speech Synthesis"]
  },
  {
    id: "ussd-connectivity",
    category: "ussd",
    icon: Smartphone,
    badge: "2G & SMS TELEPHONY",
    title: "USSD Offline Access (*810#)",
    subtitle: "Full platform functionality on basic feature phones without internet",
    description: "No smartphone or internet coverage required. Farmers can apply for loans, check balances, receive weather alerts, and confirm dealer voucher codes on any basic mobile phone via *810#.",
    image: "/phone-mockup.jpg",
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    accentColor: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    stat: "100%",
    statLabel: "Offline Network Coverage",
    highlights: [
      "Custom USSD gateway integration (*810#)",
      "Instant SMS notification receipts",
      "Works on 2G feature phones",
      "Multi-language USSD menu (Kinyarwanda/English)"
    ],
    techStack: ["USSD Gateway API", "SMS Gateway", "Spring StateMachine"]
  },
  {
    id: "marketplace-supply",
    category: "market",
    icon: BarChart3,
    badge: "DIRECT AGRI-MARKETPLACE",
    title: "Verified Input Marketplace & Produce Trading",
    subtitle: "Connecting certified agro-dealers, cooperatives, and institutional buyers",
    description: "A transparent digital marketplace connecting farmers with certified seed and fertilizer suppliers and wholesale harvest buyers. Eliminates predatory middlemen and guarantees genuine inputs.",
    image: "/marketplace-warehouse.jpg",
    gradient: "from-amber-500 via-orange-500 to-red-600",
    accentColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    stat: "150+",
    statLabel: "Certified Agro-Dealers",
    highlights: [
      "Verified seed and fertilizer catalog",
      "Digital escrow and voucher verification",
      "Bulk harvest buyer auction engine",
      "Quality assurance inspection badges"
    ],
    techStack: ["Escrow Contracts", "Spring Boot", "React Query"]
  }
];

const COMPARISON = [
  { feature: "Loan Application Time", traditional: "2 to 6 weeks", agrobus: "< 2 minutes instant approval" },
  { feature: "Internet Requirement", traditional: "Mandatory web access", agrobus: "Works 100% offline via *810# USSD" },
  { feature: "Soil & Microclimate Data", traditional: "Manual lab testing", agrobus: "24/7 IoT Solar Telemetry Streams" },
  { feature: "Pest & Disease Diagnosis", traditional: "Wait days for agronomist", agrobus: "Instant AI Smartphone Scanning" },
  { feature: "Input Quality Guarantee", traditional: "Risk of counterfeit seeds", agrobus: "100% Verified Agro-dealer Vouchers" },
  { feature: "Security & Encryption", traditional: "Paper records & logbooks", agrobus: "Bank-grade JWT & 256-bit SSL Security" },
];

export default function FeaturesPage() {
  const [dark, setDark] = useDark();
  const [pinned, setPinned] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);

  /* Interactive Sandbox States */
  const [sandboxTab, setSandboxTab] = useState<"credit" | "iot" | "ai" | "ussd">("credit");
  const [farmHectares, setFarmHectares] = useState<number>(2.5);
  const [cropType, setCropType] = useState<string>("Maize");

  /* Simulated USSD State */
  const [ussdStep, setUssdStep] = useState<number>(0);
  const [ussdInput, setUssdInput] = useState<string>("");

  useEffect(() => {
    const fn = () => setPinned(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const filteredItems = activeCategory === "all"
    ? FEATURE_ITEMS
    : FEATURE_ITEMS.filter(item => item.category === activeCategory);

  /* Calculate Credit Estimation */
  const estimatedCredit = Math.round(farmHectares * (cropType === "Maize" ? 180000 : cropType === "Irish Potatoes" ? 250000 : 140000));
  const estimatedRepayment = Math.round(estimatedCredit * 1.05); // 5% seasonal rate

  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300">

      {/* ── 1. Navbar ────────────────────────────────────────────────── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        pinned ? "bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl" : "bg-transparent"
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="text-base font-black tracking-wide text-white">AGRO<span className="text-emerald-400">BUS</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-400">
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <Link to="/features" className="text-emerald-400 font-bold flex items-center gap-1.5">
              Features <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </Link>
            <a href="#sandbox" className="hover:text-emerald-400 transition-colors">Live Sandbox</a>
            <a href="#comparison" className="hover:text-emerald-400 transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(d => !d)}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link to="/login" className="hidden sm:block text-[13px] font-bold text-slate-300 hover:text-emerald-400 transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link to="/login" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5">
              Launch Platform <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        {/* Ambient Light Leak Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-12 right-10 w-96 h-96 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-bold tracking-widest text-emerald-400 uppercase mb-8 shadow-inner shadow-emerald-500/20 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            AGROBUS ECOSYSTEM · PLATFORM CAPABILITIES 2026
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            Architected for <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Modern Agriculture</span>, Built for Scale.
          </h1>

          <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Explore the comprehensive suite of financial micro-credit algorithms, satellite telemetry, IoT environmental sensor networks, and 2G USSD telephony powering Rwandan agriculture.
          </p>

          {/* Quick Metrics Pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 max-w-3xl mx-auto border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
            <div className="text-center px-4">
              <p className="text-2xl sm:text-3xl font-black text-white">94.2%</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Repayment Rate</p>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="text-center px-4">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">&lt; 2 min</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Credit Approval</p>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="text-center px-4">
              <p className="text-2xl sm:text-3xl font-black text-cyan-400">*810#</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">USSD Offline Code</p>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="text-center px-4">
              <p className="text-2xl sm:text-3xl font-black text-teal-300">30 / 30</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Districts Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Category Filter Bar ────────────────────────────────────── */}
      <section className="sticky top-20 z-40 bg-slate-950/90 backdrop-blur-xl border-y border-slate-800/80 py-4 px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500 shrink-0 hidden lg:block">
            Showing {filteredItems.length} core platform modules
          </p>
        </div>
      </section>

      {/* ── 4. Cinematic Features Grid ─────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-3xl bg-slate-900/70 border border-slate-800/90 hover:border-emerald-500/50 p-6 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)]"
                >
                  {/* Glowing Top Border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

                  {/* Header & Image */}
                  <div>
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${item.accentColor}`}>
                        <Icon className="h-3 w-3" />
                        {item.badge}
                      </span>
                      <span className="text-[11px] font-black text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                        {item.stat}
                      </span>
                    </div>

                    {/* Image Preview Container */}
                    <div className="relative mb-6 rounded-2xl overflow-hidden aspect-[16/9] border border-slate-800/80 group-hover:border-slate-700 transition-colors">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
                          {item.statLabel}
                        </span>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs font-medium text-slate-400 leading-relaxed">
                      {item.subtitle}
                    </p>
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="mt-6 pt-5 border-t border-slate-800/80">
                    <ul className="space-y-2 mb-6">
                      {item.highlights.slice(0, 3).map((h, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Trigger */}
                    <button
                      onClick={() => setSelectedFeature(item)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-emerald-600 border border-slate-700/60 hover:border-emerald-500 py-3 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md"
                    >
                      Deep-Dive Architecture
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Live Interactive Feature Sandbox ───────────────────────── */}
      <section id="sandbox" className="py-20 px-6 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-[11px] font-bold tracking-widest text-teal-400 uppercase mb-4">
              <Cpu className="h-3.5 w-3.5" /> INTERACTIVE PREVIEW
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Test-Drive the AGROBUS Platform Sandbox
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
              Simulate live credit calculations, IoT telemetry stream graphs, USSD phone menus, and AI diagnostics right here.
            </p>

            {/* Sandbox Tabs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                { id: "credit", label: "Credit Engine Calculator", icon: Landmark },
                { id: "iot", label: "Live Telemetry Feed", icon: Wifi },
                { id: "ai", label: "AI Diagnostic Scanner", icon: Sparkles },
                { id: "ussd", label: "USSD *810# Phone Simulator", icon: Smartphone }
              ].map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSandboxTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
                      sandboxTab === tab.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sandbox Workspace Container */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden min-h-[420px]">

            {/* Tab 1: Credit Engine Calculator */}
            {sandboxTab === "credit" && (
              <div className="grid lg:grid-cols-2 gap-10 items-center animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-emerald-400" />
                    Seasonal Input Credit Estimator
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Adjust plot size and crop type to calculate instant estimated seed & fertilizer loan approval bounds.
                  </p>

                  <div className="space-y-6">
                    {/* Hectares Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-slate-300">Registered Land Size:</span>
                        <span className="text-emerald-400 font-mono text-sm">{farmHectares} Hectares</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="10.0"
                        step="0.5"
                        value={farmHectares}
                        onChange={(e) => setFarmHectares(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500 mt-1">
                        <span>0.5 Ha</span>
                        <span>5.0 Ha</span>
                        <span>10.0 Ha</span>
                      </div>
                    </div>

                    {/* Crop Type Select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2">Primary Crop Type:</label>
                      <div className="grid grid-cols-3 gap-3">
                        {["Maize", "Irish Potatoes", "Beans"].map(crop => (
                          <button
                            key={crop}
                            onClick={() => setCropType(crop)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                              cropType === crop
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            {crop}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Output Card */}
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      INSTANT SCORE: 840 (EXCELLENT)
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Approved Credit Limit</p>
                    <p className="text-4xl font-black text-white font-mono tracking-tight">
                      {estimatedCredit.toLocaleString()} <span className="text-sm font-semibold text-emerald-400">RWF</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Voucher valid for fertilizer, certified seed & pesticide at registered agro-dealers.</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Seasonal Repayment (After Harvest):</span>
                      <span className="font-bold text-white font-mono">{estimatedRepayment.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Repayment Period:</span>
                      <span className="font-bold text-emerald-400">120 Days (Post-Harvest)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Collateral Requirement:</span>
                      <span className="font-bold text-white">None (Yield Backed)</span>
                    </div>

                    <Link to="/login" className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all">
                      Apply For This Loan <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: IoT Telemetry Feed */}
            {sandboxTab === "iot" && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Wifi className="h-5 w-5 text-cyan-400" />
                      Live Field Sensor Telemetry (Node #RWA-402)
                    </h3>
                    <p className="text-xs text-slate-400">Musanze Sector · Plot #4 · Maize Canopy</p>
                  </div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    LIVE DATA STREAM (MQTT OVER SSL)
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Soil Moisture", val: "58.4%", status: "Optimal", color: "text-cyan-400" },
                    { label: "Soil Temp", val: "22.6 °C", status: "Normal", color: "text-emerald-400" },
                    { label: "Nitrogen (N)", val: "42 mg/kg", status: "Good", color: "text-teal-400" },
                    { label: "Solar Battery Node", val: "12.8 V", status: "100% Charged", color: "text-amber-400" },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      <p className={`text-2xl font-black font-mono mt-1 ${stat.color}`}>{stat.val}</p>
                      <span className="text-[10px] font-semibold text-slate-500 mt-2 block">{stat.status}</span>
                    </div>
                  ))}
                </div>

                {/* Simulated Graph Canvas Container */}
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col items-center justify-center text-center py-10">
                  <BarChart3 className="h-10 w-10 text-cyan-400 mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-slate-300">Continuous 24-Hour Telemetry Graph Active</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                    Telemetry node updates every 15 minutes. Automatic irrigation triggers dispatch SMS alerts when moisture drops below 40%.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: AI Diagnostic Scanner */}
            {sandboxTab === "ai" && (
              <div className="animate-fade-in grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    AI Crop Disease Vision Scanner
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Demonstration of a TensorFlow crop leaf analysis model trained on East African farming datasets.
                  </p>

                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 relative overflow-hidden">
                    <img src="/crop-ai-scanner.jpg" alt="AI Scan preview" className="w-full h-48 object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-400 rounded-2xl flex items-center justify-center pointer-events-none">
                      <span className="bg-slate-950/90 text-emerald-400 text-xs font-extrabold px-3 py-1.5 rounded-full border border-emerald-500/30 shadow-lg">
                        AI SCANNING HUD ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-slate-400">DETECTED CONDITION:</span>
                    <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                      Maize Leaf Blight (Mild)
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-slate-400">CONFIDENCE RATING:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">98.6%</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300 mb-1">Recommended Treatment (Kinyarwanda):</p>
                    <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 italic leading-relaxed">
                      "Tera umuti wa Fungicide Manzeb 80% gramu 50 mu jerekani ya litiro 20. Fuhira mu gitondo mbere y'izuba."
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300 mb-1">Recommended Treatment (English):</p>
                    <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                      Apply Mancozeb 80% WP fungicide at 50g per 20L sprayer. Spray early morning before direct sunlight.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: USSD *810# Phone Simulator */}
            {sandboxTab === "ussd" && (
              <div className="animate-fade-in flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-violet-400" />
                  USSD *810# Feature Phone Simulator
                </h3>
                <p className="text-xs text-slate-400 mb-6 text-center">
                  Click phone buttons to simulate 2G USSD session navigation.
                </p>

                {/* Pixel Phone Shell */}
                <div className="w-72 bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] p-5 shadow-2xl relative">
                  {/* Phone Screen */}
                  <div className="bg-emerald-950 border-2 border-emerald-800/80 rounded-xl p-4 font-mono text-xs text-emerald-300 min-h-[160px] flex flex-col justify-between shadow-inner">
                    <div>
                      <p className="text-[10px] text-emerald-500 border-b border-emerald-900 pb-1 mb-2 font-bold">
                        AGROBUS USSD v2.4 (*810#)
                      </p>
                      {ussdStep === 0 && (
                        <div>
                          <p>1. Check Loan Status</p>
                          <p>2. Request Seed Voucher</p>
                          <p>3. Weather & Soil Info</p>
                          <p>4. Agent Contact</p>
                        </div>
                      )}
                      {ussdStep === 1 && (
                        <div>
                          <p>AGROBUS CREDIT STATUS:</p>
                          <p>Approved: 450,000 RWF</p>
                          <p>Repaid: 120,000 RWF</p>
                          <p>Due: Nov 30, 2026</p>
                        </div>
                      )}
                      {ussdStep === 2 && (
                        <div>
                          <p>VOUCHER CODE:</p>
                          <p className="text-yellow-300 font-bold tracking-widest my-1">#AGB-9082-RW</p>
                          <p>Show to agro-dealer at Musanze main store.</p>
                        </div>
                      )}
                      {ussdStep === 3 && (
                        <div>
                          <p>WEATHER ALERT:</p>
                          <p>Heavy rain expected in Musanze on Thursday.</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-emerald-600 text-right mt-2">MTN / Airtel 2G</p>
                  </div>

                  {/* Phone Keypad */}
                  <div className="grid grid-cols-3 gap-2 mt-5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map(key => (
                      <button
                        key={key}
                        onClick={() => {
                          if (key === 1) setUssdStep(1);
                          else if (key === 2) setUssdStep(2);
                          else if (key === 3) setUssdStep(3);
                          else if (key === "#" || key === "*") setUssdStep(0);
                        }}
                        className="h-10 rounded-lg bg-slate-800 border border-slate-700 hover:bg-emerald-600 hover:text-white font-bold text-xs text-slate-300 flex items-center justify-center active:scale-95 transition-all shadow"
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setUssdStep(0)}
                    className="w-full mt-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800 border border-red-700/50 text-[10px] font-bold text-red-300 transition-colors"
                  >
                    Reset USSD Session
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── 6. Architecture Comparison Grid ────────────────────────────── */}
      <section id="comparison" className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-bold tracking-widest text-emerald-400 uppercase mb-4">
              <Layers className="h-3.5 w-3.5" /> ARCHITECTURAL ADVANTAGE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Traditional Lending vs. AGROBUS Platform
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
              How AGROBUS replaces slow paper workflows with high-speed digital automation.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 bg-slate-950 p-5 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-4 sm:col-span-3">Platform Metric</div>
              <div className="col-span-4 sm:col-span-4 text-red-400">Traditional Bank / Paper Process</div>
              <div className="col-span-4 sm:col-span-5 text-emerald-400">AGROBUS Ecosystem</div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {COMPARISON.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 p-5 text-xs items-center hover:bg-slate-800/30 transition-colors">
                  <div className="col-span-4 sm:col-span-3 font-bold text-white flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {row.feature}
                  </div>
                  <div className="col-span-4 sm:col-span-4 text-slate-400 pr-2">
                    {row.traditional}
                  </div>
                  <div className="col-span-4 sm:col-span-5 font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    {row.agrobus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Deep-Dive Feature Modal ─────────────────────────────────── */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${selectedFeature.accentColor}`}>
                {selectedFeature.badge}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">{selectedFeature.stat} ({selectedFeature.statLabel})</span>
            </div>

            <h2 className="text-2xl font-black text-white mb-2">{selectedFeature.title}</h2>
            <p className="text-xs font-semibold text-slate-400 mb-6">{selectedFeature.subtitle}</p>

            <img src={selectedFeature.image} alt={selectedFeature.title} className="w-full h-48 object-cover rounded-2xl mb-6 border border-slate-800" />

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {selectedFeature.description}
            </p>

            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Core Capability Checklist:</h4>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {selectedFeature.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Backend & Frontend Tech Specs:</h4>
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedFeature.techStack.map((tech, i) => (
                <span key={i} className="text-[11px] font-mono font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-800">
              <Link
                to="/login"
                onClick={() => setSelectedFeature(null)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs text-center shadow-lg shadow-emerald-500/20 transition-all"
              >
                Access Module in Portal
              </Link>
              <button
                onClick={() => setSelectedFeature(null)}
                className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. Cinematic Call To Action ───────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <img src="/farmer-digital.jpg" alt="Rwandan Farmer" className="absolute inset-0 h-full w-full object-cover object-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950" />

        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to Experience the <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Future of Rwandan Farming</span>?
          </h2>
          <p className="mt-4 text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Join over 5,000 farmers, 150 agro-dealers, and agricultural agents transforming credit access today.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/login" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-105">
              Register Account <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#sandbox" className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 px-8 py-4 text-sm font-bold text-slate-300 hover:text-white transition-all">
              Re-test Sandbox
            </a>
          </div>
        </div>
      </section>

      {/* ── 9. Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-slate-900 px-6 py-10">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <Sprout className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-white tracking-wider">AGROBUS</span>
            <span>· Agricultural Operations Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link to="/features" className="text-emerald-400 font-bold">Features</Link>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Portal Login</Link>
            <span>© {new Date().getFullYear()} AGROBUS Rwanda</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
