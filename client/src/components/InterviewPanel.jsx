import { Mic } from 'lucide-react';

// Waveform ki har bar ki height (percent). Ye sirf sajaawat hai, asli audio nahi.
const WAVE = [40, 70, 55, 90, 60, 35, 80, 50, 95, 65, 45, 75, 30, 85, 55, 70, 40, 90, 60, 35, 80, 50, 65, 45];

const SCORES = [
  { label: 'Correctness', value: 82, color: 'bg-mint' },
  { label: 'Clarity', value: 70, color: 'bg-signal' },
  { label: 'Depth', value: 55, color: 'bg-marigold' },
];

// Ye ek "demo" hai jo dikhata hai ki product kaisa kaam karta hai.
// Asli interview screen alag banegi, ye bas landing page ke liye hai.
export default function InterviewPanel() {
  return (
    <div
      role="group"
      aria-label="Example of an interview session"
      className="rounded-3xl bg-ink p-5 text-white shadow-2xl shadow-ink/25 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1">Backend Developer</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Level 4</span>
        </div>
        <span className="text-white/60">Question 3 of 10</span>
      </div>

      {/* AI ka question */}
      <p className="mt-5 rounded-2xl rounded-tl-sm bg-white/10 p-4 leading-relaxed">
        Your project uses JWT for login. What can go wrong if someone steals the token?
      </p>

      {/* User ka answer (bolke diya) */}
      <div className="ml-8 mt-3 rounded-2xl rounded-tr-sm bg-signal p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-signal">
            <Mic size={18} />
          </span>
          <div className="flex h-9 flex-1 items-center gap-[3px]" aria-hidden="true">
            {WAVE.map((h, i) => (
              <span
                key={i}
                className="wave-bar w-[3px] rounded-full bg-white/90"
                style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/90">
          I'd keep the expiry short and store it in an httpOnly cookie, so JavaScript can't read it...
        </p>
      </div>

      {/* Score card */}
      <div className="mt-4 rounded-2xl bg-white p-4 text-ink">
        <div className="flex items-end justify-between gap-4">
          <p className="font-display text-4xl font-bold leading-none">
            7.5<span className="text-lg font-medium text-muted">/10</span>
          </p>
          <p className="max-w-[14rem] text-right text-sm text-muted">
            Mention refresh tokens so a stolen token can be revoked.
          </p>
        </div>

        <div className="mt-4 space-y-2.5">
          {SCORES.map((s) => (
            <div key={s.label} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 text-sm">
              <span className="text-muted">{s.label}</span>
              <span className="h-2 overflow-hidden rounded-full bg-chalk">
                <span
                  className={`bar-fill block h-full rounded-full ${s.color}`}
                  style={{ width: `${s.value}%` }}
                />
              </span>
              <span className="text-right font-semibold">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}