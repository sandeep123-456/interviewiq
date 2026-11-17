import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';

// Ye prices abhi placeholder hain, apni marzi se badal sakte ho.
// Asli paisa Razorpay se aayega (aage ke step me).
const PLANS = [
  {
    name: 'Free start',
    credits: 3,
    price: 'Free',
    note: 'Added when you sign up',
    cta: 'Create account',
    to: '/login',
    featured: false,
  },
  {
    name: 'Practice pack',
    credits: 10,
    price: '₹149',
    note: 'About ₹15 per interview',
    cta: 'Buy 10 credits',
    to: '/credits',
    featured: true,
  },
  {
    name: 'Placement season',
    credits: 25,
    price: '₹299',
    note: 'About ₹12 per interview',
    cta: 'Buy 25 credits',
    to: '/credits',
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        Pay for interviews, not subscriptions
      </h2>
      <p className="mt-3 max-w-md text-muted">One credit is one interview.</p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-3xl p-6 ${
              p.featured ? 'bg-ink text-white' : 'border border-line bg-paper'
            }`}
          >
            <h3 className="font-display text-xl font-bold">{p.name}</h3>

            <p className="mt-6 flex items-center gap-2">
              <Coins size={22} className="text-marigold" />
              <span className="font-display text-5xl font-bold leading-none">{p.credits}</span>
              <span className={p.featured ? 'text-white/70' : 'text-muted'}>credits</span>
            </p>

            <p className="mt-4 font-display text-2xl font-bold">{p.price}</p>
            <p className={`mt-1 text-sm ${p.featured ? 'text-white/70' : 'text-muted'}`}>{p.note}</p>

            <Link
              to={p.to}
              className={`mt-8 rounded-xl px-5 py-3 text-center font-semibold transition ${
                p.featured
                  ? 'bg-marigold text-ink hover:bg-white'
                  : 'bg-ink text-white hover:bg-signal'
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}