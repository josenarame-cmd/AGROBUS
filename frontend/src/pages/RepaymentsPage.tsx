import { useState, useEffect, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, CreditCard, TrendingUp, DollarSign, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { repaymentAPI, loanAPI } from '../services/api';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle } from '../components/ui/dialog';
import { PageHeader } from '../components/ui/page-header';
import { StatCard } from '../components/ui/stat-card';
import { fmt, fmtDate } from '../lib/utils';

interface Repayment {
  id: number; amountPaid: number; remainingBalance: number;
  paymentMethod?: string; transactionRef?: string; paymentDate: string;
  farmer?: { fullName: string }; loan?: { id: number; cropType: string };
}

const EMPTY_FORM = { loanId: '', amountPaid: '', paymentMethod: 'MOBILE_MONEY', transactionRef: '' };

export default function RepaymentsPage() {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loans, setLoans]           = useState<any[]>([]);
  const [total, setTotal]           = useState(0);
  const [open, setOpen]             = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const [rr, tr] = await Promise.all([repaymentAPI.getAll(), repaymentAPI.getTotal()]);
      setRepayments(rr.data); setTotal(tr.data ?? 0);
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to load'); }
    finally { setLoading(false); }
  };

  const loadLoans = async () => {
    try {
      const r = await loanAPI.getAll({ page: 0, size: 200 });
      setLoans((r.data.content ?? []).filter((l: any) => ['APPROVED','DELIVERED'].includes(l.status)));
    } catch { setLoans([]); }
  };

  useEffect(() => { load(); loadLoans(); }, []);

  const columns = useMemo<ColumnDef<Repayment>[]>(() => [
    { accessorKey: 'id', header: '#', size: 60,
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-500">#{getValue() as number}</span> },
    { accessorKey: 'farmer', header: 'Farmer',
      cell: ({ getValue }) => <span className="font-semibold text-slate-900">{(getValue() as any)?.fullName ?? '—'}</span> },
    { accessorKey: 'loan', header: 'Loan',
      cell: ({ getValue }) => {
        const l = getValue() as any;
        return l ? <span className="font-mono text-xs text-slate-600">#{l.id} · {l.cropType}</span> : '—';
      }
    },
    { accessorKey: 'amountPaid', header: 'Amount Paid', enableSorting: true,
      cell: ({ getValue }) => <span className="font-bold text-green-600">{fmt(getValue() as number)}</span> },
    { accessorKey: 'remainingBalance', header: 'Balance After',
      cell: ({ getValue }) => {
        const v = getValue() as number;
        return <span className={`font-semibold ${v === 0 ? 'text-green-600' : 'text-amber-600'}`}>
          {v === 0 ? '✓ Cleared' : fmt(v)}
        </span>;
      }
    },
    { accessorKey: 'paymentMethod', header: 'Method',
      cell: ({ getValue }) => {
        const m = (getValue() as string)?.replace(/_/g,' ') ?? '—';
        const color = m.includes('MOBILE') ? 'blue' : m.includes('BANK') ? 'purple' : 'default';
        return <Badge variant={color as any}>{m}</Badge>;
      }
    },
    { accessorKey: 'transactionRef', header: 'Reference',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-500">{(getValue() as string) || '—'}</span> },
    { accessorKey: 'paymentDate', header: 'Date', enableSorting: true,
      cell: ({ getValue }) => <span className="text-xs text-slate-500">{fmtDate(getValue() as string)}</span> },
  ], []);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await repaymentAPI.record({
        loan: { id: parseInt(form.loanId) },
        amountPaid: parseFloat(form.amountPaid),
        paymentMethod: form.paymentMethod,
        transactionRef: form.transactionRef || undefined,
      });
      toast.success('Payment recorded'); setOpen(false); setForm(EMPTY_FORM); load(); loadLoans();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Repayment Management" description="Track and record all loan repayments" icon={Receipt}>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Record Payment</Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard title="Total Collected"   value={fmt(total)}         icon={DollarSign} iconBg="bg-green-100"  iconColor="text-green-600" />
        <StatCard title="Transactions"      value={repayments.length}  icon={CreditCard} iconBg="bg-blue-100"   iconColor="text-blue-600" />
        <StatCard title="Active Loans"      value={loans.length}       icon={TrendingUp} iconBg="bg-amber-100"  iconColor="text-amber-600" />
      </div>

      <DataTable columns={columns} data={repayments} loading={loading}
        emptyMessage="No repayments recorded yet." pageSize={12} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleRecord}>
            <DialogBody className="grid gap-4">
              <Select label="Loan" required value={form.loanId} onChange={e => f('loanId', e.target.value)}>
                <option value="">Select active loan…</option>
                {loans.map((l: any) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} · {l.farmer?.fullName} · Balance: {fmt(l.remainingBalance)}
                  </option>
                ))}
              </Select>
              <Input label="Amount (RWF)" required type="number" value={form.amountPaid} onChange={e => f('amountPaid', e.target.value)} placeholder="0" />
              <Select label="Payment Method" value={form.paymentMethod} onChange={e => f('paymentMethod', e.target.value)}>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
              </Select>
              <Input label="Transaction Reference" value={form.transactionRef} onChange={e => f('transactionRef', e.target.value)} placeholder="e.g. MM-12345" />
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Record Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
