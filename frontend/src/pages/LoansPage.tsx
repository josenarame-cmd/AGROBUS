import { useState, useEffect, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, CheckCircle, XCircle, Truck, Eye, FileText, TrendingUp, Clock, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { loanAPI, farmerAPI } from '../services/api';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Badge, type BadgeProps } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { PageHeader } from '../components/ui/page-header';
import { StatCard } from '../components/ui/stat-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { fmt, fmtDate } from '../lib/utils';

interface Loan {
  id: number; cropType: string; requestedInputs: string; quantity?: number;
  estimatedCost: number; farmSize?: number; season?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'REPAID';
  amountRepaid: number; remainingBalance: number; rejectionReason?: string;
  requestDate: string; approvalDate?: string; deliveryDate?: string;
  farmer?: { id: number; fullName: string; district?: string };
}

const STATUS_BADGE: Record<string, BadgeProps['variant']> = {
  PENDING: 'amber', APPROVED: 'blue', DELIVERED: 'purple', REPAID: 'green', REJECTED: 'red',
};

const EMPTY_FORM = { farmerId: '', cropType: '', requestedInputs: '', quantity: '', estimatedCost: '', farmSize: '', season: '' };

function RepaymentBar({ repaid, total }: { repaid: number; total: number }) {
  const pct = total ? Math.min(100, Math.round((repaid / total) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] font-semibold text-slate-500">{pct}% repaid</p>
    </div>
  );
}

