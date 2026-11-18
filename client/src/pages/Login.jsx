import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputClass =
  'w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none transition focus:border-signal';

export default function Login() {
  const { user, loading, login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' ya 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Pehle se logged in hai to login page dikhane ka matlab nahi
  if (!loading && user) return <Navigate to="/interview/new" replace />;

  const isLogin = mode === 'login';

  async function handleSubmit(e) {
    e.preventDefault(); // page reload hone se roko
    setError('');
    setBusy(true);
    try {
      if (isLogin) await login(email, password);
      else await register(name, email, password);
      // Success: user set ho gaya, upar wala <Navigate> apne aap redirect kar dega
    } catch (err) {
      setError(err.message); // backend ka message dikhao, jaise "Wrong email or password"
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {isLogin ? 'Welcome back' : 'Create your account'}
      </h1>
      <p className="mt-2 text-muted">
        {isLogin ? 'Log in to continue your practice.' : '3 free interviews, no card needed.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              minLength={2}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
            minLength={6}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-signal px-6 py-3 font-semibold text-white transition hover:bg-ink disabled:opacity-60"
        >
          {busy ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {isLogin ? 'New here? ' : 'Already have an account? '}
        <button
          type="button"
          onClick={() => {
            setMode(isLogin ? 'register' : 'login');
            setError('');
          }}
          className="font-semibold text-signal hover:underline"
        >
          {isLogin ? 'Create an account' : 'Log in'}
        </button>
      </p>
    </div>
  );
}