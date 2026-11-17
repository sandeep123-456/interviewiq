import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

// Jo pages abhi nahi bane unke liye temporary page, taaki buttons 404 na dein.
function Placeholder({ title }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-muted">This page is built in a later step.</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Placeholder title="Log in" />} />
          <Route path="/interview/new" element={<Placeholder title="Start an interview" />} />
          <Route path="/history" element={<Placeholder title="Past interviews" />} />
          <Route path="/credits" element={<Placeholder title="Buy credits" />} />
          <Route path="/profile" element={<Placeholder title="Profile" />} />
        </Routes>
      </main>
      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        © 2026 InterviewIQ
      </footer>
    </>
  );
}