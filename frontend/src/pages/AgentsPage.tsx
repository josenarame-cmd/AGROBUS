import { useState, useEffect } from 'react';
import { agentAPI, farmerAPI } from '../services/api';
import { Plus, Edit2, Trash2, X, UserPlus, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [assignFarmerId, setAssignFarmerId] = useState('');
  const [form, setForm] = useState({ fullName: '', phone: '', assignedDistrict: '', status: 'ACTIVE' });

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try { const r = await agentAPI.getAll(); setAgents(r.data); } catch { setAgents([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await agentAPI.update(editing.id, form); toast.success('Updated'); }
      else { await agentAPI.create(form); toast.success('Created'); }
      setShowModal(false); resetForm(); fetchAgents();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete agent?')) return;
    try { await agentAPI.delete(id); toast.success('Deleted'); fetchAgents(); } catch { toast.error('Failed'); }
  };

  const openAssign = async (agent: any) => {
    setSelected(agent);
    try { const r = await farmerAPI.getUnassigned(); setUnassigned(r.data); } catch { setUnassigned([]); }
    setShowAssign(true);
  };

  const handleAssign = async () => {
    if (!selected || !assignFarmerId) return;
    try { await agentAPI.assignFarmer(selected.id, parseInt(assignFarmerId)); toast.success('Farmer assigned'); setShowAssign(false); setAssignFarmerId(''); fetchAgents(); }
    catch { toast.error('Failed'); }
  };

  const openEdit = (a: any) => { setEditing(a); setForm({ fullName: a.fullName, phone: a.phone, assignedDistrict: a.assignedDistrict, status: a.status }); setShowModal(true); };
  const resetForm = () => { setEditing(null); setForm({ fullName: '', phone: '', assignedDistrict: '', status: 'ACTIVE' }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Agent Management</h1><p className="text-sm text-gray-500 mt-1">Manage field agents and farmer assignments</p></div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="gradient-green text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-green-500/25"><Plus className="w-4 h-4" /> Add Agent</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="col-span-3 text-center py-12 text-gray-400">Loading...</p>
        : agents.length === 0 ? <p className="col-span-3 text-center py-12 text-gray-400">No agents found</p>
        : agents.map(a => (
          <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-emerald rounded-full flex items-center justify-center text-white font-bold text-lg">{a.fullName?.charAt(0)}</div>
                <div><h3 className="font-semibold text-gray-900">{a.fullName}</h3><p className="text-xs text-gray-500">{a.phone}</p></div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${a.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" />{a.assignedDistrict}</div>
              <div className="flex items-center gap-2 text-gray-600"><Users className="w-4 h-4" />{a.assignedFarmers?.length || 0} farmers assigned</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => openAssign(a)} className="flex-1 py-2 rounded-xl border border-green-200 text-green-700 text-sm font-medium hover:bg-green-50 flex items-center justify-center gap-1"><UserPlus className="w-4 h-4" /> Assign</button>
              <button onClick={() => openEdit(a)} className="p-2 hover:bg-blue-50 rounded-xl border border-gray-200"><Edit2 className="w-4 h-4 text-blue-500" /></button>
              <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-red-50 rounded-xl border border-gray-200"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-bold">{editing ? 'Edit' : 'Add'} Agent</h2><button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Full Name *</label><input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
              <div><label className="block text-sm font-medium mb-1">Phone *</label><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
              <div><label className="block text-sm font-medium mb-1">District *</label><input required value={form.assignedDistrict} onChange={e => setForm({...form, assignedDistrict: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
              <div><label className="block text-sm font-medium mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50"><option>ACTIVE</option><option>INACTIVE</option></select></div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="gradient-green text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-green-500/25">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in p-6">
            <h2 className="text-lg font-bold mb-4">Assign Farmer to {selected?.fullName}</h2>
            <select value={assignFarmerId} onChange={e => setAssignFarmerId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 mb-4">
              <option value="">Select unassigned farmer</option>
              {unassigned.map((f: any) => <option key={f.id} value={f.id}>{f.fullName} - {f.district}</option>)}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAssign(false)} className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleAssign} className="gradient-green text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-green-500/25">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
