import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, Loader2, RefreshCw, Wheat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { farmerSelfAPI } from '../services/api';
import { FarmerEmptyState, FarmerPageHeader, FarmerStatCard } from '../components/farmer/FarmerUi';

interface CropRecord {
  id: number;
  farmName: string;
  cropType: string;
  variety?: string | null;
  status: string;
  actualHarvestDate?: string | null;
  yieldKg?: number | null;
}

function formatDate(value?: string | null) {
  if (!value) return 'Date not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-RW', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default function FarmerHarvestsPage() {
  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCrops([]);
    try {
      const { data } = await farmerSelfAPI.getCrops();
      setCrops(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not load your crop records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const harvests = useMemo(
    () => crops.filter(crop => crop.status === 'HARVESTED' || crop.status === 'SOLD'),
    [crops],
  );
  const yieldRecords = harvests.filter(crop => crop.yieldKg != null);
  const totalReportedYield = yieldRecords.reduce((total, crop) => total + (crop.yieldKg ?? 0), 0);

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="Farm management"
        title="Harvest records"
        description="Review harvests recorded on your crop cycles. Update harvest dates and yield in your crop records."
        icon={Wheat}
        action={{ label: 'Manage crop records', to: '/farmer/crops' }}
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

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <FarmerStatCard
          label="Harvested crop records"
          value={loading ? '…' : error ? '—' : String(harvests.length)}
          detail="Records marked harvested or sold"
          icon={Wheat}
        />
        <FarmerStatCard
          label="Reported yield"
          value={loading ? '…' : error ? '—' : `${new Intl.NumberFormat('en-RW', { maximumFractionDigits: 1 }).format(totalReportedYield)} kg`}
          detail={error ? 'Unavailable while crop records could not be loaded' : `${yieldRecords.length} records include a yield value`}
          icon={CalendarDays}
          tone="gold"
        />
      </div>

      {loading ? (
        <div className="farmer-surface flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm">Loading harvest records…</p>
        </div>
      ) : error ? null : harvests.length === 0 ? (
        <div className="farmer-surface">
          <FarmerEmptyState
            icon={Wheat}
            title="No harvests recorded"
            description="When a crop is marked harvested or sold in your crop records, it will appear here. This page does not create a separate sale or buyer transaction."
            action={{ label: 'Open crop records', to: '/farmer/crops' }}
          />
        </div>
      ) : (
        <div className="farmer-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Crop', 'Farm', 'Harvest date', 'Reported yield', 'Crop status'].map(label => (
                    <th key={label} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {harvests.map(crop => (
                  <tr key={crop.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{crop.cropType}</p>
                      {crop.variety && <p className="mt-1 text-xs text-slate-500">{crop.variety}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{crop.farmName}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(crop.actualHarvestDate)}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {crop.yieldKg == null ? 'Not recorded' : `${new Intl.NumberFormat('en-RW').format(crop.yieldKg)} kg`}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        crop.status === 'SOLD' ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
                      }`}>{crop.status === 'SOLD' ? 'Sold crop' : 'Harvested'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
            These figures come from crop records only; no buyer, sale price, or payment is recorded here. <Link to="/farmer/crops" className="font-semibold text-green-700 hover:underline">Edit crop records</Link>
          </div>
        </div>
      )}
    </section>
  );
}
