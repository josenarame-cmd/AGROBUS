import { useState, useEffect } from 'react';
import { loanAPI, farmerAPI } from '../services/api';
import { Plus, CheckCircle, XCircle, Truck, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors: any = {
  PENDING: 'bg-amber-100 text-amber-700', APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700', DELIVERED: 'bg-purple-100 text-purple-700',
  REPAID: 'bg-green-100 text-green-700',
};

export default function LoansPage() {
  const [loans, setLoans] = useState<any>({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [form, setForm] = useState({ farmer: { id: '' }, cropType: '', requestedInputs: '', quantity: '', estimatedCost: '', farmSize: '', season: '' });

  useEffect(() => { fetchLoans(); }, [page, statusFilter]);
  useEffect(() => { farmerAPI.getAll().then(r => setFarmers(r.data)).catch(() => {}); }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = statusFilter ? await loanAPI.getByStatus(statusFilter, { page, size: 10 }) : await loanAPI.getAll({ page, size: 10 });
      setLoans(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to load loans');
      setLoans({ content: [], totalPages: 0 });
    }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loanAPI.create({
        farmerId: parseInt(form.farmer.id as string),
        cropType: form.cropType,
        requestedInputs: form.requestedInputs,
        quantity: form.quantity ? parseFloat(form.quantity) : undefined,
        estimatedCost: parseFloat(form.estimatedCost),
        farmSize: form.farmSize ? parseFloat(form.farmSize) : undefined,
        season: form.season || undefined,
      });
      toast.success('Loan request submitted');
      setShowModal(false);
      fetchLoans();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to submit loan'); }
  };

  const handleApprove = async (id: number) => {
    try { await loanAPI.approve(id); toast.success('Loan approved'); fetchLoans(); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? 'Failed to approve loan'); }
  };
  const handleReject = async () => {
    if (!selected) return;
    try { await loanAPI.reject(selected.id, rejectReason); toast.success('Loan rejected'); setShowReject(false); fetchLoans(); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? 'Failed to reject loan'); }
  };
  const handleDeliver = async (id: number) => {
    try { await loanAPI.deliver(id); toast.success('Inputs marked as delivered'); fetchLoans(); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? 'Failed to mark as delivered'); }
  };
  const fmt = (n: number) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Loan Requests</h1><p className="text-sm text-gray-500 mt-1">Manage agricultural input credit applications</p></div>
        <button onClick={() => setShowModal(true)} className="gradient-green text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-green-500/25"><Plus className="w-4 h-4" /> New Request</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'PENDING', 'APPROVED', 'DELIVERED', 'REPAID', 'REJECTED'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === s ? 'gradient-green text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['ID', 'Farmer', 'Crop', 'Inputs', 'Amount', 'Season', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              : loans.content?.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">No loans found</td></tr>
              : loans.content?.map((l: any) => (
                <tr key={l.id} className="border-b border-gray-50 table-row-hover">
                  <td className="px-5 py-3.5 text-sm font-mono font-medium">#{l.id}</td>
                  <td className="px-5 py-3.5"><p className="text-sm font-medium">{l.farmer?.fullName || 'N/A'}</p></td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{l.cropType}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{l.requestedInputs}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold">{fmt(l.estimatedCost)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{l.season}</td>
                  <td className="px-5 py-3.5"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[l.status]}`}>{l.status}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelected(l); setShowDetail(true); }} className="p-2 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-500" /></button>
                      {l.status === 'PENDING' && <>
                        <button onClick={() => handleApprove(l.id)} className="p-2 hover:bg-green-50 rounded-lg"><CheckCircle className="w-4 h-4 text-green-500" /></button>
                        <button onClick={() => { setSelected(l); setShowReject(true); }} className="p-2 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4 text-red-500" /></button>
                      </>}
                      {l.status === 'APPROVED' && <button onClick={() => handleDeliver(l.id)} className="p-2 hover:bg-purple-50 rounded-lg"><Truck className="w-4 h-4 text-purple-500" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-bold">New Loan Request</h2><button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Farmer *</label><select required value={form.farmer.id} onChange={e => setForm({...form, farmer: { id: e.target.value }})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50"><option value="">Select</option>{farmers.map((f: any) => <option key={f.id} value={f.id}>{f.fullName}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Crop *</label><input required value={form.cropType} onChange={e => setForm({...form, cropType: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
                <div><label className="block text-sm font-medium mb-1">Season</label><select value={form.season} onChange={e => setForm({...form, season: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50"><option value="">Select</option><option>Season A</option><option>Season B</option><option>Season C</option></select></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Inputs *</label><input required value={form.requestedInputs} onChange={e => setForm({...form, requestedInputs: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" placeholder="Seeds, Fertilizer" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Qty</label><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
                <div><label className="block text-sm font-medium mb-1">Cost *</label><input required type="number" value={form.estimatedCost} onChange={e => setForm({...form, estimatedCost: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
                <div><label className="block text-sm font-medium mb-1">Farm(ha)</label><input type="number" step="0.1" value={form.farmSize} onChange={e => setForm({...form, farmSize: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="gradient-green text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-green-500/25">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-fade-in p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">Loan #{selected.id}</h2><button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Farmer:</span><p className="font-medium">{selected.farmer?.fullName}</p></div>
              <div><span className="text-gray-500">Status:</span><p><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[selected.status]}`}>{selected.status}</span></p></div>
              <div><span className="text-gray-500">Amount:</span><p className="font-medium">{fmt(selected.estimatedCost)}</p></div>
              <div><span className="text-gray-500">Repaid:</span><p className="font-medium">{fmt(selected.amountRepaid)}</p></div>
              <div><span className="text-gray-500">Balance:</span><p className="font-medium text-red-600">{fmt(selected.remainingBalance)}</p></div>
              <div><span className="text-gray-500">Season:</span><p className="font-medium">{selected.season}</p></div>
            </div>
            <div className="mt-4 bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Repayment</span><span className="font-medium">{selected.estimatedCost ? Math.round(((selected.amountRepaid||0) / selected.estimatedCost) * 100) : 0}%</span></div>
              <div className="w-full h-2 bg-gray-200 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{ width: `${selected.estimatedCost ? Math.min(100, ((selected.amountRepaid||0) / selected.estimatedCost) * 100) : 0}%` }} /></div>
            </div>
          </div>
        </div>
      )}

      {showReject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in p-6">
            <h2 className="text-lg font-bold mb-4">Reject Loan #{selected?.id}</h2>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 min-h-[100px]" placeholder="Reason..." />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowReject(false)} className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleReject} className="bg-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
