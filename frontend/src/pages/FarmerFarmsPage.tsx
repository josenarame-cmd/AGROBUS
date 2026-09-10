import { useEffect, useState } from 'react';
import { Edit3, Loader2, MapPin, Plus, Ruler, Sprout, Trash2, Tractor, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { farmAPI } from '../services/api';
import { LocationOption, rwandaLocationsAPI } from '../services/rwandaLocations';
import { FarmerEmptyState, FarmerPageHeader, FarmerSectionHeader } from '../components/farmer/FarmerUi';

type Farm = { id: number; name: string; district: string; sector?: string; cell?: string; village?: string; sizeHectares?: number; primaryCrop?: string; notes?: string };
const emptyForm = { name: '', district: '', sector: '', cell: '', village: '', sizeHectares: '', primaryCrop: '', notes: '' };

export default function FarmerFarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formOpen, setFormOpen] = useState(() => window.location.hash === '#register-farm');
  const [editing, setEditing] = useState<Farm | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState({ districts: rwandaDistrictFallback(), sectors: [] as LocationOption[], cells: [] as LocationOption[], villages: [] as LocationOption[] });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const loadFarms = async () => {
    setLoading(true); setError(false); setErrorMessage('');
    try {
      const response = await farmAPI.getMine();
      if (!Array.isArray(response.data)) throw new Error('The farms response was not a list.');
      setFarms(response.data);
    } catch (requestError: any) {
      setError(true);
      const status = requestError?.response?.status;
      setErrorMessage(status ? `Farm service returned HTTP ${status}.` : 'The farm service could not be reached.');
    }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadFarms();
    const openFromHash = () => { if (window.location.hash === '#register-farm') setFormOpen(true); };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  useEffect(() => {
    if (!form.district) return;
    setLocationLoading(true);
    rwandaLocationsAPI.sectors(form.district)
      .then(sectors => setLocations(current => ({ ...current, sectors, cells: [], villages: [] })))
      .catch(() => setLocationError('Could not load sectors for this district.'))
      .finally(() => setLocationLoading(false));
  }, [form.district]);

  useEffect(() => {
    if (!form.district || !form.sector) return;
    setLocationLoading(true);
    rwandaLocationsAPI.cells(form.sector, form.district)
      .then(cells => setLocations(current => ({ ...current, cells, villages: [] })))
      .catch(() => setLocationError('Could not load cells for this sector.'))
      .finally(() => setLocationLoading(false));
  }, [form.district, form.sector]);

  useEffect(() => {
    if (!form.district || !form.sector || !form.cell) return;
    setLocationLoading(true);
    rwandaLocationsAPI.villages(form.cell, form.sector, form.district)
      .then(villages => setLocations(current => ({ ...current, villages })))
      .catch(() => setLocationError('Could not load villages for this cell.'))
      .finally(() => setLocationLoading(false));
  }, [form.cell, form.district, form.sector]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); window.location.hash = 'register-farm'; };
  const openEdit = (farm: Farm) => { setEditing(farm); setForm({ name: farm.name, district: farm.district, sector: farm.sector || '', cell: farm.cell || '', village: farm.village || '', sizeHectares: farm.sizeHectares?.toString() || '', primaryCrop: farm.primaryCrop || '', notes: farm.notes || '' }); setFormOpen(true); };
  const saveFarm = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    const payload = { ...form, sizeHectares: form.sizeHectares ? Number(form.sizeHectares) : undefined };
    try {
      if (editing) {
        const response = await farmAPI.update(editing.id, payload);
        setFarms(current => current.map(farm => farm.id === editing.id ? response.data : farm));
      } else {
        const response = await farmAPI.create(payload);
        setFarms(current => [response.data, ...current]);
      }
      setFormOpen(false);
      toast.success(editing ? 'Farm updated.' : 'Farm registered.');
      loadFarms().catch(() => undefined);
    }
    catch (requestError: any) { toast.error(requestError?.response?.status === 403 ? 'Your account is not authorized to manage farms.' : 'Unable to save this farm. Please check the details and try again.'); }
    finally { setSaving(false); }
  };
  const removeFarm = async (farm: Farm) => {
    if (!window.confirm(`Remove ${farm.name}?`)) return;
    try { await farmAPI.remove(farm.id); toast.success('Farm removed.'); await loadFarms(); }
    catch { toast.error('Unable to remove this farm.'); }
  };

  return <section className="farmer-content animate-fade-in">
    <FarmerPageHeader eyebrow="My farm" title="My Farms" description="Register and manage the farms connected to your authenticated farmer account." icon={Tractor} action={{ label: 'Register farm', to: '/farmer/farms#register-farm' }} />
    <div className="space-y-6">
      <section className="farmer-surface farm-summary"><div className="farm-summary-icon"><Tractor className="h-6 w-6" /></div><div><p className="farmer-eyebrow">Farm portfolio</p><h2 className="farm-summary-title">Your farms, your records</h2><p className="farm-summary-copy">Every farm you add stays private to your account and becomes the foundation for crops, harvests, support, finance, and monitoring.</p></div><div className="farm-count"><strong>{loading ? '--' : farms.length}</strong><span>registered {farms.length === 1 ? 'farm' : 'farms'}</span></div></section>
      {error && <div className="farmer-error-state"><div><p>Unable to load your farms.</p><small>{errorMessage}</small></div><button onClick={loadFarms}>Retry</button></div>}
      {loading ? <div className="farm-card-grid"><FarmSkeleton /><FarmSkeleton /></div> : farms.length === 0 && !error ? <section className="farmer-surface"><FarmerEmptyState icon={Tractor} title="No farms registered yet" description="Register your first farm to start organizing crops, activities, harvests, agricultural support, and finance." action={{ label: 'Register your first farm', to: '/farmer/farms#register-farm' }} /></section> : <><FarmerSectionHeader title="Your registered farms" description="Select a farm to update its information." /><div className="farm-card-grid">{farms.map(farm => <FarmCard key={farm.id} farm={farm} onEdit={() => openEdit(farm)} onDelete={() => removeFarm(farm)} />)}</div></>}
    </div>
    {formOpen && <div className="farm-form-shell" id="register-farm"><form className="farmer-surface farm-form" onSubmit={saveFarm}><div className="farm-form-heading"><div><p className="farmer-eyebrow">Farm details</p><h2>{editing ? 'Edit farm' : 'Register a farm'}</h2><p>Select your location from Rwanda&apos;s administrative areas.</p></div><button type="button" onClick={() => setFormOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button></div><div className="farm-form-grid"><Field label="Farm name" required value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Nyamata Farm" /><SelectField label="District" required value={form.district} options={locations.districts} loading={locationLoading} onChange={value => setForm({ ...form, district: value, sector: '', cell: '', village: '' })} placeholder="Select your district" /><SelectField label="Sector" required value={form.sector} options={locations.sectors} loading={locationLoading} disabled={!form.district} onChange={value => setForm({ ...form, sector: value, cell: '', village: '' })} placeholder="Select a sector" /><SelectField label="Cell" required value={form.cell} options={locations.cells} loading={locationLoading} disabled={!form.sector} onChange={value => setForm({ ...form, cell: value, village: '' })} placeholder="Select a cell" /><SelectField label="Village" required value={form.village} options={locations.villages} loading={locationLoading} disabled={!form.cell} onChange={value => setForm({ ...form, village: value })} placeholder="Select a village" /><Field label="Size in hectares" type="number" value={form.sizeHectares} onChange={v => setForm({ ...form, sizeHectares: v })} placeholder="e.g. 2.5" /><Field label="Primary crop" value={form.primaryCrop} onChange={v => setForm({ ...form, primaryCrop: v })} placeholder="e.g. Maize" /></div>{locationError && <p className="farm-location-error">{locationError}</p>}<label className="profile-field"><span>Notes</span><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Anything important about this farm" rows={3} /></label><div className="profile-form-actions"><button type="button" onClick={() => setFormOpen(false)} className="profile-secondary-button">Cancel</button><button disabled={saving || locationLoading} className="farmer-primary-action">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{editing ? 'Save changes' : 'Register farm'}</button></div></form></div>}
  </section>;
}

