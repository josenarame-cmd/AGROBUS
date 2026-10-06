import { useEffect, useState } from 'react';
import { BrainCircuit, CheckCircle2, Droplets, Leaf, Loader2, MapPin, Sprout, Thermometer, WandSparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { farmerAIAPI, farmAPI } from '../services/api';
import { FarmerPageHeader, FarmerSectionHeader } from '../components/farmer/FarmerUi';

type Farm = { id: number; name: string; district: string; sizeHectares?: number; primaryCrop?: string };
type Recommendation = {
  engine: string;
  farmName: string;
  district: string;
  recommendedCrop: string;
  confidence: number;
  summary: string;
  reasons: string[];
  inputs: { name: string; category: string; quantity: string; purpose: string }[];
  alternatives: { crop: string; score: number; note: string }[];
  nextSteps: string[];
};

const defaults = { farmId: '', soilType: 'loam', soilPh: '6.2', soilMoisture: '45', temperatureC: '23', expectedRainfallMm: '800', season: 'Current season' };

export default function FarmerAIAdvisorPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);

  useEffect(() => {
    farmAPI.getMine().then(({ data }) => {
      const list = Array.isArray(data) ? data : [];
      setFarms(list);
      if (list.length) setForm(current => ({ ...current, farmId: String(list[0].id) }));
    }).catch(() => toast.error('Could not load your farms. You can still run an assessment.'))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));

  const analyze = async (event: React.FormEvent) => {
    event.preventDefault();
    setThinking(true);
    try {
      const response = await farmerAIAPI.recommend({
        farmId: form.farmId ? Number(form.farmId) : undefined,
        soilType: form.soilType,
        soilPh: Number(form.soilPh),
        soilMoisture: Number(form.soilMoisture),
        temperatureC: Number(form.temperatureC),
        expectedRainfallMm: Number(form.expectedRainfallMm),
        season: form.season,
        farmSizeHectares: farms.find(f => String(f.id) === form.farmId)?.sizeHectares || undefined,
      });
      setResult(response.data);
      toast.success('Farm analysis completed.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'The AI advisor could not complete the assessment.');
    } finally {
      setThinking(false);
    }
  };

  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader
        eyebrow="Agricultural intelligence"
        title="AI Farm Advisor"
        description="Turn farm and soil conditions into an explainable crop and input recommendation."
        icon={BrainCircuit}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={analyze} className="farmer-surface p-6 sm:p-8">
          <FarmerSectionHeader title="Farm conditions" description="Use sensor readings when available for a stronger assessment." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Farm" value={form.farmId} onChange={v => update('farmId', v)} options={farms.map(f => ({ value: String(f.id), label: `${f.name} — ${f.district}` }))} loading={loading} />
            <Field label="Soil type" value={form.soilType} onChange={v => update('soilType', v)} options={[
              { value: 'loam', label: 'Loam' }, { value: 'sandy loam', label: 'Sandy loam' }, { value: 'clay loam', label: 'Clay loam' }, { value: 'clay', label: 'Clay' },
            ]} />
            <NumberField label="Soil pH" value={form.soilPh} onChange={v => update('soilPh', v)} min="3.5" max="9.5" step="0.1" icon={Leaf} />
            <NumberField label="Soil moisture (%)" value={form.soilMoisture} onChange={v => update('soilMoisture', v)} min="0" max="100" step="1" icon={Droplets} />
            <NumberField label="Temperature (°C)" value={form.temperatureC} onChange={v => update('temperatureC', v)} min="0" max="60" step="0.5" icon={Thermometer} />
            <NumberField label="Expected rainfall (mm)" value={form.expectedRainfallMm} onChange={v => update('expectedRainfallMm', v)} min="0" max="5000" step="10" icon={Droplets} />
            <label className="profile-field sm:col-span-2"><span>Season / context</span><input value={form.season} onChange={e => update('season', e.target.value)} placeholder="e.g. September planting season" /></label>
          </div>
          <button disabled={thinking} className="farmer-primary-action mt-6 w-full justify-center py-3">
            {thinking ? <Loader2 className="h-5 w-5 animate-spin" /> : <WandSparkles className="h-5 w-5" />}
            {thinking ? 'Analyzing farm…' : 'Analyze with AgroBus AI'}
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-500">Prototype recommendations should be validated with local agronomists or extension guidance before field use.</p>
        </form>

        {!result ? (
          <section className="farmer-surface flex min-h-[420px] items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700"><BrainCircuit className="h-8 w-8" /></div>
              <h2 className="mt-5 text-xl font-bold text-slate-900">Your farm intelligence will appear here</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">AgroBus scores crop fit from soil type, pH, moisture, temperature and expected rainfall, then connects the recommendation to the inputs the farmer may need.</p>
            </div>
          </section>
        ) : (
          <div className="space-y-6">
            <section className="farmer-surface overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/70 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="farmer-eyebrow">{result.engine}</p><h2 className="mt-1 text-3xl font-bold text-slate-900">{result.recommendedCrop}</h2><p className="mt-2 text-sm text-slate-500">{result.summary}</p></div>
                  <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Model confidence</p><p className="mt-1 text-2xl font-bold text-green-700">{result.confidence}%</p></div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4" />{result.farmName}{result.district !== 'Not linked' ? ` · ${result.district}` : ''}</div>
              </div>
              <div className="p-6"><h3 className="font-bold text-slate-900">Why this crop?</h3><ul className="mt-3 space-y-3">{result.reasons.map(reason => <li key={reason} className="flex gap-3 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-green-600" />{reason}</li>)}</ul></div>
            </section>

            <section className="farmer-surface p-6"><FarmerSectionHeader title="Recommended inputs" description="The recommendation connects directly to AgroBus input access." /><div className="space-y-3">{result.inputs.map(input => <div key={input.name} className="rounded-xl border border-slate-100 p-4"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold text-slate-900">{input.name}</p><p className="mt-1 text-xs text-slate-500">{input.category} · {input.purpose}</p></div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">{input.quantity}</span></div></div>)}</div></section>

            <section className="farmer-surface p-6"><FarmerSectionHeader title="Other crop matches" description="Alternatives ranked by the same transparent prototype scoring model." /><div className="grid gap-3 sm:grid-cols-3">{result.alternatives.map(option => <div key={option.crop} className="rounded-xl border border-slate-100 p-4"><div className="flex items-center gap-2"><Sprout className="h-4 w-4 text-green-600" /><p className="font-semibold text-slate-900">{option.crop}</p></div><p className="mt-2 text-2xl font-bold text-slate-800">{option.score}<span className="text-xs font-normal text-slate-400">/100</span></p><p className="mt-1 text-xs leading-5 text-slate-500">{option.note}</p></div>)}</div></section>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, options, loading }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; loading?: boolean }) {
  return <label className="profile-field"><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}><option value="">{loading ? 'Loading farms…' : options.length ? 'Select a farm' : 'No farm selected'}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
function NumberField({ label, value, onChange, min, max, step, icon: Icon }: { label: string; value: string; onChange: (value: string) => void; min: string; max: string; step: string; icon: typeof Leaf }) {
  return <label className="profile-field"><span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{label}</span><input required type="number" min={min} max={max} step={step} value={value} onChange={e => onChange(e.target.value)} /></label>;
}
