import { Link } from 'react-router-dom';
import InterviewPanel from './InterviewPanel';

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 md:grid-cols-[1.05fr_1fr] md:pt-20">
      <div>
        <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-6xl">
          Practice the interview before it counts.
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
          Pick a role, answer out loud, and get a score on every answer. The questions get harder as
          you get better.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/interview/new"
            className="rounded-xl bg-signal px-6 py-3 font-semibold text-white transition hover:bg-ink"
          >
            Start an interview
          </Link>
          <Link
            to="/history"
            className="rounded-xl border border-line bg-paper px-6 py-3 font-semibold transition hover:border-ink"
          >
            See past interviews
          </Link>
        </div>
        <p className="mt-5 text-sm text-muted">3 free interviews when you sign up. No card needed.</p>
      </div>

      <InterviewPanel />
    </section>
  );
}