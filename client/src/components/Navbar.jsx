import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  // Ab hardcoded user nahi, asli logged-in user AuthContext se aata hai
  const { user, loading, logout } = useAuth();

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

        {/* loading: token check ho raha hai, tab tak right side khali (flicker nahi hota) */}
        {loading ? (
          <div className="h-9 w-24" />
        ) : user ? (
          <div className="flex items-center gap-3">
            {/* Credit chip: har interview shuru hone par 1 credit kat-ta hai */}
            <Link
              to="/credits"
              title="Your credits"
              className="flex items-center gap-1.5 rounded-full bg-marigold/20 px-3 py-1.5 text-sm font-semibold hover:bg-marigold/35"
            >
              <Coins size={16} className="text-marigold" />
              {user.creditBalance}
            </Link>
            <Link
              to="/history"
              className="hidden text-sm font-medium text-muted hover:text-ink sm:block"
            >
              History
            </Link>
            <button
              onClick={logout}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-ink"
            >
              Log out
            </button>
            <span
              title={user.name}
              className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-semibold text-white"
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
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