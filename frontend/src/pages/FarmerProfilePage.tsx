import { useEffect, useState } from 'react';
import { AtSign, Check, Edit3, Loader2, Mail, MapPin, Phone, ShieldCheck, UserRound, X, Leaf, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI, farmerSelfAPI } from '../services/api';
import { FarmerPageHeader, FarmerSectionHeader } from '../components/farmer/FarmerUi';

export default function FarmerProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    nationalId: '',
    district: '',
    sector: '',
    farmSize: '',
    cropType: '',
    gender: 'MALE'
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      authAPI.getProfile(),
      farmerSelfAPI.getProfile()
    ]).then(([authRes, farmerRes]) => {
      if (!mounted) return;
      setUserProfile(authRes.data);
      setFarmerProfile(farmerRes.data);
      setForm({
        fullName: authRes.data.fullName || '',
        phone: authRes.data.phone || farmerRes.data.phone || '',
        nationalId: farmerRes.data.nationalId || '',
        district: farmerRes.data.district || '',
        sector: farmerRes.data.sector || '',
        farmSize: farmerRes.data.farmSize ? String(farmerRes.data.farmSize) : '',
        cropType: farmerRes.data.cropType || '',
        gender: farmerRes.data.gender || 'MALE'
      });
      localStorage.setItem('agrobus_user', JSON.stringify({ ...user, ...authRes.data }));
    }).catch(() => {
      if (mounted) setError(true);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim() || !form.nationalId.trim() || !form.district.trim()) return;
    setSaving(true);
    try {
      const updatedUser = await updateUserProfile({ fullName: form.fullName.trim(), phone: form.phone.trim() });
      setUserProfile({ ...userProfile, ...updatedUser });
      
      const updatedFarmerRes = await farmerSelfAPI.updateProfile({
        nationalId: form.nationalId.trim(),
        district: form.district.trim(),
        sector: form.sector.trim(),
        farmSize: form.farmSize ? parseFloat(form.farmSize) : null,
        cropType: form.cropType.trim(),
        gender: form.gender
      });
      setFarmerProfile(updatedFarmerRes.data);

      setEditing(false);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Unable to update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <section className="farmer-content"><div className="profile-loading"><Loader2 className="h-7 w-7 animate-spin text-green-700" /><p>Loading your profile...</p></div></section>;
  if (error && !user) return <section className="farmer-content"><div className="profile-error"><ShieldCheck className="h-6 w-6" /><div><h2>Unable to load your profile</h2><p>Please refresh and try again.</p></div></div></section>;

  const currentProfile = userProfile || user;
  const displayName = currentProfile?.fullName || form.fullName || 'Farmer';
  const pictureUrl = currentProfile?.pictureUrl;

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader eyebrow="Account" title="My Profile" description="Review and update the personal details connected to your AGROBUS account." icon={UserRound} />
      <div className="space-y-6">
        <section className="profile-overview">
          <div className="profile-overview-main">
            {pictureUrl ? <img className="profile-avatar profile-avatar-image" src={pictureUrl} alt={`${displayName} profile`} /> : <div className="profile-avatar">{displayName.charAt(0).toUpperCase()}</div>}
            <div><p className="profile-kicker">Farmer account</p><h2 className="profile-name">{displayName}</h2><p className="profile-email">{currentProfile?.email || 'Email not provided'}</p></div>
          </div>
          <div className="profile-overview-actions"><div className="profile-status"><ShieldCheck className="h-4 w-4" /> Account active</div><button type="button" onClick={() => setEditing(true)} className="profile-edit-button" disabled={editing}><Edit3 className="h-4 w-4" /> Edit profile</button></div>
        </section>

        {editing ? (
          <form onSubmit={handleSave} className="farmer-surface profile-section profile-edit-card">
            <FarmerSectionHeader title="Edit profile" description="Update your personal and farm information." />
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <label className="profile-field"><span>Full name</span><input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></label>
              <label className="profile-field"><span>Phone number</span><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+250 7XX XXX XXX" /></label>
              
              <label className="profile-field"><span>National ID</span><input required value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} placeholder="119..." /></label>
              <label className="profile-field"><span>Gender</span>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm">
                   <option value="MALE">Male</option>
                   <option value="FEMALE">Female</option>
                   <option value="OTHER">Other</option>
                </select>
              </label>

              <label className="profile-field"><span>District</span><input required value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="e.g. Gasabo" /></label>
              <label className="profile-field"><span>Sector</span><input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} placeholder="e.g. Nduba" /></label>

              <label className="profile-field"><span>Total Farm Size (Hectares)</span><input type="number" step="0.1" value={form.farmSize} onChange={e => setForm({ ...form, farmSize: e.target.value })} placeholder="e.g. 2.5" /></label>
              <label className="profile-field"><span>Primary Crop Type</span><input value={form.cropType} onChange={e => setForm({ ...form, cropType: e.target.value })} placeholder="e.g. Maize" /></label>
            </div>
            
            <div className="profile-form-actions mt-6">
              <button type="button" onClick={() => { setEditing(false); }} className="profile-secondary-button"><X className="h-4 w-4" /> Cancel</button>
              <button type="submit" disabled={saving} className="farmer-primary-action">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save changes</button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-columns">
              <section className="farmer-surface profile-section">
                <FarmerSectionHeader title="Personal information" description="Identity details from your authenticated session." />
                <div className="profile-detail-list">
                  <ProfileItem icon={UserRound} label="Full name" value={displayName} />
                  <ProfileItem icon={AtSign} label="Farmer account ID" value={String(currentProfile?.userId || 'Not available')} />
                  <ProfileItem icon={ShieldCheck} label="National ID" value={farmerProfile?.nationalId || 'PENDING'} />
                  <ProfileItem icon={UserRound} label="Gender" value={farmerProfile?.gender || 'N/A'} />
                </div>
              </section>
              <section className="farmer-surface profile-section">
                <FarmerSectionHeader title="Contact information" description="Contact details attached to your account." />
                <div className="profile-detail-list">
                  <ProfileItem icon={Mail} label="Email address" value={currentProfile?.email || 'Not provided'} />
                  <ProfileItem icon={Phone} label="Phone number" value={currentProfile?.phone || farmerProfile?.phone || 'Not provided yet'} />
                </div>
              </section>
            </div>
            <section className="farmer-surface profile-section">
                <FarmerSectionHeader title="Farm information" description="Summary of your farming operation based on your profile." />
                <div className="profile-columns mt-4">
                  <div className="profile-detail-list">
                    <ProfileItem icon={MapPin} label="District" value={farmerProfile?.district || 'Unknown'} />
                    <ProfileItem icon={MapPin} label="Sector" value={farmerProfile?.sector || 'Not provided'} />
                  </div>
                  <div className="profile-detail-list">
                    <ProfileItem icon={Scale} label="Total Farm Size" value={farmerProfile?.farmSize ? `${farmerProfile.farmSize} Hectares` : 'Not specified'} />
                    <ProfileItem icon={Leaf} label="Primary Crop Type" value={farmerProfile?.cropType || 'Not specified'} />
                  </div>
                </div>
            </section>
          </>
        )}
      </div>
    </section>
  );
}

function ProfileItem({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="profile-detail-item"><Icon className="h-5 w-5 flex-shrink-0 text-green-700" /><div className="min-w-0"><p className="profile-detail-label">{label}</p><p className="profile-detail-value">{value}</p></div></div>;
}