export default function LoansPage() {
  const [loans, setLoans]         = useState<Loan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [farmers, setFarmers]     = useState<any[]>([]);
  const [open, setOpen]           = useState(false);
  const [detailOpen, setDetail]   = useState(false);
  const [rejectOpen, setReject]   = useState(false);
  const [selected, setSelected]   = useState<Loan | null>(null);
  const [saving, setSaving]       = useState(false);
  const [statusFilter, setFilter] = useState('');
  const [rejectReason, setReason] = useState('');
  const [form, setForm]           = useState(EMPTY_FORM);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadPage = async (p = 0, status = statusFilter) => {
    setLoading(true);
    try {
      const res = status
        ? await loanAPI.getByStatus(status, { page: p, size: 50 })
        : await loanAPI.getAll({ page: p, size: 50 });
      setLoans(res.data.content ?? []);
      setTotalPages(res.data.totalPages ?? 0);
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to load loans'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPage(0, statusFilter); }, [statusFilter]);
  useEffect(() => { farmerAPI.getAll().then(r => setFarmers(r.data)).catch(() => {}); }, []);

  const stats = useMemo(() => ({
    total:   loans.length,
    pending: loans.filter(l => l.status === 'PENDING').length,
    active:  loans.filter(l => ['APPROVED','DELIVERED'].includes(l.status)).length,
    repaid:  loans.filter(l => l.status === 'REPAID').length,
  }), [loans]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await loanAPI.create({
        farmerId: parseInt(form.farmerId),
        cropType: form.cropType, requestedInputs: form.requestedInputs,
        quantity: form.quantity ? parseFloat(form.quantity) : undefined,
        estimatedCost: parseFloat(form.estimatedCost),
        farmSize: form.farmSize ? parseFloat(form.farmSize) : undefined,
        season: form.season || undefined,
      });
      toast.success('Loan request submitted'); setOpen(false); setForm(EMPTY_FORM); loadPage(0);
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  const handleApprove  = async (id: number) => { try { await loanAPI.approve(id);  toast.success('Loan approved');  loadPage(); } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed'); } };
  const handleDeliver  = async (id: number) => { try { await loanAPI.deliver(id);  toast.success('Marked delivered'); loadPage(); } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed'); } };
  const handleReject   = async () => {
    if (!selected) return; setSaving(true);
    try { await loanAPI.reject(selected.id, rejectReason); toast.success('Loan rejected'); setReject(false); setReason(''); loadPage(); }
    catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  const columns = useMemo<ColumnDef<Loan>[]>(() => [
    { accessorKey: 'id', header: '#', size: 60,
      cell: ({ getValue }) => <span className="font-mono text-xs font-medium text-slate-500">#{getValue() as number}</span> },
    { accessorKey: 'farmer', header: 'Farmer',
      cell: ({ getValue }) => {
        const f = getValue() as Loan['farmer'];
        return f ? (
          <div>
            <p className="font-semibold text-slate-900">{f.fullName}</p>
            {f.district && <p className="text-xs text-slate-400">{f.district}</p>}
          </div>
        ) : <span className="text-slate-400">—</span>;
      }
    },
    { accessorKey: 'cropType', header: 'Crop',
      cell: ({ getValue }) => <span className="text-sm text-slate-700">{getValue() as string}</span> },
    { accessorKey: 'requestedInputs', header: 'Inputs',
      cell: ({ getValue }) => <span className="line-clamp-2 max-w-[160px] text-xs text-slate-500">{getValue() as string}</span> },
    { accessorKey: 'estimatedCost', header: 'Amount', enableSorting: true,
      cell: ({ getValue }) => <span className="font-semibold text-slate-900">{fmt(getValue() as number)}</span> },
    { accessorKey: 'status', header: 'Status',
      cell: ({ row }) => (
        <div className="space-y-1.5">
          <Badge variant={STATUS_BADGE[row.original.status]}>{row.original.status}</Badge>
          <RepaymentBar repaid={row.original.amountRepaid} total={row.original.estimatedCost} />
        </div>
      )
    },
    { accessorKey: 'season', header: 'Season',
      cell: ({ getValue }) => <span className="text-sm text-slate-500">{(getValue() as string) || '—'}</span> },
    { accessorKey: 'requestDate', header: 'Date', enableSorting: true,
      cell: ({ getValue }) => <span className="text-xs text-slate-500">{fmtDate(getValue() as string)}</span> },
    {
      id: 'actions', header: '', size: 110,
      cell: ({ row: { original: l } }) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => { setSelected(l); setDetail(true); }}>
                <Eye className="h-3.5 w-3.5 text-slate-500" />
              </Button>
            </TooltipTrigger><TooltipContent>View details</TooltipContent></Tooltip>

            {l.status === 'PENDING' && (<>
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={() => handleApprove(l.id)}>
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                </Button>
              </TooltipTrigger><TooltipContent>Approve</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={() => { setSelected(l); setReject(true); }}>
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                </Button>
              </TooltipTrigger><TooltipContent>Reject</TooltipContent></Tooltip>
            </>)}

            {l.status === 'APPROVED' && (
              <Tooltip><TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDeliver(l.id)}>
                  <Truck className="h-3.5 w-3.5 text-purple-500" />
                </Button>
              </TooltipTrigger><TooltipContent>Mark delivered</TooltipContent></Tooltip>
            )}
          </div>
        </TooltipProvider>
      ),
    },
  ], []);

  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Loan Requests" description="Manage agricultural input credit applications" icon={FileText}>
        <Button onClick={() => { setForm(EMPTY_FORM); setOpen(true); }}><Plus className="h-4 w-4" /> New Request</Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Loans"   value={stats.total}   icon={FileText}   iconBg="bg-blue-100"   iconColor="text-blue-600" />
        <StatCard title="Pending"       value={stats.pending} icon={Clock}      iconBg="bg-amber-100"  iconColor="text-amber-600" />
        <StatCard title="Active"        value={stats.active}  icon={TrendingUp} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard title="Fully Repaid"  value={stats.repaid}  icon={DollarSign} iconBg="bg-green-100"  iconColor="text-green-600" />
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {['', 'PENDING', 'APPROVED', 'DELIVERED', 'REPAID', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={loans} loading={loading}
        emptyMessage="No loan requests found." pageSize={10} />

      {/* Create loan dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader><DialogTitle>New Loan Request</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate}>
            <DialogBody className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Select label="Farmer" required value={form.farmerId} onChange={e => f('farmerId', e.target.value)}>
                  <option value="">Select farmer…</option>
                  {farmers.map((fa: any) => <option key={fa.id} value={fa.id}>{fa.fullName} — {fa.district}</option>)}
                </Select>
              </div>
              <Input label="Crop Type" required value={form.cropType} onChange={e => f('cropType', e.target.value)} placeholder="e.g. Maize" />
              <Select label="Season" value={form.season} onChange={e => f('season', e.target.value)}>
                <option value="">Select season…</option>
                <option>Season A</option><option>Season B</option><option>Season C</option>
              </Select>
              <div className="sm:col-span-2">
                <Input label="Requested Inputs" required value={form.requestedInputs} onChange={e => f('requestedInputs', e.target.value)} placeholder="e.g. 50kg seeds, 100kg fertilizer" />
              </div>
              <Input label="Quantity" type="number" value={form.quantity} onChange={e => f('quantity', e.target.value)} />
              <Input label="Estimated Cost (RWF)" required type="number" value={form.estimatedCost} onChange={e => f('estimatedCost', e.target.value)} />
              <Input label="Farm Size (ha)" type="number" step="0.1" value={form.farmSize} onChange={e => f('farmSize', e.target.value)} />
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      {selected && (
        <Dialog open={detailOpen} onOpenChange={setDetail}>
          <DialogContent size="md">
            <DialogHeader>
              <DialogTitle>Loan #{selected.id}</DialogTitle>
              <DialogDescription>{selected.farmer?.fullName} — {selected.cropType}</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Status',    <Badge variant={STATUS_BADGE[selected.status]}>{selected.status}</Badge>],
                  ['Amount',    fmt(selected.estimatedCost)],
                  ['Repaid',    fmt(selected.amountRepaid)],
                  ['Balance',   fmt(selected.remainingBalance)],
                  ['Season',    selected.season || '—'],
                  ['Requested', fmtDate(selected.requestDate)],
                  ['Approved',  fmtDate(selected.approvalDate)],
                  ['Delivered', fmtDate(selected.deliveryDate)],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <div className="mt-1 font-medium text-slate-900">{value}</div>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Inputs</p>
                <p className="mt-1 text-sm text-slate-700">{selected.requestedInputs}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-500">Repayment progress</span>
                  <span className="font-bold">{selected.estimatedCost ? Math.round((selected.amountRepaid/selected.estimatedCost)*100) : 0}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${selected.estimatedCost ? Math.min(100,(selected.amountRepaid/selected.estimatedCost)*100) : 0}%` }} />
                </div>
              </div>
              {selected.rejectionReason && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <span className="font-semibold">Rejection reason: </span>{selected.rejectionReason}
                </div>
              )}
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={v => { setReject(v); if (!v) setReason(''); }}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>Reject Loan #{selected?.id}</DialogTitle></DialogHeader>
          <DialogBody>
            <textarea value={rejectReason} onChange={e => setReason(e.target.value)} rows={4}
              placeholder="Provide a clear reason for rejection…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 resize-none" />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReject(false)}>Cancel</Button>
            <Button variant="destructive" loading={saving} onClick={handleReject}>Reject Loan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
