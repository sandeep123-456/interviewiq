import { Check, Code, FileText, Gauge, Mic, TrendingUp } from 'lucide-react';

const SKILLS = ['React', 'Node.js', 'PostgreSQL', 'JWT', 'Razorpay'];

const CODE = `function twoSum(nums, target) {
  const seen = new Map();
  // ...
}`;

const TOPICS = [
  { name: 'DBMS', value: 45, color: 'bg-coral' },
  { name: 'OOPs', value: 62, color: 'bg-marigold' },
  { name: 'React', value: 78, color: 'bg-mint' },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        Built for the way interviews actually go
      </h2>

      {/* 6 columns ka grid: upar wale 2 cards 3-3, neeche wale 3 cards 2-2 lete hain */}
      <div className="mt-10 grid gap-4 md:grid-cols-6">
        {/* Resume based */}
        <article className="rounded-3xl border border-line bg-paper p-6 md:col-span-3">
          <FileText className="text-signal" size={22} />
          <h3 className="mt-4 font-display text-xl font-bold">Questions about your own projects</h3>
          <p className="mt-2 max-w-md text-muted">
            Upload your resume and the questions come from it: the stack you listed, the project you
            built, the choices you made.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <span key={s} className="rounded-full bg-chalk px-3 py-1 text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-4 border-l-2 border-signal pl-3 text-sm text-muted">
            Why did you store credits as a ledger instead of one balance column?
          </p>
        </article>

        {/* Voice */}
        <article className="rounded-3xl border border-line bg-paper p-6 md:col-span-3">
          <Mic className="text-signal" size={22} />
          <h3 className="mt-4 font-display text-xl font-bold">Answer out loud</h3>
          <p className="mt-2 max-w-md text-muted">
            Speaking is a different skill from typing. Practise it before the real round.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {[
              'The question is read aloud',
              'Your answer is transcribed as you speak',
              'Fix the transcript before it is scored',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check size={16} className="text-mint" />
                {t}
              </li>
            ))}
          </ul>
        </article>

        {/* Adaptive difficulty */}
        <article className="rounded-2xl border border-line bg-paper p-6 md:col-span-2">
          <Gauge className="text-signal" size={22} />
          <h3 className="mt-4 font-display text-lg font-bold">Gets harder as you improve</h3>
          <p className="mt-2 text-sm text-muted">
            Score well and the next question is tougher. Struggle and it eases off, like a real
            interviewer would.
          </p>
          <div className="mt-5 flex gap-1" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className={`h-8 flex-1 rounded-sm ${i < 6 ? 'bg-signal' : 'bg-line'}`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Level 6 of 10</p>
        </article>

        {/* Coding round: ye card dark hai, taaki page me rhythm bane */}
        <article className="rounded-2xl bg-ink p-6 text-white md:col-span-2">
          <Code className="text-marigold" size={22} />
          <h3 className="mt-4 font-display text-lg font-bold">Write code and run it</h3>
          <p className="mt-2 text-sm text-white/70">
            Solve a problem in the editor, run it against test cases, and get a review of your
            approach.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-white/10 p-3 text-xs leading-relaxed text-white/85">
            {CODE}
          </pre>
          <p className="mt-3 inline-block rounded-full bg-marigold px-3 py-1 text-xs font-semibold text-ink">
            3 of 4 tests passed
          </p>
        </article>

        {/* Weak topics */}
        <article className="rounded-2xl border border-line bg-paper p-6 md:col-span-2">
          <TrendingUp className="text-signal" size={22} />
          <h3 className="mt-4 font-display text-lg font-bold">See what to fix next</h3>
          <p className="mt-2 text-sm text-muted">
            Your lowest topic becomes the start of your next interview.
          </p>
          <div className="mt-5 space-y-2.5">
            {TOPICS.map((t) => (
              <div key={t.name} className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="text-muted">{t.name}</span>
                <span className="h-2 overflow-hidden rounded-full bg-chalk">
                  <span
                    className={`block h-full rounded-full ${t.color}`}
                    style={{ width: `${t.value}%` }}
                  />
                </span>
                <span className="text-right font-semibold">{t.value}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}