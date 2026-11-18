import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Java Developer',
  'Python Developer',
  'Data Structures and Algorithms',
];

const TYPES = [
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'HR', label: 'HR' },
  { value: 'DSA', label: 'DSA' },
  { value: 'MIXED', label: 'Mixed' },
];

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const COUNTS = [
  { value: 3, label: '3 questions' },
  { value: 5, label: '5 questions' },
  { value: 10, label: '10 questions' },
];

// Ek baar likha, chaar jagah use hoga: type, difficulty, count wale button groups
function Segmented({ label, value, options, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              value === o.value
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-paper hover:border-ink'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function NewInterview() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('Backend Developer');
  const [type, setType] = useState('TECHNICAL');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const noCredits = user.creditBalance < 1;

  async function handleStart(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      // Backend AI se pehla question banata hai, isliye 10-40 second lag sakte hain
      const data = await api('/interviews', {
        method: 'POST',
        body: { role, type, difficulty, totalQuestions },
      });
      await refreshUser(); // 1 credit kat gaya, Navbar ka balance naya karo
      navigate(`/interview/${data.interview.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false); // success me busy true hi rehne do, kyunki hum dusre page pe ja rahe hain
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight">Set up your interview</h1>
      <p className="mt-2 text-muted">Choose what you want to practise. You can change it every time.</p>

      <form onSubmit={handleStart} className="mt-8 space-y-6">
        <div>
          <label htmlFor="role" className="mb-2 block text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={busy}
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:border-signal"
          >
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* fieldset disabled: busy hone par saare buttons ek saath band */}
        <fieldset disabled={busy} className="space-y-6">
          <Segmented label="Interview type" value={type} options={TYPES} onChange={setType} />
          <Segmented
            label="Starting difficulty"
            value={difficulty}
            options={DIFFICULTIES}
            onChange={setDifficulty}
          />
          <Segmented
            label="Length"
            value={totalQuestions}
            options={COUNTS}
            onChange={setTotalQuestions}
          />
        </fieldset>

        <div className="flex items-center gap-2 rounded-xl bg-marigold/15 px-4 py-3 text-sm">
          <Coins size={16} className="text-marigold" />
          <span>
            This uses 1 credit. You have <strong>{user.creditBalance}</strong>.
          </span>
        </div>

        {noCredits && (
          <p className="text-sm text-red-700">
            You are out of credits.{' '}
            <Link to="/credits" className="font-semibold underline">
              Get more credits
            </Link>
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || noCredits}
          className="w-full rounded-xl bg-signal px-6 py-3 font-semibold text-white transition hover:bg-ink disabled:opacity-60"
        >
          {busy ? 'Writing your first question...' : 'Start interview'}
        </button>

        {busy && (
          <p role="status" className="text-center text-sm text-muted">
            The AI is preparing your first question. This can take up to 40 seconds.
          </p>
        )}
      </form>
    </div>
  );
}