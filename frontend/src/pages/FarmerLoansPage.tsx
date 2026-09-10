import { useEffect, useState, useCallback } from 'react';
import { Landmark, RefreshCw, Eye, X } from 'lucide-react';
import { farmerSelfAPI } from '../services/api';
import { FarmerEmptyState, FarmerPageHeader, FarmerSectionHeader } from '../components/farmer/FarmerUi';

interface Loan {
  id: number;
  cropType: string;
  requestedInputs: string;
  quantity?: number;
  estimatedCost: number;
  farmSize?: number;
  season?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'REPAID';
  amountRepaid: number;
  remainingBalance: number;
  rejectionReason?: string;
  requestDate: string;
  approvalDate?: string;
  deliveryDate?: string;
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700',
  APPROVED:  'bg-blue-100 text-blue-700',
  REJECTED:  'bg-red-100 text-red-700',
  DELIVERED: 'bg-purple-100 text-purple-700',
  REPAID:    'bg-green-100 text-green-700',
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency', currency: 'RWF', maximumFractionDigits: 0,
  }).format(n ?? 0);
}

function pct(repaid: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((repaid / total) * 100));
}

export default function FarmerLoansPage() {
  const [loans, setLoans]         = useState<Loan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [selected, setSelected]   = useState<Loan | null>(null);
  const [statusFilter, setFilter] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await farmerSelfAPI.getMyLoans();
      setLoans(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not load your loans. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = statusFilter ? loans.filter(l => l.status === statusFilter) : loans;

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="Finance"
        title="My Loans"
        description="View the status and details of all your agricultural input credit applications."
        icon={Landmark}
      />

      {/* Error */}
      {error && !loading && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <span className="flex-1">{error}</span>
          <button onClick={load} className="flex items-center gap-1.5 font-semibold hover:underline">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}

      {/* Summary strip */}
      {!loading && loans.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Total borrowed', value: fmt(loans.filter(l => l.status !== 'REJECTED').reduce((s, l) => s + l.estimatedCost, 0)) },
            { label: 'Total repaid',   value: fmt(loans.reduce((s, l) => s + l.amountRepaid, 0)) },
            { label: 'Outstanding',    value: fmt(loans.filter(l => l.status === 'APPROVED' || l.status === 'DELIVERED').reduce((s, l) => s + l.remainingBalance, 0)) },
          ].map(({ label, value }) => (
            <div key={label} className="farmer-surface px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status filter */}
      {!loading && loans.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {['', 'PENDING', 'APPROVED', 'DELIVERED', 'REPAID', 'REJECTED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                statusFilter === s
                  ? 'gradient-green text-white shadow-lg'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s || 'All'}{s && ` (${loans.filter(l => l.status === s).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="farmer-surface overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading your loans…</div>
        ) : visible.length === 0 ? (
          <FarmerEmptyState
            icon={Landmark}
            title={statusFilter ? `No ${statusFilter.toLowerCase()} loans` : 'No loans yet'}
            description="Your agricultural input credit applications will appear here once submitted."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['#', 'Crop', 'Inputs', 'Amount', 'Repaid', 'Balance', 'Season', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(l => (
                  <tr key={l.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono text-sm font-medium text-slate-700">#{l.id}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">{l.cropType}</td>
                    <td className="max-w-[160px] truncate px-5 py-3.5 text-sm text-slate-600">{l.requestedInputs}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{fmt(l.estimatedCost)}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-green-600">{fmt(l.amountRepaid)}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-amber-600">{fmt(l.remainingBalance)}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{l.season ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[l.status]}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelected(l)}
                        className="rounded-lg p-2 hover:bg-slate-100"
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Loan #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="rounded-xl p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Crop',      selected.cropType],
                ['Status',    selected.status],
                ['Amount',    fmt(selected.estimatedCost)],
                ['Repaid',    fmt(selected.amountRepaid)],
                ['Balance',   fmt(selected.remainingBalance)],
                ['Season',    selected.season ?? '—'],
                ['Applied',   new Date(selected.requestDate).toLocaleDateString()],
                ['Approved',  selected.approvalDate ? new Date(selected.approvalDate).toLocaleDateString() : '—'],
                ['Delivered', selected.deliveryDate ? new Date(selected.deliveryDate).toLocaleDateString() : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs text-slate-500">Inputs requested</p>
              <p className="text-sm text-slate-700">{selected.requestedInputs}</p>
            </div>

            {/* Repayment progress bar */}
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500">Repayment progress</span>
                <span className="font-semibold text-slate-900">{pct(selected.amountRepaid, selected.estimatedCost)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-700"
                  style={{ width: `${pct(selected.amountRepaid, selected.estimatedCost)}%` }}
                />
              </div>
            </div>

            {selected.rejectionReason && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="font-semibold">Rejection reason: </span>{selected.rejectionReason}
              </div>
            )}

            <button
              onClick={() => setSelected(null)}
              className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
