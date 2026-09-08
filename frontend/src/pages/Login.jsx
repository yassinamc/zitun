import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OliveLogo } from '../components/illustrations/AgriculturalIcons';

const demos = [
  { label: 'مول المعصرة', email: 'owner@atlas.local', password: 'ChangeMe123!' },
  { label: 'عامل القبان', email: 'employee@atlas.local', password: 'ChangeMe123!' },
  { label: 'معصرة أخرى (فاس)', email: 'owner@fes.local', password: 'ChangeMe123!' },
];

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('owner@atlas.local');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل الدخول');
    }
  }

  async function quickLogin(demo) {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
    try {
      await login(demo.email, demo.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل الدخول');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #5f7b46 0%, transparent 40%), radial-gradient(circle at 80% 70%, #d49312 0%, transparent 35%)',
        }}
      />
      <div className="card-orchard w-full max-w-md relative z-10 shadow-2xl">
        <div className="flex flex-col items-center gap-2 mb-6">
          <OliveLogo className="w-20 h-20" />
          <h1 className="text-3xl font-extrabold text-gold-400">OliveFlow</h1>
          <p className="text-olive-500 text-center">تسيير المعصرة ديالك بسهولة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-olive-500">الإيميل</label>
            <input
              className="touch-input text-base!"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-olive-500">كلمة السر</label>
            <input
              className="touch-input text-base!"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-300 bg-red-950/40 border border-red-800/50 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '...' : 'دخول'}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <p className="text-xs text-olive-500 text-center mb-2">دخول سريع للتجربة</p>
          {demos.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => quickLogin(demo)}
              className="w-full py-2.5 rounded-xl border border-olive-700/60 hover:border-gold-500/60 text-sm font-semibold"
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
