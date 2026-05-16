import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '', role: 'ADMIN'
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
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-green items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 text-white max-w-lg">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
            <Sprout className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black mb-4 leading-tight">
            AGROBUS
          </h1>
          <p className="text-xl font-light text-white/90 mb-6 leading-relaxed">
            Agricultural Input Credit Platform
          </p>
          <p className="text-white/70 text-sm leading-relaxed mb-10">
            Empowering smallholder farmers with access to quality agricultural inputs through 
            innovative USSD-based credit solutions. No cash loans — just the farming supplies you need.
          </p>
          
          <div className="space-y-4">
            {[
              { num: '2,500+', label: 'Farmers Registered' },
              { num: '95%', label: 'Repayment Rate' },
              { num: '12', label: 'Districts Covered' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-black">{stat.num}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Floating shapes */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -top-10 -left-10 w-60 h-60 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-10 w-20 h-20 bg-white/10 rounded-2xl rotate-12" />
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 gradient-green rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-green-700">AGROBUS</h1>
            <p className="text-gray-500 text-sm">Agricultural Input Credit Platform</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-green-900/5 border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {isLogin ? 'Sign in to your AGROBUS account' : 'Join the AGROBUS platform'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={form.fullName}
                        onChange={e => setForm({...form, fullName: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm transition-all bg-gray-50 focus:bg-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm transition-all bg-gray-50 focus:bg-white"
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                    <select
                      value={form.role}
                      onChange={e => setForm({...form, role: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all bg-gray-50 focus:bg-white"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="AGENT">Agricultural Agent</option>
                      <option value="FARMER">Farmer</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm transition-all bg-gray-50 focus:bg-white"
                    placeholder="admin@agrobus.rw"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 text-sm transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-green text-white py-3.5 rounded-xl font-semibold text-sm
                  flex items-center justify-center gap-2 shadow-lg shadow-green-500/25
                  hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300
                  disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-green-600 font-semibold hover:text-green-700 transition-colors"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 AGROBUS. Agricultural Input Credit Platform.
          </p>
        </div>
      </div>
    </div>
  );
}
