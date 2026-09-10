import { useState, useEffect } from 'react';
import { farmerAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, X, Filter, UserPlus, MapPin, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<any>({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [cropFilter, setCropFilter] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [form, setForm] = useState({
    fullName: '', nationalId: '', phone: '', gender: 'MALE',
    district: '', sector: '', farmSize: '', cropType: '', status: 'ACTIVE'
  });

  useEffect(() => { fetchFarmers(); }, [page, search, districtFilter, cropFilter]);
  useEffect(() => {
    farmerAPI.getDistricts().then(r => setDistricts(r.data)).catch(() => setDistricts(['Gasabo', 'Kicukiro', 'Nyarugenge', 'Musanze', 'Rubavu', 'Huye']));
    farmerAPI.getCropTypes().then(r => setCropTypes(r.data)).catch(() => setCropTypes(['Maize', 'Rice', 'Beans', 'Potatoes', 'Coffee', 'Tea']));
  }, []);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const res = await farmerAPI.search({ search: search || null, district: districtFilter || null, cropType: cropFilter || null, page, size: 10 });
      setFarmers(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to load farmers';
      toast.error(msg);
      setFarmers({ content: [], totalPages: 0, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, farmSize: parseFloat(form.farmSize) || 0 };
      if (editingFarmer) {
        await farmerAPI.update(editingFarmer.id, payload);
        toast.success('Farmer updated successfully');
      } else {
        await farmerAPI.create(payload);
        toast.success('Farmer registered successfully');
      }
      setShowModal(false);
      resetForm();
      fetchFarmers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this farmer?')) return;
    try {
      await farmerAPI.delete(id);
      toast.success('Farmer deleted');
      fetchFarmers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to delete farmer');
    }
  };

  const openEdit = (farmer: any) => {
    setEditingFarmer(farmer);
    setForm({
      fullName: farmer.fullName, nationalId: farmer.nationalId, phone: farmer.phone,
      gender: farmer.gender, district: farmer.district, sector: farmer.sector || '',
      farmSize: farmer.farmSize?.toString() || '', cropType: farmer.cropType || '', status: farmer.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingFarmer(null);
    setForm({ fullName: '', nationalId: '', phone: '', gender: 'MALE', district: '', sector: '', farmSize: '', cropType: '', status: 'ACTIVE' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage registered farmers across all districts</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="gradient-green text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2
            shadow-lg shadow-green-500/25 hover:shadow-xl transition-all"
        >
          <UserPlus className="w-4 h-4" /> Register Farmer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by name, phone, or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white"
            />
          </div>
          <select
            value={districtFilter}
            onChange={e => { setDistrictFilter(e.target.value); setPage(0); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white min-w-[160px]"
          >
            <option value="">All Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={cropFilter}
            onChange={e => { setCropFilter(e.target.value); setPage(0); }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white min-w-[160px]"
          >
            <option value="">All Crops</option>
            {cropTypes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Name', 'National ID', 'Phone', 'District', 'Farm Size', 'Crop', 'Credit Score', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">Loading farmers...</td></tr>
              ) : farmers.content?.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No farmers found</td></tr>
              ) : (
                farmers.content?.map((f: any) => (
                  <tr key={f.id} className="border-b border-gray-50 table-row-hover">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                          {f.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{f.fullName}</p>
                          <p className="text-xs text-gray-400">{f.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 font-mono">{f.nationalId}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{f.phone}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" /> {f.district}
                      </span>
                      <span className="text-xs text-gray-400">{f.sector}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{f.farmSize} ha</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">{f.cropType}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${f.creditScore >= 700 ? 'bg-green-500' : f.creditScore >= 500 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${(f.creditScore || 500) / 10}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{f.creditScore || 500}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        f.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{f.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(f)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(f.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {farmers.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {page * 10 + 1}-{Math.min((page + 1) * 10, farmers.totalElements)} of {farmers.totalElements}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium px-3">{page + 1} / {farmers.totalPages}</span>
              <button onClick={() => setPage(Math.min(farmers.totalPages - 1, page + 1))} disabled={page >= farmers.totalPages - 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFarmer ? 'Edit Farmer' : 'Register New Farmer'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">National ID *</label>
                  <input required value={form.nationalId} onChange={e => setForm({...form, nationalId: e.target.value})}
                    disabled={!!editingFarmer}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" placeholder="+250 7XX XXX XXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                  <input required value={form.district} onChange={e => setForm({...form, district: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <input value={form.sector} onChange={e => setForm({...form, sector: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (hectares)</label>
                  <input type="number" step="0.1" value={form.farmSize} onChange={e => setForm({...form, farmSize: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                  <input value={form.cropType} onChange={e => setForm({...form, cropType: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" placeholder="e.g. Maize, Rice" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="gradient-green text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-green-500/25">
                  {editingFarmer ? 'Update Farmer' : 'Register Farmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
