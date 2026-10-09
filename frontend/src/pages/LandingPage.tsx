import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Landmark, Menu, Moon,
  ShieldCheck, Sprout, Sun, Tractor, Wifi, X,
} from 'lucide-react';

const capabilities = [
  {
    icon: Landmark,
    title: 'Agricultural credit',
    description: 'Submit input-credit requests and follow the loan and repayment records linked to your account.',
  },
  {
    icon: Tractor,
    title: 'Farm management',
    description: 'Keep farm profiles, crops, and field activities together in a farmer workspace.',
  },
  {
    icon: BarChart3,
    title: 'Farm insights',
    description: 'Review available soil analyses and recommendations based on connected farm information.',
  },
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

export default function LandingPage() {
  const [dark, setDark] = useDark();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="skip-link">Skip to content</a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link to="/" aria-label="AGROBUS home" className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight">Agro<span className="text-primary-500">BUS</span></span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <a href="#capabilities" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">Platform</a>
            <Link to="/features" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">Capabilities</Link>
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
            <Link to="/login" className="hidden rounded-md px-4 py-2 text-sm font-bold text-muted-foreground transition hover:text-primary sm:inline-flex">
              Sign in
            </Link>
            <Link to="/login" className="hidden items-center gap-2 rounded-md bg-[#4dbbc2] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#3aa8b0] sm:inline-flex">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(open => !open)}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="public-mobile-navigation"
              className="flex h-10 w-11 items-center justify-center rounded-md bg-[#4dbbc2] text-white transition-colors hover:bg-[#3aa8b0] md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="public-mobile-navigation" aria-label="Mobile navigation" className="border-t border-border bg-background px-5 py-3 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <a href="#capabilities" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-secondary">Platform</a>
              <Link to="/features" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-secondary">Capabilities</Link>
              <a href="#availability" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-secondary">Availability</a>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold hover:bg-secondary">Sign in or register</Link>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" tabIndex={-1} className="scroll-mt-20">
        <section className="relative isolate flex min-h-[660px] items-center justify-center overflow-hidden px-5 pb-14 pt-36 text-center text-white sm:min-h-[78vh] sm:pt-32">
          <img
            src="/farmer-digital.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-surface-950/65" />
          <div className="mx-auto w-full max-w-5xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-200 sm:text-sm">Agricultural credit and farm management</p>
            <h1 className="mt-5 text-4xl font-black uppercase leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Agriculture,<br className="sm:hidden" /> connected
            </h1>
            <div aria-hidden="true" className="mx-auto mt-6 h-1 w-20 rounded-full bg-[#55c3c8]" />
            <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-surface-100 sm:text-base sm:leading-8">
              AGROBUS helps farmers and authorized field teams manage farmer records, seasonal credit workflows, farm activities, and available agricultural insights.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link to="/login" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#4dbbc2] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#3aa8b0]">
                Access the platform <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/features" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/60 bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white backdrop-blur transition hover:bg-white/20">
                Explore capabilities
              </Link>
            </div>
          </div>
        </section>

        <section id="capabilities" className="scroll-mt-20 px-5 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-600">Platform capabilities</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Clear records for connected farm work</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">Tools are available according to your role and the services connected to your account.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {capabilities.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-7">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/features" className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/5">
                View platform capabilities <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="mobile" className="scroll-mt-20 overflow-hidden bg-secondary/50 px-5 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-600">Farmer workspace</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Your farm information, in one place</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The farmer workspace organizes farm profiles, crop records, field activities, loan requests, and repayment information. What you can view depends on your account and connected services.
              </p>
              <Link to="/login" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
                Open your workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative mx-auto max-w-sm">
              <div aria-hidden="true" className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
              <img src="/phone-mockup.jpg" alt="AGROBUS mobile workspace preview" loading="lazy" className="relative w-full rounded-[2rem] border-8 border-surface-900 shadow-2xl" />
            </div>
          </div>
        </section>

        <section id="availability" className="scroll-mt-20 px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Wifi className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black">Connected services, clearly identified</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">Live sensor feeds not connected</span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Smart-farm sensor readings are not currently connected. AGROBUS does not display demo readings as live field data. Visit the capabilities page for the status of other services.
              </p>
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden px-5 py-16 text-center text-white sm:px-6 sm:py-20">
          <img src="/farmer-digital.jpg" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 -z-10 bg-surface-950/80" />
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" /> Role-based access
            </span>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Open your AGROBUS workspace</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-surface-100 sm:text-base">Farmers, agents, and administrators get access to different tools and records.</p>
            <Link to="/login" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#4dbbc2] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#3aa8b0]">
              Sign in or register <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-surface-200">New farmer? Registration is available from the sign-in page.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card px-5 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-2 font-black" aria-label="AGROBUS home">
            <Sprout className="h-5 w-5 text-primary" /> AgroBUS
          </Link>
          <p className="text-sm text-muted-foreground">Agricultural records and credit workflows in one role-based workspace.</p>
          <div className="flex flex-wrap gap-5 text-sm font-semibold">
            <Link to="/features" className="text-muted-foreground transition hover:text-primary">Capabilities</Link>
            <Link to="/login" className="text-muted-foreground transition hover:text-primary">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