function FarmCard({ farm, onEdit, onDelete }: { farm: Farm; onEdit: () => void; onDelete: () => void }) { return <article className="farmer-surface farm-card"><div className="farm-card-top"><div className="farm-card-icon"><Sprout className="h-5 w-5" /></div><span className="farm-status">Active</span></div><h3>{farm.name}</h3><div className="farm-card-details"><span><MapPin className="h-4 w-4" />{farm.district}{farm.sector ? `, ${farm.sector}` : ''}</span><span><Ruler className="h-4 w-4" />{farm.sizeHectares ? `${farm.sizeHectares} hectares` : 'Size not provided'}</span><span><Sprout className="h-4 w-4" />{farm.primaryCrop || 'Primary crop not provided'}</span></div><div className="farm-card-actions"><button onClick={onEdit}><Edit3 className="h-4 w-4" /> Edit</button><button onClick={onDelete} className="danger"><Trash2 className="h-4 w-4" /> Remove</button></div></article>; }
function Field({ label, required, value, onChange, placeholder, type = 'text' }: { label: string; required?: boolean; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) { return <label className="profile-field"><span>{label}{required && ' *'}</span><input required={required} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></label>; }
function SelectField({ label, required, value, options, loading, disabled, onChange, placeholder }: { label: string; required?: boolean; value: string; options: LocationOption[]; loading: boolean; disabled?: boolean; onChange: (value: string) => void; placeholder: string }) { return <label className="profile-field"><span>{label}{required && ' *'}</span><select required={required} value={value} disabled={disabled || (loading && options.length === 0)} onChange={event => onChange(event.target.value)}><option value="">{loading && options.length === 0 ? 'Loading locations...' : placeholder}</option>{options.map(option => <option key={option.key} value={option.name}>{option.name}</option>)}</select></label>; }
function rwandaDistrictFallback(): LocationOption[] { return ['Bugesera', 'Burera', 'Gakenke', 'Gasabo', 'Gatsibo', 'Gicumbi', 'Gisagara', 'Huye', 'Kayonza', 'Kamonyi', 'Karongi', 'Kicukiro', 'Kirehe', 'Muhanga', 'Musanze', 'Ngoma', 'Ngororero', 'Nyabihu', 'Nyagatare', 'Nyamagabe', 'Nyamasheke', 'Nyanza', 'Nyarugenge', 'Nyaruguru', 'Rubavu', 'Ruhango', 'Rulindo', 'Rusizi', 'Rutsiro', 'Rwamagana'].map(name => ({ name, key: name.toLowerCase() })); }
function FarmSkeleton() { return <div className="farmer-surface farm-skeleton"><div /><div /><div /></div>; }