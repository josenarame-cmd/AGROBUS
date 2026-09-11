import { useState, useEffect, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, AlertTriangle, Package, ArrowDown, Boxes } from 'lucide-react';
import toast from 'react-hot-toast';
import { inputAPI, supplierAPI } from '../services/api';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle } from '../components/ui/dialog';
import { PageHeader } from '../components/ui/page-header';
import { StatCard } from '../components/ui/stat-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { fmt, fmtDate } from '../lib/utils';

interface AgInput {
  id: number; inputName: string; category: 'SEEDS' | 'FERTILIZERS' | 'PESTICIDES';
  quantityAvailable: number; quantityDistributed: number;
  unitPrice: number; expirationDate?: string; lowStockThreshold: number;
  supplier?: { id: number; name: string };
}

const CAT_BADGE: Record<string, { v: 'green' | 'blue' | 'orange'; label: string }> = {
  SEEDS:       { v: 'green',  label: 'Seeds' },
  FERTILIZERS: { v: 'blue',   label: 'Fertilizers' },
  PESTICIDES:  { v: 'orange', label: 'Pesticides' },
};

const EMPTY_FORM = {
  inputName: '', category: 'SEEDS', quantityAvailable: '', unitPrice: '',
  expirationDate: '', lowStockThreshold: '50', supplierId: '',
};

