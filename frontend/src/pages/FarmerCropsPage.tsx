import { useEffect, useState, useMemo } from 'react';
import {
  Loader2, Plus, Wheat, Calendar, MapPin, Activity,
  Save, X, Trash2, ChevronRight, Search, SlidersHorizontal,
  CheckCircle2, Clock, Sprout, Package, AlertTriangle, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { farmerSelfAPI } from '../services/api';
import {
  FarmerEmptyState, FarmerPageHeader,
  FarmerSectionHeader
} from '../components/farmer/FarmerUi';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Crop {
  id: number;
  farmId: number;
  farmName: string;
  cropType: string;
  variety: string;
  status: CropStatus;
  areaPlantedHectares: number | null;
  expectedPlantingDate: string | null;
  actualPlantingDate: string | null;
  expectedHarvestDate: string | null;
  actualHarvestDate: string | null;
  yieldKg: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

type CropStatus = 'PLANNED' | 'PLANTED' | 'GROWING' | 'HARVESTED' | 'SOLD' | 'FAILED';

interface Farm {
  id: number;
  name: string;
  sizeHectares?: number;
  district?: string;
}

// ─── Lifecycle config ─────────────────────────────────────────────────────────
const LIFECYCLE: { status: CropStatus; label: string; icon: typeof Wheat; colour: string; bg: string; border: string }[] = [
  { status: 'PLANNED',   label: 'Planned',   icon: Clock,         colour: 'text-slate-500',   bg: 'bg-slate-100',   border: 'border-slate-300' },
  { status: 'PLANTED',   label: 'Planted',   icon: Sprout,        colour: 'text-blue-600',    bg: 'bg-blue-50',     border: 'border-blue-300' },
  { status: 'GROWING',   label: 'Growing',   icon: TrendingUp,    colour: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-300' },
  { status: 'HARVESTED', label: 'Harvested', icon: Wheat,         colour: 'text-amber-600',   bg: 'bg-amber-50',    border: 'border-amber-300' },
  { status: 'SOLD',      label: 'Sold',      icon: CheckCircle2,  colour: 'text-green-700',   bg: 'bg-green-50',    border: 'border-green-400' },
  { status: 'FAILED',    label: 'Failed',    icon: AlertTriangle, colour: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-300' },
];

const LIFECYCLE_ORDER: CropStatus[] = ['PLANNED', 'PLANTED', 'GROWING', 'HARVESTED', 'SOLD', 'FAILED'];

function getStatusConfig(status: CropStatus) {
  return LIFECYCLE.find(l => l.status === status) ?? LIFECYCLE[0];
}

function getLifecycleProgress(status: CropStatus): number {
  const mainSteps: CropStatus[] = ['PLANNED', 'PLANTED', 'GROWING', 'HARVESTED', 'SOLD'];
  const idx = mainSteps.indexOf(status);
  if (idx === -1) return 0; // FAILED
  return Math.round((idx / (mainSteps.length - 1)) * 100);
}

// ─── Date formatting ──────────────────────────────────────────────────────────
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-RW', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Form state ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  farmId: '',
  cropType: '',
  variety: '',
  status: 'PLANNED' as CropStatus,
  areaPlantedHectares: '',
  expectedPlantingDate: '',
  actualPlantingDate: '',
  expectedHarvestDate: '',
  actualHarvestDate: '',
  yieldKg: '',
  notes: '',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FarmerCropsPage({ initialStatus = 'ALL' }: { initialStatus?: CropStatus | 'ALL' } = {}) {
  const [crops, setCrops]       = useState<Crop[]>([]);
  const [farms, setFarms]       = useState<Farm[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [form, setForm]               = useState(EMPTY_FORM);

  // Filter / search
  const [searchQuery, setSearchQuery]     = useState('');
  const [statusFilter, setStatusFilter]   = useState<CropStatus | 'ALL'>(initialStatus);
  const [farmFilter, setFarmFilter]       = useState<string>('ALL');

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadAll = async () => {
    setLoading(true);
    setError(false);
    try {
      const [cropsRes, farmsRes] = await Promise.all([
        farmerSelfAPI.getCrops(),
        farmerSelfAPI.getMyFarms(),
      ]);
      setCrops(Array.isArray(cropsRes.data) ? cropsRes.data : []);
      setFarms(Array.isArray(farmsRes.data) ? farmsRes.data : []);
    } catch {
      setError(true);
      toast.error('Failed to load crop records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     crops.length,
    growing:   crops.filter(c => c.status === 'GROWING').length,
    planned:   crops.filter(c => c.status === 'PLANNED' || c.status === 'PLANTED').length,
    harvested: crops.filter(c => c.status === 'HARVESTED' || c.status === 'SOLD').length,
    totalArea: crops.reduce((sum, c) => sum + (c.areaPlantedHectares ?? 0), 0),
  }), [crops]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      const matchSearch = !searchQuery ||
        crop.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (crop.variety ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.farmName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || crop.status === statusFilter;
      const matchFarm   = farmFilter   === 'ALL' || String(crop.farmId) === farmFilter;
      return matchSearch && matchStatus && matchFarm;
    });
  }, [crops, searchQuery, statusFilter, farmFilter]);

  // ── Drawer helpers ────────────────────────────────────────────────────────
  const openDrawer = (crop?: Crop) => {
    if (crop) {
      setEditingId(crop.id);
      setForm({
        farmId:                 String(crop.farmId),
        cropType:               crop.cropType,
        variety:                crop.variety ?? '',
        status:                 crop.status,
        areaPlantedHectares:    crop.areaPlantedHectares != null ? String(crop.areaPlantedHectares) : '',
        expectedPlantingDate:   crop.expectedPlantingDate ?? '',
        actualPlantingDate:     crop.actualPlantingDate ?? '',
        expectedHarvestDate:    crop.expectedHarvestDate ?? '',
        actualHarvestDate:      crop.actualHarvestDate ?? '',
        yieldKg:                crop.yieldKg != null ? String(crop.yieldKg) : '',
        notes:                  crop.notes ?? '',
      });
    } else {
      setEditingId(null);
      setForm({
        ...EMPTY_FORM,
        farmId: farms.length === 1 ? String(farms[0].id) : '',
      });
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); };

  const f = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      farmId:              parseInt(form.farmId),
      cropType:            form.cropType,
      variety:             form.variety || null,
      status:              form.status,
      areaPlantedHectares: form.areaPlantedHectares ? parseFloat(form.areaPlantedHectares) : null,
      expectedPlantingDate: form.expectedPlantingDate || null,
      actualPlantingDate:   form.actualPlantingDate   || null,
      expectedHarvestDate:  form.expectedHarvestDate  || null,
      actualHarvestDate:    form.actualHarvestDate    || null,
      yieldKg:             form.yieldKg ? parseFloat(form.yieldKg) : null,
      notes:               form.notes || null,
    };
    try {
      if (editingId) {
        await farmerSelfAPI.updateCrop(editingId, payload);
        toast.success('Crop record updated');
      } else {
        await farmerSelfAPI.createCrop(payload);
        toast.success('Crop record created');
      }
      closeDrawer();
      loadAll();
    } catch {
      toast.error('Failed to save crop record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this crop record? This cannot be undone.')) return;
    try {
      await farmerSelfAPI.deleteCrop(id);
      toast.success('Crop record deleted');
      closeDrawer();
      loadAll();
    } catch {
      toast.error('Failed to delete crop record');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="My Farm"
        title={initialStatus === 'PLANNED' ? 'Crop planning' : 'Crop Management'}
        description={initialStatus === 'PLANNED'
          ? 'Plan crop cycles on your farms and update their recorded lifecycle as field work progresses.'
          : 'Track every crop through its full lifecycle — from planning to harvest and sale.'}
        icon={Wheat}
      />

      {/* ── Summary Banner ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Crops',       value: loading ? '…' : String(stats.total),                 colour: 'text-slate-700',   icon: Wheat },
          { label: 'Currently Growing', value: loading ? '…' : String(stats.growing),               colour: 'text-emerald-600', icon: TrendingUp },
          { label: 'Planned / Planted', value: loading ? '…' : String(stats.planned),               colour: 'text-blue-600',    icon: Sprout },
          { label: 'Total Area (ha)',    value: loading ? '…' : stats.totalArea.toFixed(1),          colour: 'text-amber-600',   icon: MapPin },
        ].map(s => (
          <div key={s.label} className="farmer-surface flex items-center gap-3 p-4">
            <s.icon className={`h-6 w-6 shrink-0 ${s.colour}`} />
            <div>
              <p className="text-xs text-slate-500 font-medium leading-tight">{s.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${s.colour}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Crop Records Panel ── */}
      <div className="dashboard-band">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <FarmerSectionHeader title="Your Crop Records" description="Click a crop card to edit or update its status." />
          <button onClick={() => openDrawer()} className="farmer-primary-action shrink-0">
            <Plus className="h-4 w-4" /> Add Crop
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search crops, variety, farm…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-400 outline-none bg-white"
            />
          </div>
          {/* Status filter */}
          <div className="relative shrink-0">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as CropStatus | 'ALL')}
              className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-400 outline-none bg-white appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {LIFECYCLE.map(l => <option key={l.status} value={l.status}>{l.label}</option>)}
            </select>
          </div>
          {/* Farm filter */}
          {farms.length > 1 && (
            <div className="relative shrink-0">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={farmFilter}
                onChange={e => setFarmFilter(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-400 outline-none bg-white appearance-none cursor-pointer"
              >
                <option value="ALL">All Farms</option>
                {farms.map(fm => <option key={fm.id} value={String(fm.id)}>{fm.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-sm">Loading your crop records…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-10 gap-4 text-center">
            <AlertTriangle className="h-10 w-10 text-red-400" />
            <p className="text-slate-600 font-medium">Could not load crop records</p>
            <button onClick={loadAll} className="text-sm text-green-700 underline underline-offset-2">Retry</button>
          </div>
        ) : crops.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-4">
            <FarmerEmptyState
              icon={Wheat}
              title="No crops recorded yet"
              description="Add your first crop record to start tracking your planting, growing, and harvest cycle."
            />
            <button onClick={() => openDrawer()} className="farmer-primary-action">
              <Plus className="h-4 w-4" /> Add First Crop
            </button>
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3 text-center text-slate-500">
            <Search className="h-8 w-8 text-slate-300" />
            <p className="font-medium text-slate-600">No crops match your filters</p>
            <button onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setFarmFilter('ALL'); }} className="text-sm text-green-700 underline underline-offset-2">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCrops.map(crop => (
              <CropCard key={crop.id} crop={crop} onClick={() => openDrawer(crop)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Side Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in" onClick={closeDrawer}>
          <div
            className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-slide-in-right overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                  {editingId ? 'Edit Crop Record' : 'Add New Crop'}
                </p>
                <h2 className="text-lg font-bold text-slate-800 mt-0.5">
                  {editingId ? form.cropType || 'Edit Crop' : 'New Crop Record'}
                </h2>
              </div>
              <button type="button" onClick={closeDrawer} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              {/* Drawer body — scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Farm */}
                <label className="profile-field">
                  <span>Farm Plot *</span>
                  <select
                    required
                    value={form.farmId}
                    onChange={f('farmId')}
                    className="mt-1 block w-full rounded-lg border-slate-200 py-2.5 pl-3 pr-10 text-sm hover:bg-slate-50 focus:border-green-500 focus:outline-none focus:ring-green-500"
                  >
                    <option value="" disabled>Select a farm…</option>
                    {farms.map(fm => (
                      <option key={fm.id} value={fm.id}>
                        {fm.name}{fm.district ? ` — ${fm.district}` : ''}{fm.sizeHectares ? ` (${fm.sizeHectares} ha)` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Crop type + Variety */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="profile-field">
                    <span>Crop Type *</span>
                    <input required value={form.cropType} onChange={f('cropType')} placeholder="e.g. Maize" />
                  </label>
                  <label className="profile-field">
                    <span>Variety</span>
                    <input value={form.variety} onChange={f('variety')} placeholder="e.g. Hybrid PH4" />
                  </label>
                </div>

                {/* Status + Area */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="profile-field">
                    <span>Lifecycle Status</span>
                    <select
                      value={form.status}
                      onChange={f('status')}
                      className="mt-1 block w-full rounded-lg border-slate-200 py-2.5 pl-3 text-sm hover:bg-slate-50 focus:border-green-500 focus:outline-none focus:ring-green-500"
                    >
                      {LIFECYCLE.map(l => (
                        <option key={l.status} value={l.status}>{l.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="profile-field">
                    <span>Area Planted (ha)</span>
                    <input type="number" step="0.1" min="0.01" value={form.areaPlantedHectares} onChange={f('areaPlantedHectares')} placeholder="0.5" />
                  </label>
                </div>

                {/* Visual lifecycle progress */}
                {form.status !== 'FAILED' && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Lifecycle Progress</p>
                    <LifecycleBar status={form.status as CropStatus} />
                  </div>
                )}

                {/* Planning dates */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Planning Dates</p>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="profile-field">
                      <span>Expected Planting</span>
                      <input type="date" value={form.expectedPlantingDate} onChange={f('expectedPlantingDate')} />
                    </label>
                    <label className="profile-field">
                      <span>Expected Harvest</span>
                      <input type="date" value={form.expectedHarvestDate} onChange={f('expectedHarvestDate')} />
                    </label>
                  </div>
                </div>

                {/* Actual dates — shown when status is beyond PLANNED */}
                {form.status !== 'PLANNED' && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Actual Dates</p>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="profile-field">
                        <span>Actual Planting Date</span>
                        <input type="date" value={form.actualPlantingDate} onChange={f('actualPlantingDate')} />
                      </label>
                      {(form.status === 'HARVESTED' || form.status === 'SOLD') && (
                        <label className="profile-field">
                          <span>Actual Harvest Date</span>
                          <input type="date" value={form.actualHarvestDate} onChange={f('actualHarvestDate')} />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Yield */}
                <label className="profile-field">
                  <span>{form.status === 'HARVESTED' || form.status === 'SOLD' ? 'Actual Yield (kg)' : 'Estimated Yield (kg)'}</span>
                  <input type="number" min="0" step="1" value={form.yieldKg} onChange={f('yieldKg')} placeholder="e.g. 2000" />
                </label>

                {/* Notes */}
                <label className="profile-field">
                  <span>Notes &amp; Observations</span>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={f('notes')}
                    placeholder="Record fertilizer applications, pest observations, weather events, or other important notes."
                    className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm p-3"
                  />
                </label>

              </div>

              {/* Drawer footer */}
              <div className="flex shrink-0 items-center justify-between border-t border-slate-100 p-5 bg-slate-50">
                {editingId ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingId)}
                    className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                ) : <div />}
                <div className="flex gap-3">
                  <button type="button" onClick={closeDrawer} className="profile-secondary-button">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="farmer-primary-action">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {editingId ? 'Save Changes' : 'Add Crop'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Crop Card ────────────────────────────────────────────────────────────────
function CropCard({ crop, onClick }: { crop: Crop; onClick: () => void }) {
  const cfg     = getStatusConfig(crop.status);
  const progress = getLifecycleProgress(crop.status);
  const Icon    = cfg.icon;
  const harvest = crop.expectedHarvestDate;
  const daysLeft = daysUntil(harvest);

  return (
    <article
      onClick={onClick}
      className={`farmer-surface relative flex flex-col overflow-hidden cursor-pointer group border-l-4 ${cfg.border} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
    >
      {/* Status badge */}
      <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.colour} border ${cfg.border}`}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </div>

      {/* Body */}
      <div className="p-5 flex-1">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-green-700 transition-colors pr-20 leading-snug">
          {crop.cropType}
          {crop.variety && <span className="font-normal text-slate-500 text-sm"> ({crop.variety})</span>}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {crop.farmName}
          </p>
          {crop.areaPlantedHectares != null && (
            <p className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {crop.areaPlantedHectares} ha
            </p>
          )}
          {harvest && (
            <p className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              Harvest: {formatDate(harvest)}
              {daysLeft !== null && daysLeft > 0 && daysLeft <= 30 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold text-[10px]">
                  {daysLeft}d
                </span>
              )}
              {daysLeft !== null && daysLeft < 0 && crop.status === 'GROWING' && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-semibold text-[10px]">
                  Overdue
                </span>
              )}
            </p>
          )}
        </div>

        {/* Lifecycle progress bar — only for non-FAILED */}
        {crop.status !== 'FAILED' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 font-medium">Lifecycle</span>
              <span className="text-[10px] text-slate-400">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs text-slate-500">
          {crop.yieldKg != null
            ? <><Package className="h-3 w-3 inline mr-1 text-slate-400" />{crop.yieldKg.toLocaleString()} kg</>
            : <span className="text-slate-400 italic">Yield TBC</span>
          }
        </p>
        <span className="text-xs text-green-600 font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
          Edit <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}

// ─── Lifecycle Progress Bar ───────────────────────────────────────────────────
function LifecycleBar({ status }: { status: CropStatus }) {
  const mainSteps: CropStatus[] = ['PLANNED', 'PLANTED', 'GROWING', 'HARVESTED', 'SOLD'];
  const activeIdx = mainSteps.indexOf(status);

  return (
    <div className="flex items-center gap-1">
      {mainSteps.map((step, idx) => {
        const cfg    = getStatusConfig(step);
        const Icon   = cfg.icon;
        const active = idx === activeIdx;
        const done   = idx < activeIdx;

        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className={`flex flex-col items-center gap-1 flex-shrink-0`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                active ? `${cfg.bg} ${cfg.border} ${cfg.colour}` :
                done   ? 'bg-green-100 border-green-400 text-green-600' :
                         'bg-slate-100 border-slate-200 text-slate-300'
              }`}>
                {done
                  ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                  : <Icon className="h-4 w-4" />
                }
              </div>
              <span className={`text-[9px] font-semibold whitespace-nowrap ${active ? cfg.colour : done ? 'text-green-600' : 'text-slate-300'}`}>
                {LIFECYCLE.find(l => l.status === step)?.label}
              </span>
            </div>
            {idx < mainSteps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${done || active ? 'bg-green-300' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
