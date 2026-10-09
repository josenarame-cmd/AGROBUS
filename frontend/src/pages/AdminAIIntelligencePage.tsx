import { useEffect, useState } from 'react';
import {
  BrainCircuit, FlaskConical, Sprout, Activity, TrendingUp,
  BarChart2, AlertCircle, Loader2, RefreshCw, Shield, Leaf, Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminIntelligenceAPI } from '../services/api';

type ConfidencePoint = { level: string; count: number };
type AdminIntelligence = {
  totalFarmsWithAIData: number;
  totalSoilAnalyses: number;
  totalCropCycles: number;
  totalActivityRecords: number;
  totalInputUsageRecords: number;
  totalHarvestRecords: number;
  platformDataCompleteness: number;
  soilTypeDistribution: Record<string, number>;
  cropTypeDistribution: Record<string, number>;
  activityTypeDistribution: Record<string, number>;
  soilConfidenceDistribution: ConfidencePoint[];
  dataQualityNotes: string[];
};

export default function AdminAIIntelligencePage() {
  const [data, setData] = useState<AdminIntelligence | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminIntelligenceAPI.getOverview()
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error('Could not load AI platform overview.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="animate-fade-in max-w-[1280px] mx-auto px-4 sm:px-6 pb-16 space-y-6">

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-2xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-green-500 opacity-15 blur-[80px]" />
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/8 px-3.5 py-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
              <Leaf className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-green-300">AGROBUS AI · Admin View</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight lg:text-4xl">AI Intelligence Overview</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            Platform-wide aggregated intelligence metrics. All data is anonymised — no individual farmer information is exposed here.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading platform intelligence…</p>
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 py-16 text-center">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Could not load intelligence data.</p>
          <button onClick={load} className="mt-4 flex items-center gap-2 mx-auto rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* ── PLATFORM STATS ───────────────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Platform Intelligence Summary</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { icon: Database, label: 'Farms with AI Data', value: data.totalFarmsWithAIData, tone: 'green' },
                { icon: FlaskConical, label: 'Soil Analyses', value: data.totalSoilAnalyses, tone: 'amber' },
                { icon: Sprout, label: 'Crop Cycles', value: data.totalCropCycles, tone: 'emerald' },
                { icon: Activity, label: 'Activity Records', value: data.totalActivityRecords, tone: 'blue' },
                { icon: TrendingUp, label: 'Input Usage', value: data.totalInputUsageRecords, tone: 'purple' },
                { icon: BarChart2, label: 'Harvest Records', value: data.totalHarvestRecords, tone: 'slate' },
              ].map(({ icon: Icon, label, value, tone }) => {
                const toneClass: Record<string, string> = {
                  green: 'bg-green-50 border-green-100 text-green-700',
                  amber: 'bg-amber-50 border-amber-100 text-amber-700',
                  emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
                  blue: 'bg-blue-50 border-blue-100 text-blue-700',
                  purple: 'bg-purple-50 border-purple-100 text-purple-700',
                  slate: 'bg-slate-50 border-slate-100 text-slate-600',
                };
                return (
                  <div key={label} className={`rounded-2xl border p-4 text-center ${toneClass[tone]}`}>
                    <Icon className="h-5 w-5 mx-auto mb-2 opacity-80" />
                    <p className="text-2xl font-black">{value.toLocaleString()}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── PLATFORM COMPLETENESS ─────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Platform Data Completeness</h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                data.platformDataCompleteness >= 70 ? 'bg-green-100 text-green-700' :
                data.platformDataCompleteness >= 40 ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>{data.platformDataCompleteness}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${data.platformDataCompleteness}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">Percentage of farms with ≥2 of 3 core data pillars (crop cycle, soil analysis, activities).</p>
          </div>

          {/* ── DISTRIBUTIONS GRID ───────────────────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-3">

            {/* Soil type distribution */}
            <DistributionCard
              title="Soil Type Distribution" icon={FlaskConical}
              data={data.soilTypeDistribution} colorClass="bg-amber-500"
            />

            {/* Crop type distribution */}
            <DistributionCard
              title="Crop Type Distribution" icon={Sprout}
              data={data.cropTypeDistribution} colorClass="bg-green-500"
            />

            {/* Activity type distribution */}
            <DistributionCard
              title="Activity Type Distribution" icon={Activity}
              data={data.activityTypeDistribution} colorClass="bg-blue-500"
              formatKey={(k) => k.replace(/_/g, ' ')}
            />
          </div>

          {/* ── SOIL CONFIDENCE ──────────────────────────────────────────────── */}
          {data.soilConfidenceDistribution.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Soil Analysis Confidence Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                {data.soilConfidenceDistribution.map(({ level, count }) => {
                  const conf: Record<string, string> = {
                    HIGH: 'bg-green-50 border-green-200 text-green-700',
                    MEDIUM: 'bg-amber-50 border-amber-200 text-amber-700',
                    LOW: 'bg-red-50 border-red-200 text-red-700',
                  };
                  return (
                    <div key={level} className={`rounded-xl border p-4 text-center ${conf[level] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      <p className="text-3xl font-black">{count}</p>
                      <p className="text-xs font-bold uppercase tracking-wide mt-1 opacity-80">{level} Confidence</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── DATA QUALITY NOTES ───────────────────────────────────────────── */}
          {data.dataQualityNotes.length > 0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700">Data Quality Notes</h3>
              </div>
              <ul className="space-y-2">
                {data.dataQualityNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── SCIENTIFIC SAFETY ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <BrainCircuit className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">AGROBUS AI — Research Principles</p>
                <ul className="space-y-1.5 text-xs text-slate-500 leading-relaxed">
                  <li>• Soil AI is a <strong>visual soil-type classifier only</strong> — no NPK or pH is estimated without lab data.</li>
                  <li>• Farm-history correlations are observational — causal claims require experimental design.</li>
                  <li>• All platform analytics use anonymized aggregate data — no individual farmer data is exposed here.</li>
                  <li>• Minimum sample sizes are required before any correlation is shown to farmers.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Refresh */}
          <div className="flex justify-end">
            <button onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition">
              <RefreshCw className="h-4 w-4" /> Refresh Data
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Reusable distribution chart card ─────────────────────────────────────────
function DistributionCard({
  title, icon: Icon, data, colorClass, formatKey = k => k
}: {
  title: string;
  icon: typeof FlaskConical;
  data: Record<string, number>;
  colorClass: string;
  formatKey?: (key: string) => string;
}) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 6);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-slate-500" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h3>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">No data recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([key, count]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700 capitalize truncate max-w-[75%]">{formatKey(key)}</span>
                <span className="text-xs font-bold text-slate-500">{count}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colorClass} opacity-70 transition-all duration-500`}
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
