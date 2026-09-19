'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Snowflake, Eye, EyeOff, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/40">
              <span className="text-white font-black text-xl">AG</span>
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-lg leading-tight">Al Ghawas A/C</div>
              <div className="text-amber-400 text-sm font-medium">Admin CRM</div>
            </div>
          </div>
          <p className="text-gray-400 text-sm">Refrigeration Contracting LLC · Abu Dhabi</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gray-900 px-8 py-5 flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-blue-400" />
            <h1 className="text-white font-semibold text-sm tracking-wide">Secure Admin Access</h1>
          </div>
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all"
                  type="email"
                  placeholder="admin@alghawasac.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all pr-12"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><LogIn className="w-4 h-4" /> Sign In to CRM</>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-5">
          Protected area — authorized personnel only
        </p>
      </div>
    </div>
  );
}
