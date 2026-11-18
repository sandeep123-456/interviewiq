import { ArrowUp, Check } from 'lucide-react';

const BARS = [
  { key: 'correctness', label: 'Correctness', color: 'bg-mint' },
  { key: 'clarity', label: 'Clarity', color: 'bg-signal' },
  { key: 'depth', label: 'Depth', color: 'bg-marigold' },
];

// score: 0-10. feedback: { correctness, clarity, depth, strengths[], improvements[], idealAnswer }
export default function FeedbackCard({ score, feedback }) {
  const f = feedback || {};

  return (
    <div className="rounded-3xl border border-line bg-paper p-6">
      <p className="font-display text-5xl font-bold leading-none">
        {score}
        <span className="text-xl font-medium text-muted">/10</span>
      </p>

      <div className="mt-6 space-y-2.5">
        {BARS.map((b) => {
          const v = Number(f[b.key] ?? 0);
          return (
            <div key={b.key} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3 text-sm">
              <span className="text-muted">{b.label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-chalk">
                <span
                  className={`bar-fill block h-full rounded-full ${b.color}`}
                  style={{ width: `${v * 10}%` }}
                />
              </span>
              <span className="text-right font-semibold">{v}</span>
            </div>
          );
        })}
      </div>

      {f.strengths?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold">What worked</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            {f.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-mint" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {f.improvements?.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold">To improve</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            {f.improvements.map((s) => (
              <li key={s} className="flex gap-2">
                <ArrowUp size={16} className="mt-0.5 shrink-0 text-signal" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {f.idealAnswer && (
        <details className="mt-6 rounded-xl bg-chalk p-4">
          <summary className="cursor-pointer text-sm font-semibold">Model answer</summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{f.idealAnswer}</p>
        </details>
      )}
    </div>
  );
}