export default function InputsPage() {
  const [inputs, setInputs]       = useState<AgInput[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [distOpen, setDistOpen]   = useState(false);
  const [editing, setEditing]     = useState<AgInput | null>(null);
  const [selected, setSelected]   = useState<AgInput | null>(null);
  const [distQty, setDistQty]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [form, setForm]           = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const res = catFilter ? await inputAPI.getByCategory(catFilter) : await inputAPI.getAll();
      setInputs(res.data);
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to load inputs'); setInputs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [catFilter]);
  useEffect(() => { supplierAPI.getActive().then(r => setSuppliers(r.data)).catch(() => {}); }, []);

  const stats = useMemo(() => ({
    total:     inputs.length,
    lowStock:  inputs.filter(i => i.quantityAvailable <= i.lowStockThreshold).length,
    seeds:     inputs.filter(i => i.category === 'SEEDS').reduce((s, i) => s + i.quantityAvailable, 0),
    fertil:    inputs.filter(i => i.category === 'FERTILIZERS').reduce((s, i) => s + i.quantityAvailable, 0),
  }), [inputs]);

  const buildPayload = (f: typeof form) => ({
    inputName: f.inputName,
    category: f.category,
    quantityAvailable: parseInt(f.quantityAvailable) || 0,
    unitPrice: parseFloat(f.unitPrice) || 0,
    expirationDate: f.expirationDate || null,
    lowStockThreshold: parseInt(f.lowStockThreshold) || 50,
    // only include supplier if a valid ID was selected
    ...(f.supplierId ? { supplier: { id: parseInt(f.supplierId) } } : {}),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await inputAPI.update(editing.id, buildPayload(form)); toast.success('Input updated'); }
      else         { await inputAPI.create(buildPayload(form));             toast.success('Input added'); }
      setOpen(false); setEditing(null); setForm(EMPTY_FORM); load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this input item?')) return;
    try { await inputAPI.delete(id); toast.success('Deleted'); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed'); }
  };

  const handleDistribute = async () => {
    if (!selected || !distQty) return; setSaving(true);
    try {
      await inputAPI.distribute(selected.id, parseInt(distQty));
      toast.success(`Distributed ${distQty} units of ${selected.inputName}`);
      setDistOpen(false); setDistQty(''); load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Insufficient stock or error'); }
    finally { setSaving(false); }
  };

  const openEdit = (item: AgInput) => {
    setEditing(item);
    setForm({
      inputName: item.inputName, category: item.category,
      quantityAvailable: item.quantityAvailable.toString(),
      unitPrice: item.unitPrice?.toString() ?? '',
      expirationDate: item.expirationDate ?? '',
      lowStockThreshold: item.lowStockThreshold?.toString() ?? '50',
      supplierId: item.supplier?.id?.toString() ?? '',
    });
    setOpen(true);
  };

  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const columns = useMemo<ColumnDef<AgInput>[]>(() => [
    {
      accessorKey: 'inputName', header: 'Input Name',
      cell: ({ row: { original: i } }) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm
            ${i.category === 'SEEDS' ? 'bg-green-100 text-green-700'
            : i.category === 'FERTILIZERS' ? 'bg-blue-100 text-blue-700'
            : 'bg-orange-100 text-orange-700'}`}>
            <Package className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{i.inputName}</p>
            {i.supplier && <p className="text-xs text-slate-400">{i.supplier.name}</p>}
          </div>
        </div>
      ),
    },
    { accessorKey: 'category', header: 'Category',
      cell: ({ getValue }) => {
        const c = getValue() as string;
        return <Badge variant={CAT_BADGE[c]?.v ?? 'default'}>{CAT_BADGE[c]?.label ?? c}</Badge>;
      }
    },
    {
      accessorKey: 'quantityAvailable', header: 'Stock', enableSorting: true,
      cell: ({ row: { original: i } }) => (
        <div>
          <p className={`font-bold tabular-nums ${i.quantityAvailable <= i.lowStockThreshold ? 'text-amber-600' : 'text-slate-900'}`}>
            {i.quantityAvailable.toLocaleString()}
          </p>
          {i.quantityAvailable <= i.lowStockThreshold && (
            <p className="text-[10px] font-semibold text-amber-500">⚠ Low stock</p>
          )}
        </div>
      ),
    },
    { accessorKey: 'quantityDistributed', header: 'Distributed',
      cell: ({ getValue }) => <span className="tabular-nums text-slate-600">{(getValue() as number ?? 0).toLocaleString()}</span> },
    { accessorKey: 'unitPrice', header: 'Unit Price', enableSorting: true,
      cell: ({ getValue }) => <span className="font-semibold text-slate-900">{fmt(getValue() as number)}</span> },
    { accessorKey: 'expirationDate', header: 'Expires',
      cell: ({ getValue }) => {
        const d = getValue() as string | null;
        if (!d) return <span className="text-slate-400">—</span>;
        const isExpiring = new Date(d) < new Date(Date.now() + 30 * 86400000);
        return <span className={isExpiring ? 'font-semibold text-amber-600' : 'text-slate-500'}>{fmtDate(d)}</span>;
      }
    },
    {
      id: 'actions', header: '', size: 100,
      cell: ({ row: { original: item } }) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm"
                onClick={() => { setSelected(item); setDistOpen(true); }}>
                <ArrowDown className="h-3.5 w-3.5 text-green-600" />
              </Button>
            </TooltipTrigger><TooltipContent>Distribute</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}>
                <Edit2 className="h-3.5 w-3.5 text-blue-500" />
              </Button>
            </TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </Button>
            </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ], [suppliers]);

  return (
    <TooltipProvider>
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Agricultural Inputs" description="Manage inventory of seeds, fertilizers and pesticides" icon={Package}>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Input
        </Button>
      </PageHeader>

      {/* Low stock alert */}
      {stats.lowStock > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-amber-800">Low Stock Alert</p>
            <p className="text-sm text-amber-700">
              {stats.lowStock} item{stats.lowStock > 1 ? 's' : ''} below minimum stock level.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Items"    value={stats.total}    icon={Boxes}   iconBg="bg-slate-100"  iconColor="text-slate-600" />
        <StatCard title="Low Stock"      value={stats.lowStock} icon={AlertTriangle} iconBg="bg-amber-100" iconColor="text-amber-600" />
        <StatCard title="Seeds Stock"    value={`${stats.seeds.toLocaleString()} u`}  icon={Package} iconBg="bg-green-100"  iconColor="text-green-600" />
        <StatCard title="Fertiliz. Stock" value={`${stats.fertil.toLocaleString()} u`} icon={Package} iconBg="bg-blue-100"   iconColor="text-blue-600" />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {['', 'SEEDS', 'FERTILIZERS', 'PESTICIDES'].map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              catFilter === c ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}>
            {c || 'All Categories'}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={inputs} loading={loading}
        emptyMessage="No inputs found. Add your first item." pageSize={12} />

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(EMPTY_FORM); } }}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Input' : 'Add New Input'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <DialogBody className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label="Input Name" required value={form.inputName}
                  onChange={e => f('inputName', e.target.value)} placeholder="e.g. NPK Fertilizer 50kg" />
              </div>
              <Select label="Category" required value={form.category} onChange={e => f('category', e.target.value)}>
                <option value="SEEDS">Seeds</option>
                <option value="FERTILIZERS">Fertilizers</option>
                <option value="PESTICIDES">Pesticides</option>
              </Select>
              <Select label="Supplier" value={form.supplierId} onChange={e => f('supplierId', e.target.value)}>
                <option value="">No supplier</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
              <Input label="Quantity Available" required type="number" value={form.quantityAvailable}
                onChange={e => f('quantityAvailable', e.target.value)} placeholder="e.g. 1000" />
              <Input label="Unit Price (RWF)" required type="number" value={form.unitPrice}
                onChange={e => f('unitPrice', e.target.value)} placeholder="e.g. 15000" />
              <Input label="Low Stock Threshold" type="number" value={form.lowStockThreshold}
                onChange={e => f('lowStockThreshold', e.target.value)} placeholder="50" />
              <Input label="Expiration Date" type="date" value={form.expirationDate}
                onChange={e => f('expirationDate', e.target.value)} />
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add Input'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Distribute dialog */}
      <Dialog open={distOpen} onOpenChange={v => { setDistOpen(v); if (!v) setDistQty(''); }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Distribute — {selected?.inputName}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Available</span>
                <span className="font-bold text-slate-900">{selected?.quantityAvailable.toLocaleString()} units</span>
              </div>
              <div className="mt-1 flex justify-between"><span className="text-slate-500">Unit price</span>
                <span className="font-semibold">{fmt(selected?.unitPrice ?? 0)}</span>
              </div>
            </div>
            <Input label="Quantity to distribute" required type="number" value={distQty}
              onChange={e => setDistQty(e.target.value)} placeholder="Enter quantity…"
              error={distQty && parseInt(distQty) > (selected?.quantityAvailable ?? 0)
                ? `Exceeds available stock (${selected?.quantityAvailable})` : undefined} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDistOpen(false)}>Cancel</Button>
            <Button
              loading={saving}
              disabled={!distQty || parseInt(distQty) <= 0 || parseInt(distQty) > (selected?.quantityAvailable ?? 0)}
              onClick={handleDistribute}>
              Distribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
