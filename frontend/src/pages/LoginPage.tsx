import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back to AGROBUS!');
      } else {
        await register(form);
        toast.success('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message
        || (err.response?.status === 401 ? 'Invalid email or password.' : null)
        || (!err.response ? 'Cannot reach AGROBUS. Start the backend on port 8080 and try again.' : null)
        || 'Authentication failed. Please check your details and try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-mark"><Sprout className="w-7 h-7" /></div>
          <p className="auth-kicker">AGRICULTURAL OPERATIONS</p>
          <h1>AGROBUS<span>.</span></h1>
          <p className="auth-brand-copy">
            One secure workspace for the people, products, and decisions that keep farms moving.
          </p>
          <div className="auth-proof-list">
            {['Input credit and inventory', 'Farmer and agent operations', 'Trusted access for every role'].map(item => (
              <div key={item} className="auth-proof-item"><CheckCircle2 className="w-4 h-4" />{item}</div>
            ))}
          </div>
          <div className="auth-brand-footer">
            <span className="auth-footer-dot" /> Built for reliable agricultural work
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap animate-fade-in">
          <div className="auth-mobile-brand">
            <div className="auth-brand-mark"><Sprout className="w-6 h-6" /></div>
            <span>AGROBUS<span>.</span></span>
          </div>

          <div className="auth-form-header">
            <p className="auth-kicker">SECURE ACCOUNT ACCESS</p>
            <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
            <p>{isLogin ? 'Sign in to continue to your operations workspace.' : 'Set up your AGROBUS workspace in a few steps.'}</p>
          </div>

          <div className="auth-mode-switch" role="tablist" aria-label="Account access mode">
            <button type="button" role="tab" aria-selected={isLogin} className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Sign in</button>
            <button type="button" role="tab" aria-selected={!isLogin} className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Create account</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="auth-form-grid">
                <div className="auth-field">
                  <label htmlFor="fullName">Full name</label>
                  <div className="auth-input-wrap"><User className="auth-input-icon" /><input id="fullName" type="text" required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="Your full name" /></div>
                </div>
                <div className="auth-field">
                  <label htmlFor="phone">Phone number <span>Optional</span></label>
                  <div className="auth-input-wrap"><Phone className="auth-input-icon" /><input id="phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+250 7XX XXX XXX" /></div>
                </div>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email">Work email</label>
              <div className="auth-input-wrap"><Mail className="auth-input-icon" /><input id="email" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@organisation.com" autoComplete="email" /></div>
            </div>
            <div className="auth-field">
              <div className="auth-label-row"><label htmlFor="password">Password</label>{isLogin && <button type="button" className="auth-text-button">Forgot password?</button>}</div>
              <div className="auth-input-wrap"><Lock className="auth-input-icon" /><input id="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Enter your password" autoComplete={isLogin ? 'current-password' : 'new-password'} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
            </div>

            <button type="submit" disabled={loading} className="auth-primary-button">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isLogin ? 'Sign in securely' : 'Create account'}<ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {isLogin && (
            <>
              <div className="auth-divider"><span>OR CONTINUE WITH</span></div>
              <button type="button" onClick={() => { window.location.href = '/oauth2/authorization/google'; }} className="auth-google-button">
                <span className="auth-google-g">G</span> Continue with Google
              </button>
            </>
          )}

          <div className="auth-security-note"><ShieldCheck className="w-4 h-4" /><span>Your connection is protected. AGROBUS never stores your Google password.</span></div>
          <p className="auth-legal">By continuing, you agree to the AGROBUS account terms and privacy policy.</p>
        </div>
      </section>
    </main>
  );
}
