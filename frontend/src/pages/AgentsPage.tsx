import { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2, UserPlus, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { agentAPI, farmerAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle } from '../components/ui/dialog';
import { PageHeader } from '../components/ui/page-header';
import { StatCard } from '../components/ui/stat-card';
import { EmptyState } from '../components/ui/empty-state';

interface Agent {
  id: number; fullName: string; phone: string; assignedDistrict: string;
  status: string; assignedFarmers?: any[];
}

const EMPTY_FORM = { fullName: '', phone: '', assignedDistrict: '', status: 'ACTIVE' };

export default function AgentsPage() {
  const [agents, setAgents]       = useState<Agent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [assignOpen, setAssign]   = useState(false);
  const [editing, setEditing]     = useState<Agent | null>(null);
  const [selected, setSelected]   = useState<Agent | null>(null);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [farmerId, setFarmerId]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try { const r = await agentAPI.getAll(); setAgents(r.data); }
    catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed to load agents'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await agentAPI.update(editing.id, form); toast.success('Agent updated'); }
      else         { await agentAPI.create(form);             toast.success('Agent created'); }
      setOpen(false); load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this agent?')) return;
    try { await agentAPI.delete(id); toast.success('Agent deleted'); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message ?? 'Failed'); }
  };

  const openAssign = async (agent: Agent) => {
    setSelected(agent);
    try { const r = await farmerAPI.getUnassigned(); setUnassigned(r.data); }
    catch { setUnassigned([]); }
    setFarmerId('');
    setAssign(true);
  };

  const handleAssign = async () => {
    if (!selected || !farmerId) return; setSaving(true);
    try { await agentAPI.assignFarmer(selected.id, parseInt(farmerId)); toast.success('Farmer assigned'); setAssign(false); load(); }
    catch (e: any) { toast.error(e?.response?.data?.message ?? 'Assignment failed'); }
    finally { setSaving(false); }
  };

  const openEdit = (a: Agent) => {
    setEditing(a);
    setForm({ fullName: a.fullName, phone: a.phone, assignedDistrict: a.assignedDistrict, status: a.status });
    setOpen(true);
  };

  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const active   = agents.filter(a => a.status === 'ACTIVE').length;
  const assigned = agents.reduce((s, a) => s + (a.assignedFarmers?.length ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Agent Management" description="Manage field agents and farmer assignments" icon={UserCheck}>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Agent
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard title="Total Agents"     value={agents.length} icon={UserCheck} iconBg="bg-blue-100"   iconColor="text-blue-600" />
        <StatCard title="Active"           value={active}        icon={UserCheck} iconBg="bg-green-100"  iconColor="text-green-600" />
        <StatCard title="Farmers Covered"  value={assigned}      icon={Users}     iconBg="bg-purple-100" iconColor="text-purple-600" />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-4 shadow-sm">
          <EmptyState icon={UserCheck} title="No agents yet" description="Add your first field agent to start managing farmer assignments." action={{ label: 'Add Agent', onClick: () => setOpen(true) }} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map(a => (
            <div key={a.id} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-lg font-bold text-white shadow-sm">
                    {a.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{a.fullName}</h3>
                    <p className="text-xs text-slate-400">{a.phone}</p>
                  </div>
                </div>
                <Badge variant={a.status === 'ACTIVE' ? 'green' : 'red'}>{a.status}</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" /> {a.assignedDistrict}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>{a.assignedFarmers?.length ?? 0} farmers assigned</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => openAssign(a)}>
                  <UserPlus className="h-3.5 w-3.5" /> Assign
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
                  <Edit2 className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>{editing ? 'Edit Agent' : 'Add New Agent'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave}>
            <DialogBody className="grid gap-4">
              <Input label="Full Name" required value={form.fullName} onChange={e => f('fullName', e.target.value)} />
              <Input label="Phone" required value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+250 7XX XXX XXX" />
              <Input label="Assigned District" required value={form.assignedDistrict} onChange={e => f('assignedDistrict', e.target.value)} />
              <Select label="Status" value={form.status} onChange={e => f('status', e.target.value)}>
                <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
              </Select>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign farmer */}
      <Dialog open={assignOpen} onOpenChange={setAssign}>
        <DialogContent size="sm">
          <DialogHeader><DialogTitle>Assign Farmer to {selected?.fullName}</DialogTitle></DialogHeader>
          <DialogBody>
            <Select label="Unassigned Farmer" value={farmerId} onChange={e => setFarmerId(e.target.value)}>
              <option value="">Select a farmer…</option>
              {unassigned.map((fa: any) => (
                <option key={fa.id} value={fa.id}>{fa.fullName} — {fa.district}</option>
              ))}
            </Select>
            {unassigned.length === 0 && (
              <p className="mt-3 text-sm text-slate-400">All farmers are already assigned.</p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssign(false)}>Cancel</Button>
            <Button loading={saving} disabled={!farmerId} onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
