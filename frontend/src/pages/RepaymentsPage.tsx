import { useState, useEffect } from 'react';
import { repaymentAPI, loanAPI, farmerAPI } from '../services/api';
import { Plus, X, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RepaymentsPage() {
  const [repayments, setRepayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [loans, setLoans] = useState<any[]>([]);
  const [totalRepaid, setTotalRepaid] = useState(0);
  const [form, setForm] = useState({ loan: { id: '' }, amountPaid: '', paymentMethod: 'MOBILE_MONEY', transactionRef: '' });

  useEffect(() => { fetchRepayments(); fetchLoans(); }, []);

  const fetchRepayments = async () => {
    setLoading(true);
    try {
      const [repRes, totalRes] = await Promise.all([repaymentAPI.getAll(), repaymentAPI.getTotal()]);
      setRepayments(repRes.data);
      setTotalRepaid(totalRes.data || 0);
    } catch { setRepayments([]); }
    finally { setLoading(false); }
  };

  const fetchLoans = async () => {
    try {
      const res = await loanAPI.getAll({ page: 0, size: 100 });
      setLoans(res.data.content?.filter((l: any) => ['APPROVED', 'DELIVERED'].includes(l.status)) || []);
    } catch { setLoans([]); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await repaymentAPI.record({ loan: { id: parseInt(form.loan.id) }, amountPaid: parseFloat(form.amountPaid), paymentMethod: form.paymentMethod, transactionRef: form.transactionRef });
      toast.success('Payment recorded');
      setShowModal(false);
      setForm({ loan: { id: '' }, amountPaid: '', paymentMethod: 'MOBILE_MONEY', transactionRef: '' });
      fetchRepayments();
      fetchLoans();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n || 0);

  const stats = [
    { label: 'Total Repaid', value: fmt(totalRepaid), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Transactions', value: repayments.length.toString(), icon: CreditCard, color: 'bg-blue-500' },
    { label: 'Active Loans', value: loans.length.toString(), icon: TrendingUp, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Repayment Management</h1><p className="text-sm text-gray-500 mt-1">Track and record loan repayments</p></div>
        <button onClick={() => setShowModal(true)} className="gradient-green text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-green-500/25"><Plus className="w-4 h-4" /> Record Payment</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card rounded-2xl p-5">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}><s.icon className="w-5 h-5 text-white" /></div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['ID', 'Farmer', 'Loan #', 'Amount Paid', 'Remaining', 'Method', 'Reference', 'Date'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              : repayments.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">No repayments recorded</td></tr>
              : repayments.map(r => (
                <tr key={r.id} className="border-b border-gray-50 table-row-hover">
                  <td className="px-5 py-3.5 text-sm font-mono">#{r.id}</td>
                  <td className="px-5 py-3.5 text-sm font-medium">{r.farmer?.fullName || 'N/A'}</td>
                  <td className="px-5 py-3.5 text-sm font-mono">#{r.loan?.id}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-green-600">{fmt(r.amountPaid)}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-red-600">{fmt(r.remainingBalance)}</td>
                  <td className="px-5 py-3.5"><span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">{r.paymentMethod || 'N/A'}</span></td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">{r.transactionRef || '-'}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-xl font-bold">Record Payment</h2><button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Loan *</label>
                <select required value={form.loan.id} onChange={e => setForm({...form, loan: { id: e.target.value }})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50">
                  <option value="">Select loan</option>
                  {loans.map((l: any) => <option key={l.id} value={l.id}>#{l.id} - {l.farmer?.fullName} (Balance: {fmt(l.remainingBalance)})</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Amount (RWF) *</label><input required type="number" value={form.amountPaid} onChange={e => setForm({...form, amountPaid: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" /></div>
              <div><label className="block text-sm font-medium mb-1">Method</label>
                <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50">
                  <option value="MOBILE_MONEY">Mobile Money</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="CASH">Cash</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Transaction Ref</label><input value={form.transactionRef} onChange={e => setForm({...form, transactionRef: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50" placeholder="e.g. MM-12345" /></div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="gradient-green text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-green-500/25">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
