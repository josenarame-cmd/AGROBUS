import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Bell, CheckCircle2, FileText, Landmark,
  Menu, Moon, ShieldCheck, Sprout, Sun, Tractor, UserRound, Wheat, X,
} from 'lucide-react';

const availableFeatures = [
  {
    icon: Landmark,
    title: 'Agricultural credit',
    description: 'Farmers can submit input-credit requests and follow loan decisions, delivery, balances, and repayments.',
    image: '/farmer-digital.jpg',
    alt: 'Farmer reviewing digital information in a field',
    imagePosition: 'object-center',
  },
  {
    icon: Tractor,
    title: 'Farm and crop records',
    description: 'Keep farm profiles, crop cycles, and dated field activities together in your farmer workspace.',
    image: '/smart-field-satellite.jpg',
    alt: 'Aerial view of cultivated agricultural fields',
    imagePosition: 'object-center',
  },
  {
    icon: BarChart3,
    title: 'Soil analysis and farm insights',
    description: 'Review soil analyses and recommendations generated from the records connected to your account.',
    image: '/crop-ai-scanner.jpg',
    alt: 'Crop inspection in an agricultural field',
    imagePosition: 'object-center',
  },
  {
    icon: UserRound,
    title: 'Field team operations',
    description: 'Authorized staff can manage farmer profiles, agent assignments, agricultural input inventory, suppliers, and notifications.',
    image: '/marketplace-warehouse.jpg',
    alt: 'Agricultural supplies arranged for distribution',
    imagePosition: 'object-center',
  },
];

const plannedFeatures = [
  { icon: Sprout, title: 'Input marketplace', description: 'Browsing and ordering products is not currently connected to a live marketplace service.' },
  { icon: Bell, title: 'Connected field devices', description: 'The interface does not yet receive live readings from farm sensors or weather stations.' },
  { icon: FileText, title: 'USSD network service', description: 'The current USSD experience is a simulator, not a live mobile-network connection.' },
];

function useDark() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('agb-theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('agb-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, setDark] as const;
}

export default function FeaturesPage() {
  const [dark, setDark] = useDark();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="skip-link">Skip to content</a>

      <header className="sticky top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link to="/" aria-label="AGROBUS home" className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight">Agro<span className="text-primary-500">BUS</span></span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <Link to="/" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">Home</Link>
            <a href="#capabilities" className="text-sm font-semibold text-foreground transition-colors hover:text-primary">Capabilities</a>
            <a href="#availability" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">Availability</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDark(value => !value)}
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link to="/login" className="hidden rounded-md bg-[#4dbbc2] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#3aa8b0] sm:inline-flex">
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(open => !open)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              className="flex h-10 w-11 items-center justify-center rounded-md bg-[#4dbbc2] text-white transition hover:bg-[#3aa8b0] md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Mobile navigation" className="border-t border-border bg-background px-5 py-3 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-secondary">Home</Link>
              <a href="#capabilities" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-secondary">Capabilities</a>
              <a href="#availability" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-secondary">Availability</a>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-secondary">Sign in</Link>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="relative isolate overflow-hidden bg-surface-950 px-5 py-20 text-center text-white sm:py-28">
          <img
            src="/farmer-digital.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-surface-950/65" />
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-200 sm:text-sm">Tools for agricultural work</p>
            <h1 className="mt-5 text-4xl font-black uppercase leading-tight tracking-tight sm:text-6xl">One workspace for the farm journey</h1>
            <div aria-hidden="true" className="mx-auto mt-6 h-1 w-20 rounded-full bg-[#55c3c8]" />
            <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-surface-100 sm:text-lg">
              AGROBUS brings farmer records, seasonal credit workflows, field operations, and farm insights into a role-based platform.
            </p>
            <Link to="/login" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#4dbbc2] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#3aa8b0]">
              Access the platform <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section id="capabilities" className="scroll-mt-20 px-5 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl sm:mb-14">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-600">Platform capabilities</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Built around real farm workflows</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Farmers and authorized field teams see the records and actions available to their account.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {availableFeatures.map(({ icon: Icon, title, description, image, alt, imagePosition }) => (
                <article key={title} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative aspect-[16/8] overflow-hidden bg-muted">
                    <img src={image} alt={alt} loading="lazy" className={`h-full w-full object-cover ${imagePosition}`} />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold text-green-800 shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" /> In the platform
                    </span>
                  </div>
                  <div className="p-6 sm:p-7">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-xl font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="availability" className="scroll-mt-20 border-y border-border bg-secondary/50 px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-600">Service availability</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Know what is live</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                We distinguish connected platform workflows from ideas that are not yet backed by live services. No sample readings or performance claims are presented as real data.
              </p>
            </div>
            <div className="grid gap-3">
              {plannedFeatures.map(({ icon: Icon, title, description }) => (
                <article key={title} className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{title}</h3>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">Not connected</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-2xl bg-primary px-6 py-9 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-100">
                <ShieldCheck className="h-4 w-4" /> Role-based workspace
              </span>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">Open the workspace for your role</h2>
              <p className="mt-2 text-sm leading-6 text-primary-50">Farmers, field agents, and administrators get access to different tools and records.</p>
            </div>
            <Link to="/login" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-primary-800 transition hover:bg-primary-50">
              Sign in or register <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card px-5 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-2 font-black" aria-label="AGROBUS home">
            <Sprout className="h-5 w-5 text-primary" /> AgroBUS
          </Link>
          <p className="text-sm text-muted-foreground">Agricultural records and credit workflows in one role-based workspace.</p>
          <div className="flex gap-5 text-sm font-semibold">
            <Link to="/" className="text-muted-foreground transition hover:text-primary">Home</Link>
            <Link to="/login" className="text-muted-foreground transition hover:text-primary">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
