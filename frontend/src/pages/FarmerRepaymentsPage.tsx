import { useEffect, useState, useCallback } from 'react';
import { HandCoins, RefreshCw } from 'lucide-react';
import { farmerSelfAPI } from '../services/api';
import { FarmerEmptyState, FarmerPageHeader, FarmerSectionHeader } from '../components/farmer/FarmerUi';

interface Repayment {
  id: number;
  amountPaid: number;
  remainingBalance: number;
  paymentMethod?: string;
  transactionRef?: string;
  paymentDate: string;
  loan?: { id: number; cropType: string };
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency', currency: 'RWF', maximumFractionDigits: 0,
  }).format(n ?? 0);
}

export default function FarmerRepaymentsPage() {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await farmerSelfAPI.getMyRepayments();
      setRepayments(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not load your repayments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = repayments.reduce((s, r) => s + r.amountPaid, 0);

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="Finance"
        title="Repayments"
        description="A complete history of all payments you have made against your loans."
        icon={HandCoins}
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

      {/* Summary */}
      {!loading && repayments.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="farmer-surface px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total repaid</p>
            <p className="mt-1 text-xl font-bold text-green-600">{fmt(total)}</p>
          </div>
          <div className="farmer-surface px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transactions</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{repayments.length}</p>
          </div>
          <div className="farmer-surface px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last payment</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {new Date(repayments[0].paymentDate).toLocaleDateString('en-RW', { dateStyle: 'medium' })}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="farmer-surface overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading your repayments…</div>
        ) : repayments.length === 0 ? (
          <FarmerEmptyState
            icon={HandCoins}
            title="No repayments yet"
            description="Once you make a payment against a loan, it will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['#', 'Loan', 'Crop', 'Amount Paid', 'Balance After', 'Method', 'Reference', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repayments.map(r => (
                  <tr key={r.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono text-sm text-slate-700">#{r.id}</td>
                    <td className="px-5 py-3.5 font-mono text-sm text-slate-600">#{r.loan?.id ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{r.loan?.cropType ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-green-600">{fmt(r.amountPaid)}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-amber-600">{fmt(r.remainingBalance)}</td>
                    <td className="px-5 py-3.5">
                      {r.paymentMethod ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {r.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sm text-slate-500">{r.transactionRef ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {new Date(r.paymentDate).toLocaleDateString('en-RW', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
