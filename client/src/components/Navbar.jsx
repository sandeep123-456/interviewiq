import { Link } from 'react-router-dom';
import { Coins, User } from 'lucide-react';

// TODO (jab login frontend banega): ye real user se aayega.
// Abhi sirf demo ke liye hardcoded hai. Logged-out wala look dekhna ho to
// is line ko `const user = null;` kar do.
const user = { name: 'Sandeep', credits: 3 };

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-chalk/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-display text-sm font-bold text-white">
            IQ
          </span>
          <span className="font-display text-lg font-bold tracking-tight">InterviewIQ</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          <a href="/#how" className="hover:text-ink">How it works</a>
          <a href="/#features" className="hover:text-ink">Features</a>
          <a href="/#pricing" className="hover:text-ink">Pricing</a>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            {/* Credit chip: har interview shuru hone par 1 credit kat-ta hai */}
            <Link
              to="/credits"
              title="Your credits"
              className="flex items-center gap-1.5 rounded-full bg-marigold/20 px-3 py-1.5 text-sm font-semibold hover:bg-marigold/35"
            >
              <Coins size={16} className="text-marigold" />
              {user.credits}
            </Link>
            <Link
              to="/profile"
              aria-label="Profile"
              className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white"
            >
              <User size={16} />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-2 text-sm font-semibold hover:text-signal">
              Log in
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-signal"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}