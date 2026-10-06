import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Landmark, RefreshCw, Eye, X, Plus, Loader2,
  Send, AlertCircle, CheckCircle2, Clock, Truck,
  Banknote, Scale, Wheat, Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
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

const EMPTY_FORM = {
  cropType: '',
  requestedInputs: '',
  quantity: '',
  estimatedCost: '',
  farmSize: '',
  season: '',
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  PENDING:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-700 border-amber-200',   icon: Clock },
  APPROVED:  { label: 'Approved',  cls: 'bg-blue-100 text-blue-700 border-blue-200',      icon: CheckCircle2 },
  REJECTED:  { label: 'Rejected',  cls: 'bg-red-100 text-red-700 border-red-200',         icon: AlertCircle },
  DELIVERED: { label: 'Delivered', cls: 'bg-purple-100 text-purple-700 border-purple-200',icon: Truck },
  REPAID:    { label: 'Repaid',    cls: 'bg-green-100 text-green-700 border-green-200',   icon: CheckCircle2 },
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FarmerLoansPage() {
  const [loans, setLoans]         = useState<Loan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [selected, setSelected]   = useState<Loan | null>(null);
  const [statusFilter, setFilter] = useState<string>('');
  const [formOpen, setFormOpen]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const location = useLocation();

  // Auto-open form if navigated from dashboard with state
  useEffect(() => {
    if ((location.state as any)?.openForm) {
      setFormOpen(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

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

  const openForm = () => { setForm(EMPTY_FORM); setFormOpen(true); };
  const closeForm = () => setFormOpen(false);
  const f = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        cropType:        form.cropType.trim(),
        requestedInputs: form.requestedInputs.trim(),
        quantity:        form.quantity ? parseFloat(form.quantity) : undefined,
        estimatedCost:   parseFloat(form.estimatedCost),
        farmSize:        form.farmSize ? parseFloat(form.farmSize) : undefined,
        season:          form.season || undefined,
      };
      await farmerSelfAPI.requestLoan(payload);
      toast.success('Loan request submitted! Admin has been notified.');
      closeForm();
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to submit loan request. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="Finance"
        title="My Loans"
        description="Request agricultural input credit and track the status of all your applications."
        icon={Landmark}
        action={{ label: 'Request a loan', to: '' }}
      />

      {/* Inline action override — open form */}
      <div className="mb-6 flex justify-end -mt-4">
        <button onClick={openForm} className="farmer-primary-action gap-2">
          <Plus className="h-4 w-4" /> Request a Loan
        </button>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
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
            { label: 'Total borrowed', value: fmt(loans.filter(l => l.status !== 'REJECTED').reduce((s, l) => s + l.estimatedCost, 0)), icon: Banknote },
            { label: 'Total repaid',   value: fmt(loans.reduce((s, l) => s + l.amountRepaid, 0)), icon: CheckCircle2 },
            { label: 'Outstanding',    value: fmt(loans.filter(l => l.status === 'APPROVED' || l.status === 'DELIVERED').reduce((s, l) => s + l.remainingBalance, 0)), icon: Scale },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="farmer-surface flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <Icon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status filter chips */}
      {!loading && loans.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {(['', 'PENDING', 'APPROVED', 'DELIVERED', 'REPAID', 'REJECTED'] as const).map(s => {
            const cfg = s ? STATUS_CONFIG[s] : null;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-xl px-4 py-2 text-sm font-medium border transition-all ${
                  statusFilter === s
                    ? 'gradient-green text-white shadow-lg border-transparent'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s ? `${cfg!.label} (${loans.filter(l => l.status === s).length})` : 'All'}
              </button>
            );
          })}
        </div>
      )}

      {/* Loan Table */}
      <div className="farmer-surface overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-sm">Loading your loans…</p>
          </div>
        ) : visible.length === 0 ? (
          <FarmerEmptyState
            icon={Landmark}
            title={statusFilter ? `No ${STATUS_CONFIG[statusFilter]?.label.toLowerCase()} loans` : 'No loans yet'}
            description="Submit a loan request to get started with agricultural input credit."
            action={!statusFilter ? { label: 'Request your first loan', to: '' } : undefined}
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
                {visible.map(l => {
                  const cfg = STATUS_CONFIG[l.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={l.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-mono text-sm font-medium text-slate-700">#{l.id}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">
                        <div className="flex items-center gap-2">
                          <Wheat className="h-4 w-4 text-slate-400 shrink-0" />
                          {l.cropType}
                        </div>
                      </td>
                      <td className="max-w-[160px] truncate px-5 py-3.5 text-sm text-slate-600">{l.requestedInputs}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{fmt(l.estimatedCost)}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-green-600">{fmt(l.amountRepaid)}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-amber-600">{fmt(l.remainingBalance)}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{l.season ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.cls}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setSelected(l)} className="rounded-lg p-2 hover:bg-slate-100" title="View details">
                          <Eye className="h-4 w-4 text-slate-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Loan Request Form (modal) ─────────────────────────────────────────── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg animate-fade-in rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-green-50 to-emerald-50">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-700">Agricultural Finance</p>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">New Loan Request</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your request will be reviewed by the admin team.</p>
              </div>
              <button onClick={closeForm} className="rounded-xl p-2 hover:bg-white/80 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
              <div className="p-6 space-y-4">

                {/* Info banner */}
                <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>Once submitted, the admin will be notified immediately and will review your request within 2-3 business days.</p>
                </div>

                {/* Crop Type */}
                <label className="profile-field">
                  <span>Crop Type *</span>
                  <div className="relative">
                    <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      required
                      value={form.cropType}
                      onChange={f('cropType')}
                      placeholder="e.g. Maize, Beans, Rice"
                      className="pl-9"
                    />
                  </div>
                </label>

                {/* Requested Inputs */}
                <label className="profile-field">
                  <span>Requested Inputs *</span>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <textarea
                      required
                      rows={2}
                      value={form.requestedInputs}
                      onChange={f('requestedInputs')}
                      placeholder="e.g. Fertilizer (DAP), Pesticide, Seeds..."
                      className="pl-9 pt-2.5 block w-full rounded-lg border-slate-200 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-3 resize-none"
                    />
                  </div>
                </label>

                {/* Cost + Quantity row */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="profile-field">
                    <span>Estimated Cost (RWF) *</span>
                    <input
                      required
                      type="number"
                      min="1"
                      step="100"
                      value={form.estimatedCost}
                      onChange={f('estimatedCost')}
                      placeholder="e.g. 150000"
                    />
                  </label>
                  <label className="profile-field">
                    <span>Quantity (units)</span>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={form.quantity}
                      onChange={f('quantity')}
                      placeholder="e.g. 5"
                    />
                  </label>
                </div>

                {/* Farm size + Season row */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="profile-field">
                    <span>Farm Size (ha)</span>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={form.farmSize}
                      onChange={f('farmSize')}
                      placeholder="e.g. 2.5"
                    />
                  </label>
                  <label className="profile-field">
                    <span>Season</span>
                    <select value={form.season} onChange={f('season')}>
                      <option value="">Select season</option>
                      <option value="Season A (Jan-May)">Season A (Jan–May)</option>
                      <option value="Season B (Jun-Sep)">Season B (Jun–Sep)</option>
                      <option value="Season C (Oct-Dec)">Season C (Oct–Dec)</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 gap-3">
                <button type="button" onClick={closeForm} className="profile-secondary-button">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="farmer-primary-action gap-2 min-w-[160px] justify-center"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                  ) : (
                    <><Send className="h-4 w-4" /> Submit Request</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Loan #{selected.id}</h2>
                <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_CONFIG[selected.status].cls}`}>
                  {selected.status}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-xl p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Crop',      selected.cropType],
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
              <p className="mb-1 text-xs text-slate-500">Inputs requested</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">{selected.requestedInputs}</p>
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
