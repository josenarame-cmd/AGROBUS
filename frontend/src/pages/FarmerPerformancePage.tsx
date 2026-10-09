import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, BarChart3, Loader2, RefreshCw, Sprout, Wheat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { farmerSelfAPI, farmAPI } from '../services/api';
import { FarmerEmptyState, FarmerPageHeader, FarmerStatCard } from '../components/farmer/FarmerUi';

interface CropRecord {
  id: number;
  farmName: string;
  cropType: string;
  status: string;
  yieldKg?: number | null;
}

interface FarmRecord {
  id: number;
}

export default function FarmerPerformancePage() {
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCrops([]);
    setFarms([]);
    try {
      const [cropResponse, farmResponse] = await Promise.all([
        farmerSelfAPI.getCrops(),
        farmAPI.getMine(),
      ]);
      setCrops(Array.isArray(cropResponse.data) ? cropResponse.data : []);
      setFarms(Array.isArray(farmResponse.data) ? farmResponse.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not load your farm records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const summary = useMemo(() => {
    const yieldRecords = crops.filter(crop => crop.yieldKg != null);
    return {
      growing: crops.filter(crop => crop.status === 'GROWING').length,
      harvested: crops.filter(crop => crop.status === 'HARVESTED' || crop.status === 'SOLD').length,
      reportedYield: yieldRecords.reduce((sum, crop) => sum + (crop.yieldKg ?? 0), 0),
      yieldRecords: yieldRecords.length,
    };
  }, [crops]);

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="Farm management"
        title="Farm performance"
        description="A summary of farms, crop cycles, and yields that have been recorded in AGROBUS."
        icon={BarChart3}
      />

      {error && !loading && (
        <div role="alert" className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => void load()} className="flex items-center gap-1.5 font-semibold hover:underline">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FarmerStatCard label="My farms" value={loading ? '…' : error ? '—' : String(farms.length)} detail="Farm profiles on your account" icon={Sprout} />
        <FarmerStatCard label="Crop cycles" value={loading ? '…' : error ? '—' : String(crops.length)} detail="Records across your farms" icon={Wheat} tone="green" />
        <FarmerStatCard label="Growing now" value={loading ? '…' : error ? '—' : String(summary.growing)} detail="Crop records marked growing" icon={Sprout} tone="blue" />
        <FarmerStatCard label="Reported yield" value={loading ? '…' : error ? '—' : `${new Intl.NumberFormat('en-RW', { maximumFractionDigits: 1 }).format(summary.reportedYield)} kg`} detail={error ? 'Unavailable while farm records could not be loaded' : `${summary.yieldRecords} crop records include yield`} icon={BarChart3} tone="gold" />
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-700">
        This summary uses saved farm and crop records only. It does not estimate income, expenses, productivity benchmarks, or unrecorded yields.
      </div>

      {loading ? (
        <div className="farmer-surface flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm">Loading farm performance…</p>
        </div>
      ) : error ? null : crops.length === 0 ? (
        <div className="farmer-surface">
          <FarmerEmptyState
            icon={BarChart3}
            title="No crop records to summarize"
            description="Add crop cycles and record yields to see your farm activity reflected here."
            action={{ label: 'Manage crops', to: '/farmer/crops' }}
          />
        </div>
      ) : (
        <section className="farmer-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recorded crop progress</h2>
              <p className="mt-1 text-sm text-slate-500">{summary.harvested} crop cycles marked harvested or sold.</p>
            </div>
            <Link to="/farmer/crops" className="farmer-inline-action">Manage crop records</Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  {['Crop', 'Farm', 'Recorded status', 'Yield'].map(label => (
                    <th key={label} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crops.map(crop => (
                  <tr key={crop.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">{crop.cropType}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{crop.farmName}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{crop.status}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">
                      {crop.yieldKg == null ? 'Not recorded' : `${new Intl.NumberFormat('en-RW').format(crop.yieldKg)} kg`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}
