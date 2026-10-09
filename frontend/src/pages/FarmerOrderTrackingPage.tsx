import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Landmark, Loader2, RefreshCw, Truck, Wheat } from 'lucide-react';
import { farmerSelfAPI } from '../services/api';
import { FarmerEmptyState, FarmerPageHeader } from '../components/farmer/FarmerUi';

interface InputCreditRequest {
  id: number;
  cropType: string;
  requestedInputs: string;
  estimatedCost: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'REPAID';
  requestDate: string;
  approvalDate?: string;
  deliveryDate?: string;
  rejectionReason?: string;
}

const STATUS_LABELS: Record<InputCreditRequest['status'], string> = {
  PENDING: 'Under review',
  APPROVED: 'Approved',
  REJECTED: 'Not approved',
  DELIVERED: 'Inputs marked delivered',
  REPAID: 'Repaid',
};

const FLOW = [
  { status: 'PENDING', label: 'Request submitted', icon: Clock3 },
  { status: 'APPROVED', label: 'Request approved', icon: CheckCircle2 },
  { status: 'DELIVERED', label: 'Delivery recorded', icon: Truck },
  { status: 'REPAID', label: 'Repaid', icon: Landmark },
] as const;

const FLOW_ORDER = FLOW.map(step => step.status);

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-RW', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function formatAmount(value: number) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export default function FarmerOrderTrackingPage() {
  const [requests, setRequests] = useState<InputCreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRequests([]);
    try {
      const { data } = await farmerSelfAPI.getMyLoans();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not load your input-credit requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="Input procurement"
        title="Request tracking"
        description="Follow review and delivery updates recorded for your input-credit requests."
        icon={Truck}
      />

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900">
        AGROBUS shows the request and delivery status recorded by the field team. A supplier catalogue and live parcel tracking are not connected.
      </div>

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
          <p className="text-sm">Loading your requests…</p>
        </div>
      ) : error ? null : requests.length === 0 ? (
        <div className="farmer-surface">
          <FarmerEmptyState
            icon={Wheat}
            title="No input-credit requests yet"
            description="Requests you submit for agricultural inputs will appear here with the status updates recorded by your field team."
            action={{ label: 'Request input credit', to: '/farmer/loans', state: { openForm: true } }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => {
            const currentStep = FLOW_ORDER.indexOf(request.status as typeof FLOW_ORDER[number]);
            const rejected = request.status === 'REJECTED';

            return (
              <article key={request.id} className="farmer-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Request #{request.id} · {formatDate(request.requestDate)}</p>
                    <h2 className="mt-2 text-lg font-bold text-slate-900">{request.cropType}</h2>
                    <p className="mt-1 text-sm text-slate-600">{request.requestedInputs}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Requested credit</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{formatAmount(request.estimatedCost)}</p>
                    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      rejected ? 'bg-red-50 text-red-700' :
                      request.status === 'PENDING' ? 'bg-amber-50 text-amber-800' :
                      'bg-green-50 text-green-800'
                    }`}>
                      {STATUS_LABELS[request.status]}
                    </span>
                  </div>
                </div>

                {rejected ? (
                  <p className="mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                    {request.rejectionReason || 'The request was not approved. Contact your field team if you need more information.'}
                  </p>
                ) : (
                  <ol aria-label={`Progress for input-credit request ${request.id}`} className="mt-6 grid gap-4 sm:grid-cols-4">
                    {FLOW.map((step, index) => {
                      const StepIcon = step.icon;
                      const complete = currentStep >= index;
                      const date = step.status === 'PENDING'
                        ? request.requestDate
                        : step.status === 'APPROVED'
                          ? request.approvalDate
                          : step.status === 'DELIVERED'
                            ? request.deliveryDate
                            : undefined;

                      return (
                        <li key={step.status} className={`flex items-start gap-3 ${complete ? 'text-green-800' : 'text-slate-400'}`}>
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${complete ? 'bg-green-100' : 'bg-slate-100'}`}>
                            <StepIcon className="h-4 w-4" />
                          </span>
                          <span className="pt-0.5">
                            <span className="block text-sm font-semibold">{step.label}</span>
                            <span className="mt-1 block text-xs text-slate-500">{complete ? formatDate(date) : 'Awaiting update'}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
