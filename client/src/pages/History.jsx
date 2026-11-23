import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Score ke hisaab se rang: achha = mint, theek = marigold, kamzor = coral
function barColor(v) {
  if (v >= 7) return 'bg-mint';
  if (v >= 5) return 'bg-marigold';
  return 'bg-coral';
}

const TYPE_LABEL = { TECHNICAL: 'Technical', HR: 'HR', DSA: 'DSA', MIXED: 'Mixed' };
const LEVEL_LABEL = { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' };

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        // Promise.all: 3 API ek saath bulao, ek ke baad ek nahi. Isse page jaldi khulta hai.
        const [list, sum, top] = await Promise.all([
          api('/interviews'),
          api('/stats/summary'),
          api('/stats/topics'),
        ]);
        setInterviews(list.interviews);
        setSummary(sum);
        setTopics(top.topics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="px-4 py-24 text-center text-muted">Loading...</div>;
  if (error) return <div className="px-4 py-24 text-center text-red-700">{error}</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">Your progress</h1>
        <Link
          to="/interview/new"
          className="rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink"
        >
          Start an interview
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-line bg-paper p-10 text-center">
          <p className="font-display text-xl font-bold">No interviews yet</p>
          <p className="mt-2 text-muted">Your first one takes about five minutes.</p>
        </div>
      ) : (
        <>
          {/* Upar ke 3 numbers */}
          <div className="mt-8 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-paper">
            {[
              { label: 'Completed', value: summary.completedInterviews },
              { label: 'Average score', value: summary.averageScore ?? '-' },
              { label: 'Best score', value: summary.bestScore ?? '-' },
            ].map((s) => (
              <div key={s.label} className="p-5">
                <p className="font-display text-3xl font-bold leading-none">{s.value}</p>
                <p className="mt-2 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Kamzor topics (backend se pehle se kamzor-pehle order me aate hain) */}
          {topics.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-xl font-bold">Where to focus</h2>
              <p className="mt-1 text-sm text-muted">Your lowest scoring topics come first.</p>
              <div className="mt-4 space-y-3">
                {topics.slice(0, 6).map((t) => (
                  <div
                    key={t.topic}
                    className="grid grid-cols-[1fr_8rem_2.5rem] items-center gap-3 text-sm sm:grid-cols-[14rem_1fr_2.5rem]"
                  >
                    <span className="truncate">{t.topic}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-line">
                      <span
                        className={`block h-full rounded-full ${barColor(t.avgScore)}`}
                        style={{ width: `${t.avgScore * 10}%` }}
                      />
                    </span>
                    <span className="text-right font-semibold">{t.avgScore}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Saare interviews ki list */}
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold">All interviews</h2>
            <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-paper">
              {interviews.map((i) => (
                <li key={i.id}>
                  <Link
                    to={`/interview/${i.id}`}
                    className="flex items-center justify-between gap-4 p-4 transition hover:bg-chalk"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{i.role}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {TYPE_LABEL[i.type]}, {LEVEL_LABEL[i.difficulty]}, {i.totalQuestions} questions,{' '}
                        {formatDate(i.startedAt)}
                      </p>
                    </div>
                    {i.status === 'COMPLETED' ? (
                      <span className="shrink-0 font-display text-2xl font-bold">
                        {i.overallScore ?? '-'}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-marigold/25 px-3 py-1 text-xs font-semibold">
                        Continue
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}