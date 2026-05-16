import { useState, useEffect } from 'react';
import { inputAPI } from '../services/api';
import { Plus, Edit2, Trash2, X, AlertTriangle, Package, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InputsPage() {
  const [inputs, setInputs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDistribute, setShowDistribute] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [distQty, setDistQty] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [form, setForm] = useState({ inputName: '', category: 'SEEDS', quantityAvailable: '', unitPrice: '', expirationDate: '', lowStockThreshold: '50', supplier: { id: '' } });

  useEffect(() => { fetchInputs(); }, [categoryFilter]);

  const fetchInputs = async () => {
    setLoading(true);
    try {
      const res = categoryFilter ? await inputAPI.getByCategory(categoryFilter) : await inputAPI.getAll();
      setInputs(res.data);
    } catch { setInputs([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, quantityAvailable: parseInt(form.quantityAvailable), unitPrice: parseFloat(form.unitPrice), lowStockThreshold: parseInt(form.lowStockThreshold) };
    try {
      if (editing) { await inputAPI.update(editing.id, payload); toast.success('Updated'); }
      else { await inputAPI.create(payload); toast.success('Added'); }
      setShowModal(false); resetForm(); fetchInputs();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this input?')) return;
    try { await inputAPI.delete(id); toast.success('Deleted'); fetchInputs(); } catch { toast.error('Failed'); }
  };

  const handleDistribute = async () => {
    if (!selected) return;
    try { await inputAPI.distribute(selected.id, parseInt(distQty)); toast.success('Distributed'); setShowDistribute(false); setDistQty(''); fetchInputs(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ inputName: item.inputName, category: item.category, quantityAvailable: item.quantityAvailable?.toString(), unitPrice: item.unitPrice?.toString(), expirationDate: item.expirationDate || '', lowStockThreshold: item.lowStockThreshold?.toString() || '50', supplier: { id: item.supplier?.id?.toString() || '' } });
    setShowModal(true);
  };

  const resetForm = () => { setEditing(null); setForm({ inputName: '', category: 'SEEDS', quantityAvailable: '', unitPrice: '', expirationDate: '', lowStockThreshold: '50', supplier: { id: '' } }); };

  const catColors: any = { SEEDS: 'bg-green-100 text-green-700', FERTILIZERS: 'bg-blue-100 text-blue-700', PESTICIDES: 'bg-orange-100 text-orange-700' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Agricultural Inputs</h1><p className="text-sm text-gray-500 mt-1">Manage inventory of seeds, fertilizers & pesticides</p></div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="gradient-green text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-green-500/25"><Plus className="w-4 h-4" /> Add Input</button>
      </div>

      {/* Low stock alerts */}
      {inputs.filter(i => i.quantityAvailable <= (i.lowStockThreshold || 50)).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div><p className="text-sm font-semibold text-amber-800">Low Stock Alert</p><p className="text-sm text-amber-700">{inputs.filter(i => i.quantityAvailable <= (i.lowStockThreshold || 50)).length} item(s) below minimum stock level</p></div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {['', 'SEEDS', 'FERTILIZERS', 'PESTICIDES'].map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${categoryFilter === c ? 'gradient-green text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{c || 'All'}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="col-span-3 text-center py-12 text-gray-400">Loading...</p>
        : inputs.length === 0 ? <p className="col-span-3 text-center py-12 text-gray-400">No inputs found</p>
        : inputs.map(item => (
          <div key={item.id} className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-all ${item.quantityAvailable <= (item.lowStockThreshold || 50) ? 'border-amber-300' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${catColors[item.category] || 'bg-gray-100'}`}><Package className="w-5 h-5" /></div>
                <div><h3 className="font-semibold text-gray-900">{item.inputName}</h3><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColors[item.category]}`}>{item.category}</span></div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-blue-50 rounded-lg"><Edit2 className="w-3.5 h-3.5 text-blue-500" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Available</span><span className={`font-semibold ${item.quantityAvailable <= (item.lowStockThreshold || 50) ? 'text-amber-600' : 'text-gray-900'}`}>{item.quantityAvailable} units</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Distributed</span><span className="font-medium text-gray-700">{item.quantityDistributed || 0} units</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Unit Price</span><span className="font-medium">{new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(item.unitPrice || 0)}</span></div>
              {item.expirationDate && <div className="flex justify-between"><span className="text-gray-500">Expires</span><span className="text-xs text-gray-600">{item.expirationDate}</span></div>}
            </div>
            <button onClick={() => { setSelected(item); setShowDistribute(true); }} className="w-full mt-4 py-2 rounded-xl border border-green-200 text-green-700 text-sm font-medium hover:bg-green-50 flex items-center justify-center gap-2"><ArrowDown className="w-4 h-4" /> Distribute</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-bold">{editing ? 'Edit' : 'Add'} Input</h2><button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Name *</label><input required value={form.inputName} onChange={e => setForm({...form, inputName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Category *</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50"><option>SEEDS</option><option>FERTILIZERS</option><option>PESTICIDES</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Quantity *</label><input required type="number" value={form.quantityAvailable} onChange={e => setForm({...form, quantityAvailable: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Unit Price *</label><input required type="number" value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
                <div><label className="block text-sm font-medium mb-1">Low Stock Threshold</label><input type="number" value={form.lowStockThreshold} onChange={e => setForm({...form, lowStockThreshold: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Expiration Date</label><input type="date" value={form.expirationDate} onChange={e => setForm({...form, expirationDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="gradient-green text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-green-500/25">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDistribute && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm animate-fade-in p-6">
            <h2 className="text-lg font-bold mb-4">Distribute {selected.inputName}</h2>
            <p className="text-sm text-gray-500 mb-3">Available: {selected.quantityAvailable} units</p>
            <input type="number" value={distQty} onChange={e => setDistQty(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 mb-4" placeholder="Quantity to distribute" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDistribute(false)} className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleDistribute} className="gradient-green text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-green-500/25">Distribute</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
