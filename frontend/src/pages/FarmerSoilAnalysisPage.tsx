import { useEffect, useState, useRef } from 'react';
import {
  Camera, Navigation2, Loader2, WandSparkles, RefreshCw, Info,
  Sprout, FlaskConical, CheckCircle2, AlertTriangle, XCircle,
  Upload, Leaf, ImageIcon, MapPin, ChevronDown, ChevronRight, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { farmerSoilAnalysisAPI, farmAPI } from '../services/api';

// ── Types ────────────────────────────────────────────────────────────────────
type Farm = { id: number; name: string; district: string; sector: string };
type SoilAnalysisResult = {
  id: number; sampleId: string; soilType: string; confidence: number;
  confidenceLevel: string; reviewRequired: boolean; disclaimer: string;
  district: string; sector: string; currentCrop: string; createdAt: string;
};

const defaults = { farmId: '', district: '', sector: '', season: '', currentCrop: '', plannedCrop: '', previousCrop: '', notes: '' };

// ─── Upload states ─────────────────────────────────────────────────────────
type UploadState = 'idle' | 'preview' | 'analyzing' | 'complete';

export default function FarmerSoilAnalysisPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [history, setHistory] = useState<SoilAnalysisResult[]>([]);
  const [form, setForm] = useState(defaults);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<SoilAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeProgress = useRef<string[]>([]);
  const [progressSteps, setProgressSteps] = useState<string[]>([]);

  useEffect(() => {
    farmAPI.getMine()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setFarms(list);
        if (list.length) {
          setForm(c => ({ ...c, farmId: String(list[0].id), district: list[0].district || '', sector: list[0].sector || '' }));
        }
      })
      .catch(() => toast.error('Could not load farms.'))
      .finally(() => setLoadingFarms(false));
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    farmerSoilAnalysisAPI.getHistory()
      .then(({ data }) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Could not load soil analysis history.'))
      .finally(() => setLoadingHistory(false));
  };

  const update = (key: keyof typeof form, value: string) => setForm(c => ({ ...c, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setUploadState('preview');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setUploadState('preview');
    }
  };

  const handleRetake = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setUploadState('idle');
    setProgressSteps([]);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) { toast.error('Please upload a soil image first.'); return; }
    setUploadState('analyzing');
    setResult(null);
    setProgressSteps([]);

    // Simulate progress steps
    const steps = ['Image received', 'Image processed', 'Running AI model', 'Generating assessment'];
    for (let i = 0; i < steps.length - 1; i++) {
      await new Promise(r => setTimeout(r, 600));
      setProgressSteps(prev => [...prev, steps[i]]);
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (form.farmId) formData.append('farmId', form.farmId);
      if (form.district) formData.append('district', form.district);
      if (form.sector) formData.append('sector', form.sector);
      if (form.season) formData.append('season', form.season);
      if (form.currentCrop) formData.append('currentCrop', form.currentCrop);
      if (form.previousCrop) formData.append('previousCrop', form.previousCrop);
      if (form.plannedCrop) formData.append('plannedCrop', form.plannedCrop);
      if (form.notes) formData.append('notes', form.notes);

      const response = await farmerSoilAnalysisAPI.analyze(formData);
      setProgressSteps(steps);
      setResult(response.data);
      setUploadState('complete');
      toast.success('Soil analysis complete!');
      fetchHistory();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Soil analysis failed. Ensure the AI service is running.');
      setUploadState('preview');
    }
  };

  const activeFarm = farms.find(f => String(f.id) === form.farmId);

  return (
    <div className="animate-fade-in pb-12 space-y-8 max-w-[1280px] mx-auto px-4 sm:px-6">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-amber-400 opacity-10 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-green-500 opacity-10 blur-[50px]" />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/8 px-3.5 py-1.5">
            <FlaskConical className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-200">AI Soil Intelligence</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight lg:text-4xl">
            Analyze Your Soil
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
            Capture a clear photo of your field soil to receive an AI-assisted visual soil type estimate.
            Part of your AGROBUS Intelligence Journey.
          </p>
        </div>
      </div>

      {/* ── FARM CONTEXT BANNER ─────────────────────────────────────────────── */}
      {activeFarm && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-5 py-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-green-600">Analyzing for Farm</p>
            <p className="text-sm font-bold text-green-900">
              {activeFarm.name}
              {activeFarm.district && <span className="ml-2 font-normal text-green-600">· {activeFarm.district}</span>}
            </p>
          </div>
          <div className="ml-auto relative">
            <select
              value={form.farmId}
              onChange={e => {
                const fv = e.target.value;
                const found = farms.find(f => String(f.id) === fv);
                setForm(c => ({ ...c, farmId: fv, district: found?.district || '', sector: found?.sector || '' }));
              }}
              className="appearance-none rounded-xl border border-green-200 bg-white py-2 pl-3 pr-7 text-xs font-semibold text-green-800 outline-none focus:border-green-500 cursor-pointer"
            >
              {farms.map(f => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-green-500" />
          </div>
        </div>
      )}

      {/* ── MAIN FLOW ───────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_480px]">

        {/* ── LEFT: UPLOAD + FORM ─────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Upload / Preview */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Step 1 — Soil Photo</h2>
              <p className="mt-1 text-base font-black text-slate-800">Capture or Upload Your Soil</p>
            </div>

            {uploadState === 'idle' ? (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center transition hover:border-green-400 hover:bg-green-50/50 group"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 group-hover:scale-105 transition-transform">
                  <Camera className="h-8 w-8" />
                </div>
                <p className="text-sm font-bold text-slate-700">Take a photo or upload one</p>
                <p className="mt-1 text-xs text-slate-400">JPEG, PNG up to 10MB · Or drag & drop</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
                    <Camera className="h-3.5 w-3.5" /> Take Photo
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">
                    <Upload className="h-3.5 w-3.5" /> Upload Photo
                  </span>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-4 text-xs text-slate-400">
                  <p>✓ Clear soil surface</p>
                  <p>✓ Good lighting</p>
                  <p>✓ Avoid heavy shadows</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={imagePreview!} alt="Soil preview" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div className="text-white">
                    <p className="text-xs font-bold">{imageFile?.name}</p>
                    <p className="text-[10px] opacity-70">{imageFile ? (imageFile.size / 1024).toFixed(0) : 0} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Retake
                  </button>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          </div>

          {/* Context form */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Step 2 — Farm Context</h2>
              <p className="mt-1 text-base font-black text-slate-800">Provide Location & Crop Info</p>
              <p className="mt-1 text-xs text-slate-400">Context helps the AI produce a more accurate result.</p>
            </div>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="profile-field sm:col-span-2">
                  <span>Farm</span>
                  <select value={form.farmId} onChange={e => {
                    const fv = e.target.value;
                    const found = farms.find(f => String(f.id) === fv);
                    setForm(c => ({ ...c, farmId: fv, district: found?.district || '', sector: found?.sector || '' }));
                  }}>
                    <option value="">{loadingFarms ? 'Loading farms…' : 'No farm selected'}</option>
                    {farms.map(f => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
                  </select>
                </label>
                <label className="profile-field"><span>District</span><input value={form.district} onChange={e => update('district', e.target.value)} placeholder="e.g. Bugesera" /></label>
                <label className="profile-field"><span>Sector</span><input value={form.sector} onChange={e => update('sector', e.target.value)} placeholder="e.g. Nyamata" /></label>
                <label className="profile-field"><span>Current Crop (Optional)</span><input value={form.currentCrop} onChange={e => update('currentCrop', e.target.value)} placeholder="e.g. Maize" /></label>
                <label className="profile-field"><span>Planned Crop (Optional)</span><input value={form.plannedCrop} onChange={e => update('plannedCrop', e.target.value)} placeholder="e.g. Beans" /></label>
                <label className="profile-field sm:col-span-2"><span>Notes (Optional)</span><input value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any field observations…" /></label>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button type="button" onClick={() => {
                  if (navigator.geolocation) {
                    toast('Requesting location…', { icon: '📍' });
                    navigator.geolocation.getCurrentPosition(() => toast.success('Location obtained.'), () => toast.error('Could not access location.'));
                  }
                }} className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700">
                  <Navigation2 className="h-4 w-4" /> Use my location
                </button>
              </div>

              <button
                type="submit"
                disabled={uploadState === 'analyzing' || !imageFile}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(22,163,74,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(22,163,74,0.45)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {uploadState === 'analyzing'
                  ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing soil…</>
                  : <><WandSparkles className="h-5 w-5" /> Analyze with AI</>}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: RESULT / ANALYSIS STATE ─────────────────────────────── */}
        <div className="space-y-5">

          {/* Analysis state / result */}
          {uploadState === 'idle' && !result && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FlaskConical className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-700">Soil Analysis Result</h3>
              <p className="mt-2 max-w-xs text-sm text-slate-400 leading-relaxed">
                Upload a soil photo and click "Analyze with AI" to see the estimated visual soil type.
              </p>
            </div>
          )}

          {uploadState === 'analyzing' && (
            <AnalysisProgressCard progressSteps={progressSteps} imagePreview={imagePreview} />
          )}

          {(uploadState === 'complete' || result) && result && (
            <SoilResultCard result={result} imagePreview={imagePreview} />
          )}

          {/* Scientific safety notice */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1.5">Scientific Limitations</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  This is a <strong>visual soil-type classification prototype</strong> using AI image analysis.
                  It does <strong>not</strong> measure pH, nitrogen, phosphorus, potassium, or organic matter.
                  For precise fertility data, use a certified laboratory test.
                </p>
                <p className="mt-2 text-[10px] font-semibold text-amber-600 uppercase tracking-wider">AI ESTIMATE · NOT A LAB TEST</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── HISTORY ─────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">My Soil Analyses</h2>
            <p className="mt-1 text-base font-black text-slate-800">Analysis History</p>
          </div>
          <button onClick={fetchHistory} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingHistory ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
            ))
          ) : history.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
              <ImageIcon className="h-8 w-8 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-500">No previous analyses found.</p>
              <p className="text-xs text-slate-400 mt-1">Your soil analysis history will appear here.</p>
            </div>
          ) : history.map(item => (
            <SoilHistoryCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AnalysisProgressCard({ progressSteps, imagePreview }: { progressSteps: string[]; imagePreview: string | null }) {
  const allSteps = ['Image received', 'Image processed', 'Running AI model', 'Generating assessment'];
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-8 w-8 rounded-full border-2 border-green-200 border-t-green-500 animate-spin" />
        <div>
          <p className="text-sm font-bold text-slate-800">AGROBUS AI</p>
          <p className="text-xs text-slate-400">Analyzing your soil…</p>
        </div>
      </div>
      {imagePreview && (
        <div className="mb-5 rounded-xl overflow-hidden relative">
          <img src={imagePreview} alt="Soil being analyzed" className="w-full h-36 object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20">
            <div className="rounded-full bg-white/90 p-3">
              <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
            </div>
          </div>
        </div>
      )}
      <div className="space-y-2.5">
        {allSteps.map((step, i) => {
          const done = progressSteps.includes(step);
          const active = !done && i === progressSteps.length;
          return (
            <div key={step} className="flex items-center gap-2.5 text-sm">
              {done
                ? <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                : active
                ? <Loader2 className="h-4 w-4 text-slate-400 animate-spin shrink-0" />
                : <div className="h-4 w-4 rounded-full border-2 border-slate-200 shrink-0" />}
              <span className={done ? 'text-green-700 font-semibold' : active ? 'text-slate-600 font-semibold' : 'text-slate-400'}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SoilResultCard({ result, imagePreview }: { result: SoilAnalysisResult; imagePreview: string | null }) {
  const confColor = result.confidenceLevel === 'HIGH' ? 'text-green-600' : result.confidenceLevel === 'MEDIUM' ? 'text-amber-500' : 'text-red-500';
  const confBg = result.confidenceLevel === 'HIGH' ? 'bg-green-50 border-green-200' : result.confidenceLevel === 'MEDIUM' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
  const confIcon = result.confidenceLevel === 'HIGH' ? CheckCircle2 : result.confidenceLevel === 'MEDIUM' ? AlertTriangle : XCircle;
  const ConfIcon = confIcon;

  return (
    <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
      {/* Header band */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">AI Soil Analysis Result</p>
        <h2 className="text-2xl font-black text-white">{result.soilType}</h2>
        <p className="text-xs font-mono text-slate-400 mt-1">{result.sampleId}</p>
      </div>

      {imagePreview && (
        <div className="h-32 overflow-hidden">
          <img src={imagePreview} alt="Analyzed soil" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Confidence */}
        <div className={`rounded-2xl border px-5 py-4 ${confBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ConfIcon className={`h-5 w-5 ${confColor}`} />
              <span className={`text-sm font-bold ${confColor}`}>
                {result.confidenceLevel === 'HIGH' ? 'High Confidence' : result.confidenceLevel === 'MEDIUM' ? 'Medium Confidence' : 'Low Confidence'}
              </span>
            </div>
            <span className={`text-3xl font-black ${confColor}`}>{Math.round(result.confidence)}%</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-white/60 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                result.confidenceLevel === 'HIGH' ? 'bg-green-500' : result.confidenceLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>

        {/* Review required */}
        {result.reviewRequired && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-bold mb-0.5">Agronomist Review Recommended</p>
              <p className="opacity-80">Prediction confidence is below the high-confidence threshold. Consider having an agronomist validate this result.</p>
            </div>
          </div>
        )}

        {/* Context */}
        {(result.district || result.currentCrop) && (
          <div className="flex flex-wrap gap-2">
            {result.district && <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"><MapPin className="h-3 w-3" />{result.district}</span>}
            {result.currentCrop && <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"><Sprout className="h-3 w-3" />{result.currentCrop}</span>}
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{new Date(result.createdAt).toLocaleDateString()}</span>
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-700 mb-1">Disclaimer</p>
          <p>{result.disclaimer || 'Prototype AI estimate — not a laboratory soil test.'}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-50 py-2.5 text-xs font-bold text-green-700 hover:bg-green-100 transition border border-green-200">
            <Sprout className="h-4 w-4" /> Recommend Crop
          </button>
          <a href={`/farmer/intelligence`} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition border border-slate-200">
            <ChevronRight className="h-4 w-4" /> View Insights
          </a>
        </div>
      </div>
    </div>
  );
}

function SoilHistoryCard({ item }: { item: SoilAnalysisResult }) {
  const confColors: Record<string, string> = {
    HIGH: 'bg-green-100 text-green-700 border-green-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
    LOW: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:border-green-200 hover:-translate-y-0.5 transition cursor-default">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 font-mono">{item.sampleId}</span>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${confColors[item.confidenceLevel] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
          {item.confidenceLevel}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 shrink-0 rounded-xl bg-amber-100 flex items-center justify-center">
          <FlaskConical className="h-4 w-4 text-amber-600" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 truncate">{item.soilType}</h4>
      </div>
      {/* Confidence bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-3">
        <div
          className={`h-full rounded-full ${item.confidenceLevel === 'HIGH' ? 'bg-green-500' : item.confidenceLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-red-400'}`}
          style={{ width: `${item.confidence}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>{Math.round(item.confidence)}% confidence</span>
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
      {item.reviewRequired && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
          <AlertTriangle className="h-3 w-3" /> Review recommended
        </div>
      )}
    </div>
  );
}
