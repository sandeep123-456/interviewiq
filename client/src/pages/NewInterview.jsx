import { useEffect, useRef, useState } from 'react';
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

  // Resume
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState(''); // '' = resume ke bina
  const [uploading, setUploading] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const fileRef = useRef(null);

  const noCredits = user.creditBalance < 1;
  const selected = resumes.find((r) => r.id === resumeId);

  // Page khulte hi purani uploaded resumes lao
  useEffect(() => {
    api('/resumes')
      .then((d) => setResumes(d.resumes))
      .catch(() => {}); // list na aaye to bhi baaki page chalna chahiye
  }, []);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // wahi file dobara chunni ho to bhi chale
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setResumeError('Choose a PDF file.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setResumeError('File is too large. Maximum size is 3 MB.');
      return;
    }

    setResumeError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file); // field ka naam wahi jo backend me: upload.single('file')
      const data = await api('/resumes', { method: 'POST', body: form });
      setResumes((prev) => [data.resume, ...prev]);
      setResumeId(data.resume.id); // upload hote hi use select kar do
    } catch (err) {
      setResumeError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api(`/resumes/${id}`, { method: 'DELETE' });
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (resumeId === id) setResumeId('');
    } catch (err) {
      setResumeError(err.message);
    }
  }

  async function handleStart(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      // Backend AI se pehla question banata hai, isliye 10-40 second lag sakte hain
      const data = await api('/interviews', {
        method: 'POST',
        body: { role, type, difficulty, totalQuestions, ...(resumeId ? { resumeId } : {}) },
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

        {/* ===== Resume ===== */}
        <fieldset disabled={busy} className="rounded-2xl border border-line bg-paper p-4">
          <legend className="px-2 text-sm font-medium">Resume (optional)</legend>
          <p className="text-sm text-muted">
            Upload your resume and the questions will be about your own projects and skills.
          </p>

          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => setResumeId('')}
              aria-pressed={resumeId === ''}
              className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition ${
                resumeId === '' ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'
              }`}
            >
              No resume, general questions
            </button>

            {resumes.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResumeId(r.id)}
                  aria-pressed={resumeId === r.id}
                  className={`min-w-0 flex-1 truncate rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition ${
                    resumeId === r.id ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'
                  }`}
                >
                  {r.fileName}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="shrink-0 rounded-lg px-3 py-2 text-sm text-muted transition hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {selected && (
            <div className="mt-3 rounded-xl bg-chalk p-3 text-sm">
              <p>
                Found <strong>{selected.parsed.skills.length}</strong> skills and{' '}
                <strong>{selected.parsed.projects.length}</strong> projects:
              </p>
              <ul className="mt-1 list-disc pl-5 text-muted">
                {selected.parsed.projects.map((p) => (
                  <li key={p.name}>{p.name}</li>
                ))}
              </ul>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-3 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold transition hover:border-ink disabled:opacity-60"
          >
            {uploading ? 'Reading your resume...' : 'Upload a PDF resume'}
          </button>
          {uploading && (
            <p role="status" className="mt-2 text-sm text-muted">
              The AI is reading your resume. This can take up to 30 seconds.
            </p>
          )}
          {resumeError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {resumeError}
            </p>
          )}
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
          disabled={busy || uploading || noCredits}
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