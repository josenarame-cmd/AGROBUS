import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Landmark, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { farmerSelfAPI } from '../services/api';
import { FarmerEmptyState, FarmerPageHeader, FarmerStatCard } from '../components/farmer/FarmerUi';

interface FinanceSummary {
  totalLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  deliveredLoans: number;
  repaidLoans: number;
  rejectedLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  outstandingBalance: number;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export default function FarmerFinancePage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const { data } = await farmerSelfAPI.getDashboard();
      setSummary(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not load your finance summary. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="Finance"
        title="Financial overview"
        description="A summary of input-credit requests and repayments recorded on your account."
        icon={Landmark}
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

      {loading ? (
        <div className="farmer-surface flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm">Loading your finance summary…</p>
        </div>
      ) : summary ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <FarmerStatCard label="Requested credit" value={formatAmount(summary.totalBorrowed)} detail="Excluding rejected requests" icon={Landmark} />
            <FarmerStatCard label="Repaid" value={formatAmount(summary.totalRepaid)} detail="Repayments recorded to date" icon={Landmark} tone="green" />
            <FarmerStatCard label="Outstanding" value={formatAmount(summary.outstandingBalance)} detail="Balance on approved or delivered loans" icon={Landmark} tone="gold" />
          </div>

          {summary.totalLoans === 0 ? (
            <div className="farmer-surface">
              <FarmerEmptyState
                icon={Landmark}
                title="No credit activity yet"
                description="Your summary will update when input-credit requests and repayments are recorded."
                action={{ label: 'View my loans', to: '/farmer/loans' }}
              />
            </div>
          ) : (
            <section className="farmer-surface p-5 sm:p-6">
              <h2 className="text-base font-bold text-slate-900">Request status</h2>
              <p className="mt-1 text-sm text-slate-500">{summary.totalLoans} loan request{summary.totalLoans === 1 ? '' : 's'} recorded on your account.</p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ['Pending', summary.pendingLoans],
                  ['Approved', summary.approvedLoans],
                  ['Delivered', summary.deliveredLoans],
                  ['Repaid', summary.repaidLoans],
                  ['Rejected', summary.rejectedLoans],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/farmer/loans" className="farmer-primary-action">View loan details</Link>
            <Link to="/farmer/repayments" className="farmer-inline-action">View repayments</Link>
          </div>
        </>
      ) : null}
    </section>
  );
}
