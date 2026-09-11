import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

interface FieldError { email?: string; password?: string; fullName?: string; phone?: string; }

function validate(isLogin: boolean, form: { email: string; password: string; fullName: string; phone: string }) {
  const errors: FieldError = {};
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email address';
  if (!form.password || form.password.length < 6)
    errors.password = 'Password must be at least 6 characters';
  if (!isLogin && !form.fullName.trim())
    errors.fullName = 'Full name is required';
  return errors;
}

export default function LoginPage() {
  const navigate       = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin]   = useState(true);
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState<FieldError>({});
  const [form, setForm]         = useState({ email: '', password: '', fullName: '', phone: '' });
  const [serverError, setServerError] = useState('');

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: undefined }));
    setServerError('');
  };

  const switchMode = (login: boolean) => {
    setIsLogin(login);
    setErrors({});
    setServerError('');
    setForm({ email: '', password: '', fullName: '', phone: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(isLogin, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerError('');
    try {
      if (isLogin) {
        await login(form.email.trim().toLowerCase(), form.password);
        toast.success('Welcome back!');
      } else {
        await register({ fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), password: form.password, phone: form.phone || undefined });
        toast.success('Account created!');
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        (err?.response?.status === 401 ? 'Invalid email or password.' : null) ??
        (err?.response?.status === 400 ? (err?.response?.data?.errors ? Object.values(err.response.data.errors).join('. ') : err?.response?.data?.message) : null) ??
        (!err?.response ? 'Cannot reach AGROBUS. Make sure the backend is running on port 8080.' : null) ??
        'Authentication failed. Please try again.';
      setServerError(msg);
    } finally { setLoading(false); }
  };

  return (
    <main className="auth-shell">
      {/* Brand panel */}
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-mark"><Sprout className="w-7 h-7" /></div>
          <p className="auth-kicker">AGRICULTURAL OPERATIONS PLATFORM</p>
          <h1>AGRO<span>BUS</span><span className="opacity-40">.</span></h1>
          <p className="auth-brand-copy">
            Connecting farmers, agents, and administrators for better agricultural credit management across Rwanda.
          </p>
          <div className="auth-proof-list">
            {[
              'Agricultural input credit lifecycle',
              'Farmer and agent field management',
              'Real-time inventory and repayment tracking',
            ].map(item => (
              <div key={item} className="auth-proof-item">
                <CheckCircle2 className="w-4 h-4 shrink-0" />{item}
              </div>
            ))}
          </div>
          <div className="auth-brand-footer">
            <span className="auth-footer-dot" /> Secure · Role-based · Agricultural
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="auth-form-panel">
        <div className="auth-form-wrap animate-fade-in">
          <div className="auth-form-header">
            <p className="auth-kicker">SECURE ACCOUNT ACCESS</p>
            <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
            <p className="mt-2 text-slate-500 text-sm">
              {isLogin ? 'Sign in to continue to your workspace.' : 'Set up your AGROBUS farmer account.'}
            </p>
          </div>

          {/* Mode switch */}
          <div className="auth-mode-switch" role="tablist">
            <button type="button" role="tab" aria-selected={isLogin}
              className={isLogin ? 'active' : ''} onClick={() => switchMode(true)}>
              Sign in
            </button>
            <button type="button" role="tab" aria-selected={!isLogin}
              className={!isLogin ? 'active' : ''} onClick={() => switchMode(false)}>
              Create account
            </button>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {!isLogin && (
              <div className="auth-form-grid">
                {/* Full name */}
                <div className={cn('auth-field', errors.fullName && 'auth-field-error')}>
                  <label htmlFor="fullName">Full name <span>*</span></label>
                  <div className="auth-input-wrap">
                    <User className="auth-input-icon" />
                    <input id="fullName" type="text" autoComplete="name" value={form.fullName}
                      onChange={f('fullName')} placeholder="Your full name" />
                  </div>
                  {errors.fullName && <p className="auth-field-msg">{errors.fullName}</p>}
                </div>
                {/* Phone */}
                <div className="auth-field">
                  <label htmlFor="phone">Phone <span className="opacity-50 text-xs font-normal">(optional)</span></label>
                  <div className="auth-input-wrap">
                    <Phone className="auth-input-icon" />
                    <input id="phone" type="tel" autoComplete="tel" value={form.phone}
                      onChange={f('phone')} placeholder="+250 7XX XXX XXX" />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div className={cn('auth-field', errors.email && 'auth-field-error')}>
              <label htmlFor="email">Email address <span>*</span></label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" />
                <input id="email" type="email" required autoComplete="email"
                  value={form.email} onChange={f('email')} placeholder="you@example.com" />
              </div>
              {errors.email && <p className="auth-field-msg">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className={cn('auth-field', errors.password && 'auth-field-error')}>
              <div className="auth-label-row">
                <label htmlFor="password">Password <span>*</span></label>
              </div>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" />
                <input id="password" type={showPwd ? 'text' : 'password'} required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={form.password} onChange={f('password')} placeholder="••••••••" />
                <button type="button" className="auth-password-toggle"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPwd(p => !p)}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="auth-field-msg">{errors.password}</p>}
              {!isLogin && (
                <p className="mt-1 text-xs text-slate-400">Must be at least 6 characters.</p>
              )}
            </div>

            <Button type="submit" loading={loading} className="w-full h-12 text-base rounded-xl shadow-lg shadow-green-600/20">
              {isLogin ? 'Sign in securely' : 'Create account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {isLogin && (
            <>
              <div className="auth-divider"><span>OR CONTINUE WITH</span></div>
              <button type="button"
                onClick={() => { window.location.href = '/oauth2/authorization/google'; }}
                className="auth-google-button">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          <p className="auth-legal mt-4 text-center text-xs text-slate-400">
            By continuing you agree to the AGROBUS terms and privacy policy.
          </p>
        </div>
      </section>
    </main>
  );
}
