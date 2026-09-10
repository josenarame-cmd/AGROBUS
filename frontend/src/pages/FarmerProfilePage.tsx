import { useEffect, useState } from 'react';
import { AtSign, Check, Edit3, Loader2, Mail, MapPin, Phone, ShieldCheck, UserRound, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { FarmerPageHeader, FarmerSectionHeader } from '../components/farmer/FarmerUi';

export default function FarmerProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });

  useEffect(() => {
    let mounted = true;
    authAPI.getProfile().then(({ data }) => {
      if (!mounted) return;
      setProfile(data);
      setForm({ fullName: data.fullName || '', phone: data.phone || '' });
      localStorage.setItem('agrobus_user', JSON.stringify({ ...user, ...data }));
    }).catch(() => { if (mounted) setError(true); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim()) return;
    setSaving(true);
    try {
      const updated = await updateUserProfile({ fullName: form.fullName.trim(), phone: form.phone.trim() });
      setProfile({ ...profile, ...updated });
      setEditing(false);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Unable to update your profile. Please try again.');
    } finally { setSaving(false); }
  };

  if (loading) return <section className="farmer-content"><div className="profile-loading"><Loader2 className="h-7 w-7 animate-spin text-green-700" /><p>Loading your profile...</p></div></section>;
  if (error && !user) return <section className="farmer-content"><div className="profile-error"><ShieldCheck className="h-6 w-6" /><div><h2>Unable to load your profile</h2><p>Please refresh and try again.</p></div></div></section>;

  const currentProfile = profile || user;
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
            <FarmerSectionHeader title="Edit profile" description="Update your name and phone number. Your email, role, and Google picture stay protected." />
            <div className="profile-form-grid"><label className="profile-field"><span>Full name</span><input required value={form.fullName} onChange={event => setForm({ ...form, fullName: event.target.value })} /></label><label className="profile-field"><span>Phone number</span><input type="tel" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="+250 7XX XXX XXX" /></label></div>
            <div className="profile-form-actions"><button type="button" onClick={() => { setEditing(false); setForm({ fullName: user?.fullName || '', phone: user?.phone || '' }); }} className="profile-secondary-button"><X className="h-4 w-4" /> Cancel</button><button type="submit" disabled={saving} className="farmer-primary-action">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save changes</button></div>
          </form>
        ) : (
          <>
            <div className="profile-columns">
              <section className="farmer-surface profile-section"><FarmerSectionHeader title="Personal information" description="Identity details from your authenticated session." /><div className="profile-detail-list"><ProfileItem icon={UserRound} label="Full name" value={displayName} /><ProfileItem icon={AtSign} label="Farmer account ID" value={String(currentProfile?.userId || 'Not available')} /></div></section>
              <section className="farmer-surface profile-section"><FarmerSectionHeader title="Contact information" description="Contact details attached to your account." /><div className="profile-detail-list"><ProfileItem icon={Mail} label="Email address" value={currentProfile?.email || 'Not provided'} /><ProfileItem icon={Phone} label="Phone number" value={currentProfile?.phone || 'Not provided yet'} /></div></section>
            </div>
            <section className="farmer-surface profile-section"><FarmerSectionHeader title="Farm information" description="Farm details will appear here when your farmer-scoped farm profile is connected." /><div className="profile-farm-placeholder"><div className="profile-placeholder-icon"><MapPin className="h-5 w-5" /></div><div><h3 className="font-semibold text-slate-900">Farm profile not connected yet</h3><p className="mt-1 text-sm leading-6 text-slate-500">Your location, number of farms, and farm status will be loaded from your own records. No sample information is displayed.</p></div></div></section>
          </>
        )}
      </div>
    </section>
  );
}

function ProfileItem({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="profile-detail-item"><Icon className="h-5 w-5 flex-shrink-0 text-green-700" /><div className="min-w-0"><p className="profile-detail-label">{label}</p><p className="profile-detail-value">{value}</p></div></div>;
}
