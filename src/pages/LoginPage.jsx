import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { APP_NAME, APP_TAGLINE } from '../utils/constants';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@fincorp.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password, rememberMe);
    if (!res.success) {
      setErrorMsg(res.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B132B] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-950 dark:bg-accent text-white font-black text-2xl shadow-md mb-4">
          F
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {APP_NAME}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {APP_TAGLINE}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-navy-800 py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-slate-200/80 dark:border-slate-800">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900/60 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-700 dark:focus:ring-accent"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900/60 py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-700 dark:focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-navy-800 focus:ring-navy-700 dark:text-accent border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Ingat saya</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full shadow-md"
              icon={ArrowRight}
            >
              Masuk ke Dashboard
            </Button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700/60 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-navy-900 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Demo: demo@fincorp.id / password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

