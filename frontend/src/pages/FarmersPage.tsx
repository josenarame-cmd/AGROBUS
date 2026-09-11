import { useState, useEffect, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { UserPlus, Search, Edit2, Trash2, MapPin, TrendingUp, Users, UserCheck, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import { farmerAPI } from '../services/api';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { PageHeader } from '../components/ui/page-header';
import { StatCard } from '../components/ui/stat-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

interface Farmer {
  id: number; fullName: string; nationalId: string; phone: string;
  gender: string; district: string; sector?: string; farmSize?: number;
  cropType?: string; creditScore?: number; status: string;
  registrationDate?: string; agent?: { fullName: string }; userId?: number;
}

const EMPTY_FORM = {
  fullName: '', nationalId: '', phone: '', gender: 'MALE',
  district: '', sector: '', farmSize: '', cropType: '', status: 'ACTIVE',
};

function CreditBar({ score = 500 }: { score?: number }) {
  const pct = Math.min(100, ((score - 300) / 550) * 100);
  const color = score >= 700 ? 'bg-green-500' : score >= 500 ? 'bg-amber-400' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-slate-600">{score}</span>
    </div>
  );
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState(false);
  const [editing, setEditing]   = useState<Farmer | null>(null);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const [districtFilter, setDist] = useState('');
  const [cropFilter, setCrop]   = useState('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  // link-user dialog
  const [linkOpen, setLinkOpen]   = useState(false);
  const [linkFarmer, setLinkFarmer] = useState<Farmer | null>(null);
  const [linkUserId, setLinkUserId] = useState('');
  const [linking, setLinking]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await farmerAPI.getAll();
      setFarmers(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to load farmers'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    farmerAPI.getDistricts().then(r => setDistricts(r.data)).catch(() => {});
    farmerAPI.getCropTypes().then(r => setCropTypes(r.data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let d = farmers;
    if (search)        d = d.filter(f => `${f.fullName} ${f.nationalId} ${f.phone}`.toLowerCase().includes(search.toLowerCase()));
    if (districtFilter) d = d.filter(f => f.district === districtFilter);
    if (cropFilter)     d = d.filter(f => f.cropType === cropFilter);
    return d;
  }, [farmers, search, districtFilter, cropFilter]);

  const stats = useMemo(() => ({
    total:    farmers.length,
    active:   farmers.filter(f => f.status === 'ACTIVE').length,
    assigned: farmers.filter(f => f.agent).length,
    avgScore: farmers.length ? Math.round(farmers.reduce((s, f) => s + (f.creditScore ?? 500), 0) / farmers.length) : 0,
  }), [farmers]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit   = (f: Farmer) => {
    setEditing(f);
    setForm({ fullName: f.fullName, nationalId: f.nationalId, phone: f.phone, gender: f.gender,
      district: f.district, sector: f.sector ?? '', farmSize: f.farmSize?.toString() ?? '',
      cropType: f.cropType ?? '', status: f.status });
    setOpen(true);
  };
  const openLink = (fa: Farmer) => { setLinkFarmer(fa); setLinkUserId(fa.userId?.toString() ?? ''); setLinkOpen(true); };

  const handleLink = async () => {
    if (!linkFarmer || !linkUserId) return;
    setLinking(true);
    try {
      await farmerAPI.linkUser(linkFarmer.id, parseInt(linkUserId));
      toast.success(`User #${linkUserId} linked to ${linkFarmer.fullName}`);
      setLinkOpen(false); setLinkUserId(''); load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to link user'); }
    finally { setLinking(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, farmSize: parseFloat(form.farmSize) || 0 };
      if (editing) { await farmerAPI.update(editing.id, payload); toast.success('Farmer updated'); }
      else         { await farmerAPI.create(payload);             toast.success('Farmer registered'); }
      setOpen(false); load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this farmer? This cannot be undone.')) return;
    try { await farmerAPI.delete(id); toast.success('Farmer deleted'); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed'); }
  };

  const columns = useMemo<ColumnDef<Farmer>[]>(() => [
    {
      accessorKey: 'fullName',
      header: 'Farmer',
      cell: ({ row: { original: f } }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-sm font-bold text-white shadow-sm">
            {f.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{f.fullName}</p>
            <p className="text-xs text-slate-400">{f.gender}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'nationalId', header: 'National ID',
      cell: ({ getValue }) => <span className="font-mono text-xs text-slate-600">{getValue() as string}</span> },
    { accessorKey: 'phone', header: 'Phone',
      cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue() as string}</span> },
    {
      accessorKey: 'district', header: 'Location',
      cell: ({ row: { original: f } }) => (
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <span>{f.district}{f.sector ? `, ${f.sector}` : ''}</span>
        </div>
      ),
    },
    { accessorKey: 'cropType', header: 'Crop',
      cell: ({ getValue }) => getValue() ? <Badge variant="green">{getValue() as string}</Badge> : <span className="text-slate-400">—</span> },
    { accessorKey: 'farmSize', header: 'Farm (ha)',
      cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue() ? `${getValue()} ha` : '—'}</span> },
    { accessorKey: 'creditScore', header: 'Credit', enableSorting: true,
      cell: ({ getValue }) => <CreditBar score={getValue() as number} /> },
    { accessorKey: 'status', header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue() as string;
        return <Badge variant={s === 'ACTIVE' ? 'green' : 'red'}>{s}</Badge>;
      }
    },
    {
      id: 'actions', header: '', size: 80,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(row.original)}>
                  <Edit2 className="h-3.5 w-3.5 text-blue-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit farmer</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={() => openLink(row.original)}>
                  <Link className="h-3.5 w-3.5 text-purple-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Link user account</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(row.original.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete farmer</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ], []);

  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <TooltipProvider>
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Farmer Management" description="Register and manage farmers across all districts" icon={Users}>
        <Button onClick={openCreate}><UserPlus className="h-4 w-4" /> Register Farmer</Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Farmers"  value={stats.total}    icon={Users}      iconBg="bg-blue-100"   iconColor="text-blue-600" />
        <StatCard title="Active"         value={stats.active}   icon={UserCheck}  iconBg="bg-green-100"  iconColor="text-green-600" />
        <StatCard title="Assigned"       value={stats.assigned} icon={UserPlus}   iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard title="Avg Credit"     value={stats.avgScore} icon={TrendingUp} iconBg="bg-amber-100"  iconColor="text-amber-600" />
      </div>

      {/* Filters toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, ID…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
        <select value={districtFilter} onChange={e => setDist(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-green-500 focus:outline-none min-w-[150px]">
          <option value="">All Districts</option>
          {districts.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={cropFilter} onChange={e => setCrop(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-green-500 focus:outline-none min-w-[150px]">
          <option value="">All Crops</option>
          {cropTypes.map(c => <option key={c}>{c}</option>)}
        </select>
        {(search || districtFilter || cropFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setDist(''); setCrop(''); }}>
            Clear filters
          </Button>
        )}
      </div>

      <DataTable columns={columns} data={filtered} loading={loading}
        emptyMessage="No farmers match your search." pageSize={12} />

      {/* Link user dialog */}
      <Dialog open={linkOpen} onOpenChange={v => { setLinkOpen(v); if (!v) setLinkUserId(''); }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Link User Account</DialogTitle>
            <DialogDescription>
              Enter the User ID to link to <strong>{linkFarmer?.fullName}</strong>.
              This allows that user to access farmer self-service endpoints.
              {linkFarmer?.userId && <span className="mt-1 block text-amber-600">Currently linked to User #{linkFarmer.userId}</span>}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Input label="User ID" type="number" required value={linkUserId}
              onChange={e => setLinkUserId(e.target.value)}
              placeholder="e.g. 3" />
            <p className="mt-2 text-xs text-slate-400">
              Tip: Find the user ID from the H2 console at{' '}
              <code className="rounded bg-slate-100 px-1">localhost:8080/h2-console</code> or from the users table.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkOpen(false)}>Cancel</Button>
            <Button loading={linking} disabled={!linkUserId} onClick={handleLink}>Link Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Farmer' : 'Register New Farmer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <DialogBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full Name" required value={form.fullName} onChange={e => f('fullName', e.target.value)} placeholder="e.g. Jean Paul Habimana" />
              <Input label="National ID" required value={form.nationalId} disabled={!!editing}
                onChange={e => f('nationalId', e.target.value)} placeholder="1 XXXX X XXXXXXX X XX" />
              <Input label="Phone" required value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+250 7XX XXX XXX" />
              <Select label="Gender" value={form.gender} onChange={e => f('gender', e.target.value)}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
              <Input label="District" required value={form.district} onChange={e => f('district', e.target.value)} placeholder="e.g. Gasabo" />
              <Input label="Sector" value={form.sector} onChange={e => f('sector', e.target.value)} placeholder="e.g. Kimironko" />
              <Input label="Farm Size (ha)" type="number" step="0.1" value={form.farmSize}
                onChange={e => f('farmSize', e.target.value)} placeholder="e.g. 2.5" />
              <Input label="Crop Type" value={form.cropType} onChange={e => f('cropType', e.target.value)} placeholder="e.g. Maize, Rice" />
              <Select label="Status" value={form.status} onChange={e => f('status', e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editing ? 'Update' : 'Register'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
