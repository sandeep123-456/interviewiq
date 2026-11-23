import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import NewInterview from './pages/NewInterview';
import Interview from './pages/Interview';
import History from './pages/History';

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
          <Route path="/login" element={<Login />} />
          <Route
            path="/interview/new"
            element={
              <ProtectedRoute>
                <NewInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/:id"
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route path="/credits" element={<Placeholder title="Buy credits" />} />
        </Routes>
      </main>
      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        © 2026 InterviewIQ
      </footer>
    </>
  );
}