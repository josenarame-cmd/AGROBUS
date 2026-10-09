import { useEffect, useState, useRef } from 'react';
import {
  BrainCircuit, Tractor, MapPin, Search, Sparkles, Activity, Sprout,
  Info, Camera, Wheat, FileCheck2, Loader2, LineChart, ChevronRight,
  CheckCircle2, Circle, TrendingUp, AlertTriangle, Zap, BookOpen,
  Leaf, FlaskConical, BarChart2, MessageSquare, Send, ChevronDown,
  Eye, Clock, Shield, Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { farmAPI, farmerIntelligenceAPI } from '../services/api';

// ── Types ────────────────────────────────────────────────────────────────────

type Farm = { id: number; name: string; district: string; sector?: string; sizeHectares?: number };

type DataReadiness = {
  hasFarmProfile: boolean; hasCropCycle: boolean; hasSoilAnalysis: boolean;
  hasInputRecords: boolean; hasActivities: boolean; hasHarvestRecords: boolean;
  completenessPercent: number;
};

type TimelineEvent = {
  date: string; type: string; eventIcon: string; title: string;
  description: string; confidenceLevel?: string;
};

type FarmPerformance = {
  sufficientData: boolean; insufficientDataMessage?: string;
  harvestedKgTotal?: number; totalInputCost?: number; totalActivitiesLogged?: number;
};

type FarmSummary = {
  farmId: number; farmName: string; district: string; sector?: string; sizeHectares?: number;
  soilAnalysesCount: number; activeCropsCount: number; totalActivitiesCount: number;
  totalInputsUsed: number; harvestRecordsCount: number; newInsightsCount: number;
  dataReadiness: DataReadiness; timeline: TimelineEvent[];
  recommendationStatus: string; explanation: string; performance: FarmPerformance;
};

// ── Main component ────────────────────────────────────────────────────────────

export default function FarmerIntelligencePage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarmId, setActiveFarmId] = useState<number | null>(null);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState<FarmSummary | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'system'; text: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    farmAPI.getMine()
      .then(({ data }) => {
        const list: Farm[] = Array.isArray(data) ? data : [];
        setFarms(list);
        if (list.length) {
          setActiveFarmId(list[0].id);
          fetchSummary(list[0].id);
        }
      })
      .catch(() => toast.error('Could not load farms.'))
      .finally(() => setLoadingFarms(false));
  }, []);

  const fetchSummary = async (farmId: number) => {
    setLoadingSummary(true);
    setSummary(null);
    try {
      const { data } = await farmerIntelligenceAPI.getFarmSummary(farmId);
      setSummary(data);
    } catch {
      toast.error('Could not load farm intelligence. Try again.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleFarmChange = (id: number) => {
    setActiveFarmId(id);
    fetchSummary(id);
    setChatMessages([]);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !summary) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    const response = generateContextResponse(userMsg, summary);
    setChatMessages(prev => [...prev, { role: 'system', text: response }]);
    requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
  };

  const activeFarm = farms.find(f => f.id === activeFarmId);

  return (
    <section className="animate-fade-in relative pb-20 ai-workspace">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <AIHero activeFarm={activeFarm} />

      {/* ── FARM SELECTOR ────────────────────────────────────────────────────── */}
      <div className="ai-section mt-6">
        <FarmSelector
          farms={farms} activeFarmId={activeFarmId} loading={loadingFarms}
          onChange={handleFarmChange}
        />
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      {loadingSummary ? (
        <AILoadingState />
      ) : !summary ? (
        <AIEmptyState hasNoFarms={farms.length === 0} />
      ) : (
        <>
          {/* ── INTELLIGENCE OVERVIEW CARDS ────────────────────────────────── */}
          <div className="ai-section mt-6">
            <IntelligenceOverview summary={summary} />
          </div>

          {/* ── DATA READINESS ─────────────────────────────────────────────── */}
          <div className="ai-section mt-4">
            <DataReadinessPanel readiness={summary.dataReadiness} />
          </div>

          {/* ── MAIN 2-COLUMN ──────────────────────────────────────────────── */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* LEFT */}
            <div className="space-y-6">
              {/* Farm Story Timeline */}
              <FarmStoryTimeline timeline={summary.timeline} />

              {/* Farm Performance */}
              <FarmPerformancePanel performance={summary.performance} />
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              {/* Soil Analysis CTA */}
              <SoilAnalysisCta soilCount={summary.soilAnalysesCount} />

              {/* Recommendation Status */}
              <RecommendationCard status={summary.recommendationStatus} explanation={summary.explanation} />

              {/* AI Assistant */}
              <AIAssistant
                farmName={summary.farmName}
                chatMessages={chatMessages} chatInput={chatInput}
                onInputChange={setChatInput} onSubmit={handleChatSubmit}
                chatEndRef={chatEndRef} summary={summary}
              />

              {/* Data Source Integrity */}
              <DataSourcePanel />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

// ── Sub-Components ────────────────────────────────────────────────────────────

function AIHero({ activeFarm }: { activeFarm?: Farm }) {
  return (
    <div className="ai-hero relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 lg:px-12 lg:py-16 text-white shadow-2xl">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 opacity-20 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-green-700 to-teal-700 opacity-15 blur-[60px]" />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative z-10 max-w-2xl">
        {/* AI Badge */}
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/8 px-4 py-2 backdrop-blur-sm">
          <div className="ai-mark flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
            <Leaf className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-green-300">AGROBUS AI Intelligence</span>
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight lg:text-5xl">
          Your farm has a story.<br />
          <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
            Let's understand it together.
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 lg:text-base">
          Turn your soil analyses, crop cycles, farm activities and harvest history into useful,
          context-aware farming insights — grounded in your real data.
        </p>

        {activeFarm && (
          <p className="mt-3 text-xs text-slate-400">
            <span className="text-slate-500">Analyzing:</span>{' '}
            <span className="font-semibold text-green-300">{activeFarm.name}</span>
            {activeFarm.sizeHectares && <span className="ml-2 text-slate-500">· {activeFarm.sizeHectares} ha</span>}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/farmer/soil-analysis"
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-[0_0_30px_rgba(34,197,94,0.4)] transition hover:-translate-y-0.5 hover:bg-green-400"
          >
            <Camera className="h-4 w-4" /> Analyze My Soil
          </Link>
          <Link
            to="/farmer/activities"
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-white/20 hover:bg-white/12"
          >
            <Activity className="h-4 w-4" /> View Farm Activities
          </Link>
        </div>
      </div>
    </div>
  );
}

function FarmSelector({ farms, activeFarmId, loading, onChange }: {
  farms: Farm[]; activeFarmId: number | null; loading: boolean; onChange: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
        <MapPin className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Analyzing Farm</p>
        <p className="mt-0.5 text-sm font-bold text-slate-800 truncate">
          {loading ? 'Loading your farms…' : farms.find(f => f.id === activeFarmId)?.name ?? 'Select a farm to begin'}
        </p>
      </div>
      <div className="relative">
        <select
          value={activeFarmId ?? ''}
          onChange={e => onChange(Number(e.target.value))}
          disabled={loading}
          className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-8 text-sm font-semibold text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 cursor-pointer"
        >
          <option value="" disabled>{loading ? 'Loading…' : 'Choose farm'}</option>
          {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function IntelligenceOverview({ summary }: { summary: FarmSummary }) {
  const metrics = [
    { icon: FlaskConical, label: 'Soil Analysed', value: summary.soilAnalysesCount, tone: 'amber' },
    { icon: Sprout, label: 'Active Crops', value: summary.activeCropsCount, tone: 'green' },
    { icon: FileCheck2, label: 'Activities', value: summary.totalActivitiesCount, tone: 'blue' },
    { icon: Tractor, label: 'Inputs Logged', value: summary.totalInputsUsed, tone: 'purple' },
    { icon: Wheat, label: 'Harvests', value: summary.harvestRecordsCount, tone: 'emerald' },
    { icon: Zap, label: 'New Insights', value: summary.newInsightsCount, tone: 'slate' },
  ] as const;

  const toneMap: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-green-600" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Your Farm Intelligence</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition hover:-translate-y-0.5 ${toneMap[tone]}`}>
            <Icon className="h-5 w-5 mb-2 opacity-80" />
            <p className="text-2xl font-black">{value}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataReadinessPanel({ readiness }: { readiness: DataReadiness }) {
  const items = [
    { key: 'hasFarmProfile', label: 'Farm Profile', done: readiness.hasFarmProfile },
    { key: 'hasCropCycle', label: 'Crop Cycle', done: readiness.hasCropCycle },
    { key: 'hasSoilAnalysis', label: 'Soil Analysis', done: readiness.hasSoilAnalysis },
    { key: 'hasInputRecords', label: 'Input Records', done: readiness.hasInputRecords },
    { key: 'hasActivities', label: 'Activities', done: readiness.hasActivities },
    { key: 'hasHarvestRecords', label: 'Harvest Records', done: readiness.hasHarvestRecords },
  ];

  const pct = readiness.completenessPercent;
  const pctLabel = pct >= 80 ? 'AI Ready' : pct >= 50 ? 'Building Data' : 'Getting Started';

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-slate-500" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Readiness</h3>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          pct >= 80 ? 'bg-green-100 text-green-700' :
          pct >= 50 ? 'bg-amber-100 text-amber-700' :
          'bg-slate-100 text-slate-600'
        }`}>{pct}% — {pctLabel}</span>
      </div>
      {/* Progress bar */}
      <div className="mb-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(({ label, done }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs font-semibold">
            {done
              ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              : <Circle className="h-4 w-4 shrink-0 text-slate-300" />}
            <span className={done ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FarmStoryTimeline({ timeline }: { timeline: TimelineEvent[] }) {
  const getTypeStyle = (type: string) => {
    if (type === 'SOIL_ANALYSIS') return { dot: 'bg-amber-400 ring-amber-100', bg: 'bg-amber-50 border-amber-200 text-amber-800' };
    if (type === 'CROP_PLANTED') return { dot: 'bg-green-500 ring-green-100', bg: 'bg-green-50 border-green-200 text-green-800' };
    if (type === 'HARVEST') return { dot: 'bg-purple-500 ring-purple-100', bg: 'bg-purple-50 border-purple-200 text-purple-800' };
    return { dot: 'bg-blue-400 ring-blue-100', bg: 'bg-blue-50 border-blue-200 text-blue-800' };
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-4 w-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Farm Story</h3>
          </div>
          <p className="text-lg font-black text-slate-800">Your Farm Timeline</p>
          <p className="text-xs text-slate-400 mt-1">Chronological lifecycle of this farm</p>
        </div>
        <Link to="/farmer/activities" className="flex items-center gap-1 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 transition">
          Add Event <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {timeline.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
          <Clock className="h-8 w-8 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">No farm history yet.</p>
          <p className="text-xs text-slate-400 mt-1">Start by logging a crop or activity.</p>
          <Link to="/farmer/crops" className="mt-4 text-xs font-bold text-green-600 hover:underline flex items-center gap-1">
            Add first crop <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-100 space-y-7">
          {timeline.map((event, idx) => {
            const style = getTypeStyle(event.type);
            return (
              <div key={idx} className="relative group">
                {/* Dot */}
                <span className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ring-4 ${style.dot} shadow-sm`} />
                {/* Date */}
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">{event.date}</p>
                {/* Event card */}
                <div className={`rounded-xl border px-4 py-3 ${style.bg}`}>
                  <div className="flex items-start gap-2.5">
                    <span className="text-base leading-none mt-0.5">{event.eventIcon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{event.title}</p>
                      <p className="text-xs mt-1 opacity-80 leading-relaxed">{event.description}</p>
                      {event.confidenceLevel && (
                        <span className={`mt-2 inline-flex text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          event.confidenceLevel === 'HIGH' ? 'bg-green-100 text-green-700' :
                          event.confidenceLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{event.confidenceLevel} confidence</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FarmPerformancePanel({ performance }: { performance: FarmPerformance }) {
  if (!performance.sufficientData) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-600">Farm Performance</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{performance.insufficientDataMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: 'Total Yield Recorded', value: performance.harvestedKgTotal != null ? `${performance.harvestedKgTotal.toLocaleString()} kg` : '—' },
    { label: 'Total Input Cost', value: performance.totalInputCost != null ? `RWF ${performance.totalInputCost.toLocaleString()}` : '—' },
    { label: 'Activities Logged', value: String(performance.totalActivitiesLogged ?? 0) },
  ];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-slate-500" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Farm Performance</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
            <p className="text-xl font-black text-slate-800">{value}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
        <Info className="h-3 w-3" />
        Values calculated from your recorded farm data. Only increase in accuracy as you log more activities.
      </p>
    </div>
  );
}

function SoilAnalysisCta({ soilCount }: { soilCount: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white shadow-lg">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white opacity-10" />
      <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white opacity-5" />
      <div className="relative z-10">
        <FlaskConical className="h-6 w-6 mb-3 text-green-200" />
        <h3 className="text-base font-black">AI Soil Analysis</h3>
        <p className="mt-1 text-sm text-green-100">
          {soilCount > 0
            ? `${soilCount} analysis${soilCount > 1 ? 'es' : ''} recorded. Analyze another soil sample.`
            : 'Capture a photo of your field soil for an AI-assisted soil type estimate.'}
        </p>
        <Link
          to="/farmer/soil-analysis"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-50"
        >
          <Camera className="h-4 w-4" /> Analyze Soil
        </Link>
      </div>
    </div>
  );
}

function RecommendationCard({ status, explanation }: { status: string; explanation: string }) {
  const statusConfig = {
    NO_DATA: { icon: Circle, color: 'text-slate-400', badge: 'bg-slate-100 text-slate-600', label: 'No Data Yet' },
    NEEDS_MORE_DATA: { icon: AlertTriangle, color: 'text-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Building Data' },
    AVAILABLE: { icon: Sparkles, color: 'text-green-500', badge: 'bg-green-100 text-green-700', label: 'Insights Available' },
  }[status] ?? { icon: Circle, color: 'text-slate-400', badge: 'bg-slate-100 text-slate-600', label: 'Unknown' };

  const Icon = statusConfig.icon;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">AI Recommendations</h3>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${statusConfig.badge}`}>{statusConfig.label}</span>
      </div>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${statusConfig.color}`} />
        <p className="text-sm text-slate-600 leading-relaxed">{explanation}</p>
      </div>
      {status === 'AVAILABLE' && (
        <Link to="/farmer/crops" className="mt-4 flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700">
          View crop cycles <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function AIAssistant({
  farmName, chatMessages, chatInput, onInputChange, onSubmit, chatEndRef, summary
}: {
  farmName: string;
  chatMessages: { role: 'user' | 'system'; text: string }[];
  chatInput: string;
  onInputChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  summary: FarmSummary;
}) {
  const suggestions = [
    `What happened on ${farmName} this season?`,
    'Which activities are recorded?',
    'How many soil analyses exist?',
    'What is my data completeness?',
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-5 text-white shadow-2xl">
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-green-500 opacity-10 blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">Farm records helper</p>
            <p className="text-[10px] text-slate-400">Record lookup — {farmName}</p>
          </div>
          <div className="ml-auto rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
            Local summaries
          </div>
        </div>

        {/* Messages */}
        <div className="max-h-40 overflow-y-auto space-y-2 mb-4 scrollbar-thin">
          {chatMessages.length === 0 ? (
            <div className="space-y-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => onInputChange(s)}
                  className="w-full text-left rounded-xl border border-slate-700 bg-slate-800 p-3 text-xs text-slate-300 hover:border-green-600 hover:bg-slate-700 transition"
                >
                  "{s}"
                </button>
              ))}
            </div>
          ) : (
            chatMessages.map((msg, i) => (
              <div key={i} className={`rounded-xl p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white ml-4'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 mr-4'
              }`}>
                {msg.text}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={onSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => onInputChange(e.target.value)}
            placeholder={`Ask about ${farmName}…`}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-green-500 transition"
          />
          <button type="submit" disabled={!chatInput.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white transition hover:bg-green-400 disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-2 text-[10px] text-center text-slate-400">This helper looks up recorded farm data; it is not a generative AI chat service.</p>
      </div>
    </div>
  );
}

function DataSourcePanel() {
  const sources = [
    { label: 'Lab-Validated Data', status: 'Preferred', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    { label: 'AGROBUS Farm History', status: 'Active', color: 'bg-blue-50 border-blue-200 text-blue-800' },
    { label: 'AI Visual Estimate', status: 'Secondary', color: 'bg-amber-50 border-amber-200 text-amber-800' },
    { label: 'Unknown / Unverified', status: 'Excluded', color: 'bg-slate-50 border-slate-200 text-slate-600' },
  ];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-4 w-4 text-slate-400" />
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Data Integrity Model</h4>
      </div>
      <div className="space-y-2">
        {sources.map(({ label, status, color }) => (
          <div key={label} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold ${color}`}>
            <span>{label}</span>
            <span className="opacity-70">{status}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-slate-400 leading-relaxed">
        AI visual-only estimates are never mapped to NPK values without laboratory validation.
        Data sources are always disclosed.
      </p>
    </div>
  );
}

function AILoadingState() {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 py-16 text-center">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-green-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className="h-5 w-5 text-green-500" />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-700">AGROBUS AI</p>
        <p className="text-xs text-slate-400 mt-1">Analyzing your farm data…</p>
      </div>
      <div className="space-y-2 text-xs text-slate-400">
        <p className="flex items-center gap-2 justify-center"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Farm profile loaded</p>
        <p className="flex items-center gap-2 justify-center"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Retrieving soil analyses</p>
        <p className="flex items-center gap-2 justify-center"><Loader2 className="h-3.5 w-3.5 text-slate-400 animate-spin" /> Generating assessment…</p>
      </div>
    </div>
  );
}

function AIEmptyState({ hasNoFarms }: { hasNoFarms: boolean }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
      <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
        <BrainCircuit className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-base font-bold text-slate-700">
        {hasNoFarms ? 'No farms found' : 'Select a farm to begin'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        {hasNoFarms
          ? 'Create a farm first to unlock your AI intelligence workspace.'
          : 'Choose a farm from the selector above to view its intelligence overview.'}
      </p>
      {hasNoFarms && (
        <Link to="/farmer/farms" className="mt-5 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
          <Sprout className="h-4 w-4" /> Create Farm
        </Link>
      )}
    </div>
  );
}

// ── Context-aware chat response generator ─────────────────────────────────────

function generateContextResponse(question: string, summary: FarmSummary): string {
  const q = question.toLowerCase();

  if (q.includes('soil') || q.includes('analyse') || q.includes('analysis')) {
    if (summary.soilAnalysesCount === 0)
      return `No soil analyses have been recorded for ${summary.farmName} yet. Use the "Analyze My Soil" button to get started.`;
    return `${summary.farmName} has ${summary.soilAnalysesCount} soil analysis record(s). Check the Soil Analysis page for full details including confidence scores.`;
  }

  if (q.includes('activit')) {
    if (summary.totalActivitiesCount === 0)
      return `No activities have been logged for ${summary.farmName} yet. Visit the Activities page to start tracking.`;
    return `${summary.farmName} has ${summary.totalActivitiesCount} activity record(s) logged, including ${summary.totalInputsUsed} input usage record(s).`;
  }

  if (q.includes('crop') || q.includes('planting') || q.includes('season')) {
    if (summary.activeCropsCount === 0)
      return `No active crop cycles found for ${summary.farmName} right now. Log a crop on the Crops page to start tracking.`;
    return `${summary.farmName} has ${summary.activeCropsCount} active crop cycle(s). View them on the Crops page for details.`;
  }

  if (q.includes('harvest')) {
    if (summary.harvestRecordsCount === 0)
      return `No harvests recorded for ${summary.farmName} yet. Record a harvest by updating a crop to "HARVESTED" status.`;
    return `${summary.harvestRecordsCount} harvest record(s) found for ${summary.farmName}. Keep recording activities to improve accuracy.`;
  }

  if (q.includes('complet') || q.includes('readiness') || q.includes('data')) {
    const pct = summary.dataReadiness.completenessPercent;
    return `${summary.farmName} is at ${pct}% AI readiness. ${summary.explanation}`;
  }

  if (q.includes('happened') || q.includes('history') || q.includes('season')) {
    if (summary.timeline.length === 0)
      return `No farm history recorded yet for ${summary.farmName}. Start logging crops and activities to build your farm story.`;
    const last = summary.timeline[0];
    return `The most recent event on ${summary.farmName} was: ${last.title} — "${last.description}" on ${last.date}.`;
  }

  return `I can answer questions about ${summary.farmName}'s soil analyses (${summary.soilAnalysesCount}), active crops (${summary.activeCropsCount}), activities (${summary.totalActivitiesCount}), and harvests (${summary.harvestRecordsCount}). Try asking about a specific topic.`;
}
