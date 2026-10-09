import { useEffect, useState } from 'react';
import { ClipboardList, Plus, Trash2, Sprout, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { farmerSelfAPI, farmActivityAPI } from '../services/api';
import { FarmerPageHeader, FarmerSectionHeader } from '../components/farmer/FarmerUi';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PLANNED: 'bg-slate-100 text-slate-700',
    PLANTED: 'bg-blue-100 text-blue-700',
    GROWING: 'bg-green-100 text-green-700',
    HARVESTED: 'bg-amber-100 text-amber-700',
    SOLD: 'bg-purple-100 text-purple-700',
    FAILED: 'bg-red-100 text-red-700',
  };
  return <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${colors[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>;
}

type Crop = { id: number; cropType: string; status: string; expectedPlantingDate: string; farmName: string; };
type FarmActivity = { id: number; activityType: string; activityDate: string; description: string; cost: number; quantityUsed: number; unit: string; createdAt: string; };

const initialForm = { activityType: 'SOIL_PREP', activityDate: new Date().toISOString().split('T')[0], description: '', cost: '', quantityUsed: '', unit: '' };

export default function FarmerActivitiesPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<number | null>(null);
  const [activities, setActivities] = useState<FarmActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    farmerSelfAPI.getCrops().then(({ data }) => {
      const list = Array.isArray(data) ? data : [];
      setCrops(list);
      if (list.length) {
        setSelectedCrop(list[0].id);
        fetchActivities(list[0].id);
      }
    }).catch(() => toast.error('Could not load crops.'))
      .finally(() => setLoading(false));
  }, []);

  const fetchActivities = (cropId: number) => {
    farmActivityAPI.getForCrop(cropId).then(({ data }) => {
      setActivities(Array.isArray(data) ? data : []);
    }).catch(() => toast.error('Could not load activities for this crop.'));
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : null;
    setSelectedCrop(val);
    if (val) fetchActivities(val);
    else setActivities([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop) return toast.error('Select a crop first');
    setSubmitting(true);
    try {
      await farmActivityAPI.create({
        cropId: selectedCrop,
        activityType: form.activityType,
        activityDate: form.activityDate,
        description: form.description,
        cost: form.cost ? Number(form.cost) : undefined,
        quantityUsed: form.quantityUsed ? Number(form.quantityUsed) : undefined,
        unit: form.unit
      });
      toast.success('Activity logged successfully');
      setShowModal(false);
      setForm(initialForm);
      fetchActivities(selectedCrop);
    } catch (e) {
      toast.error('Could not save activity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await farmActivityAPI.delete(id);
      toast.success('Activity removed');
      if (selectedCrop) fetchActivities(selectedCrop);
    } catch (e) {
      toast.error('Failed to delete activity.');
    }
  };

  const currentCropInfo = crops.find(c => c.id === selectedCrop);

  return (
    <section className="farmer-content animate-fade-in space-y-6 pb-12">
      <FarmerPageHeader
        eyebrow="My Farm"
        title="Farm Activities"
        description="Track actions across your crop cycle from planting to harvest."
        icon={ClipboardList}
      />

      <div className="farmer-surface p-6 flex flex-wrap items-center gap-4">
        <label className="profile-field flex-1 max-w-sm">
          <span>Target Crop Cycle</span>
          <select value={selectedCrop || ''} onChange={handleCropChange} className="mt-1">
            <option value="">{loading ? 'Loading...' : 'Select a crop'}</option>
            {crops.map(c => (
              <option key={c.id} value={c.id}>{c.cropType} ({c.farmName}) - {c.status}</option>
            ))}
          </select>
        </label>
        {selectedCrop && (
          <button onClick={() => setShowModal(true)} className="farmer-primary-action h-10 px-4 mt-[22px]">
            <Plus className="h-4 w-4" /> Log Activity
          </button>
        )}
      </div>

      {currentCropInfo && (
        <div className="farmer-surface p-6 shadow-sm border-t-4 border-green-500">
           <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Sprout className="h-5 w-5 text-green-600"/>{currentCropInfo.cropType} Lifecycle</h3>
               <p className="text-sm text-slate-500 mt-1">Farm: {currentCropInfo.farmName}</p>
             </div>
             <StatusBadge status={currentCropInfo.status} />
           </div>

           <h4 className="font-semibold text-slate-700 mt-6 mb-3 uppercase tracking-wider text-xs">Activity History</h4>
           {activities.length === 0 ? (
             <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
               No activities logged for this crop yet. Click 'Log Activity' to start tracking.
             </div>
           ) : (
             <div className="space-y-3">
               {activities.map(act => (
                 <div key={act.id} className="p-4 rounded-xl border border-slate-100 flex justify-between items-center bg-white shadow-sm hover:shadow transition">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">{act.activityType.replace('_', ' ')}</span>
                       <span className="text-xs text-slate-400 font-semibold">{act.activityDate}</span>
                     </div>
                     <p className="text-sm font-medium text-slate-700">{act.description || 'No description provided'}</p>

                     {(act.quantityUsed || act.cost) && (
                       <div className="mt-2 flex gap-3 text-xs text-slate-500 font-semibold bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                         {act.quantityUsed && <span>Used: {act.quantityUsed} {act.unit}</span>}
                         {act.cost && <span className="text-emerald-600">Cost: RWF {act.cost}</span>}
                       </div>
                     )}
                   </div>
                   <button onClick={() => handleDelete(act.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                     <Trash2 className="h-4 w-4" />
                   </button>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Log Farm Activity</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="profile-field">
                <span>Activity Type</span>
                <select value={form.activityType} onChange={e => setForm({...form, activityType: e.target.value})} required>
                  <option value="SOIL_PREP">Soil Preparation</option>
                  <option value="PLANTING">Planting</option>
                  <option value="WEEDING">Weeding</option>
                  <option value="FERTILIZER">Fertilizer Application</option>
                  <option value="PEST_OBSERVATION">Pest Observation</option>
                  <option value="DISEASE_OBSERVATION">Disease Observation</option>
                  <option value="HARVESTING">Harvesting</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>

              <label className="profile-field">
                <span>Date</span>
                <input type="date" value={form.activityDate} onChange={e => setForm({...form, activityDate: e.target.value})} required />
              </label>

              <label className="profile-field">
                <span>Description</span>
                <input type="text" placeholder="Detail the activity..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="profile-field">
                  <span>Quantity Used (Optional)</span>
                  <input type="number" step="0.01" placeholder="e.g. 50" value={form.quantityUsed} onChange={e => setForm({...form, quantityUsed: e.target.value})} />
                </label>
                <label className="profile-field">
                  <span>Unit (Optional)</span>
                  <input type="text" placeholder="e.g. kg, liters" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
                </label>
              </div>

              <label className="profile-field">
                <span>Cost RWF (Optional)</span>
                <input type="number" placeholder="0.00" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
              </label>

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition flex justify-center items-center gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <ClipboardList className="h-4 w-4"/>}
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
