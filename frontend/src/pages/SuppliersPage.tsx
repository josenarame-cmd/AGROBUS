import { useState, useEffect, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Building2, Plus, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { supplierAPI } from '../services/api';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle } from '../components/ui/dialog';
import { PageHeader } from '../components/ui/page-header';
import { StatCard } from '../components/ui/stat-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { fmtDate } from '../lib/utils';

interface Supplier {
  id: number; name: string; contactPerson?: string; phone?: string;
  email?: string; address?: string; status: 'ACTIVE' | 'INACTIVE'; createdAt?: string;
}

const EMPTY_FORM = { name: '', contactPerson: '', phone: '', email: '', address: '', status: 'ACTIVE' };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [editing, setEditing]     = useState<Supplier | null>(null);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try { const r = await supplierAPI.getAll(); setSuppliers(r.data); }
    catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to load suppliers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total:    suppliers.length,
    active:   suppliers.filter(s => s.status === 'ACTIVE').length,
    inactive: suppliers.filter(s => s.status === 'INACTIVE').length,
  }), [suppliers]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        status: form.status,
      };
      if (editing) { await supplierAPI.update(editing.id, payload); toast.success('Supplier updated'); }
      else         { await supplierAPI.create(payload);             toast.success('Supplier created'); }
      setOpen(false); setEditing(null); setForm(EMPTY_FORM); load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to save supplier'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this supplier? This may affect linked inputs.')) return;
    try { await supplierAPI.delete(id); toast.success('Supplier deleted'); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to delete'); }
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name, contactPerson: s.contactPerson ?? '', phone: s.phone ?? '',
      email: s.email ?? '', address: s.address ?? '', status: s.status,
    });
    setOpen(true);
  };

  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const columns = useMemo<ColumnDef<Supplier>[]>(() => [
    {
      accessorKey: 'name', header: 'Supplier',
      cell: ({ row: { original: s } }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-sm font-bold text-white shadow-sm">
            {s.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{s.name}</p>
            {s.contactPerson && <p className="text-xs text-slate-400">{s.contactPerson}</p>}
          </div>
        </div>
      ),
    },
    { accessorKey: 'phone', header: 'Phone',
      cell: ({ getValue }) => getValue()
        ? <span className="flex items-center gap-1.5 text-sm text-slate-600"><Phone className="h-3.5 w-3.5 text-slate-400" />{getValue() as string}</span>
        : <span className="text-slate-400">—</span>
    },
    { accessorKey: 'email', header: 'Email',
      cell: ({ getValue }) => getValue()
        ? <span className="flex items-center gap-1.5 text-sm text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400" />{getValue() as string}</span>
        : <span className="text-slate-400">—</span>
    },
    { accessorKey: 'address', header: 'Address',
      cell: ({ getValue }) => getValue()
        ? <span className="flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-3.5 w-3.5 text-slate-400" />{getValue() as string}</span>
        : <span className="text-slate-400">—</span>
    },
    { accessorKey: 'status', header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <Badge variant={s === 'ACTIVE' ? 'green' : 'red'}>{s}</Badge>;
      }
    },
    { accessorKey: 'createdAt', header: 'Registered',
      cell: ({ getValue }) => <span className="text-xs text-slate-400">{fmtDate(getValue() as string)}</span> },
    {
      id: 'actions', header: '', size: 80,
      cell: ({ row }) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => openEdit(row.original)}>
                <Edit2 className="h-3.5 w-3.5 text-blue-500" />
              </Button>
            </TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(row.original.id)}>
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </Button>
            </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ], []);

  return (
    <TooltipProvider>
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Supplier Management" description="Manage agricultural input suppliers" icon={Building2}>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Supplier
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Suppliers" value={stats.total}    icon={Building2} iconBg="bg-blue-100"  iconColor="text-blue-600" />
        <StatCard title="Active"          value={stats.active}   icon={Building2} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard title="Inactive"        value={stats.inactive} icon={Building2} iconBg="bg-slate-100" iconColor="text-slate-500" />
      </div>

      <DataTable columns={columns} data={suppliers} loading={loading}
        emptyMessage="No suppliers yet. Add your first supplier." pageSize={12} />

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(EMPTY_FORM); } }}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <DialogBody className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input label="Company / Supplier Name" required value={form.name}
                  onChange={e => f('name', e.target.value)} placeholder="e.g. AgriSupply Rwanda Ltd" />
              </div>
              <Input label="Contact Person" value={form.contactPerson}
                onChange={e => f('contactPerson', e.target.value)} placeholder="Full name" />
              <Input label="Phone" value={form.phone}
                onChange={e => f('phone', e.target.value)} placeholder="+250 7XX XXX XXX" />
              <Input label="Email" type="email" value={form.email}
                onChange={e => f('email', e.target.value)} placeholder="supplier@example.com" />
              <Select label="Status" value={form.status} onChange={e => f('status', e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
              <div className="sm:col-span-2">
                <Input label="Address" value={form.address}
                  onChange={e => f('address', e.target.value)} placeholder="e.g. KG 15 Ave, Kigali" />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add Supplier'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
