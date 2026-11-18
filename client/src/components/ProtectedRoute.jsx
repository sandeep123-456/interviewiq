import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Jo pages sirf login ke baad dikhane hain, unhe is se lapet do:
//   <ProtectedRoute><NewInterview /></ProtectedRoute>
// NOTE: ye sirf UI ka suvidha hai. Asli suraksha backend me hai (requireAuth),
// kyunki koi bhi frontend ko bypass karke seedha API call kar sakta hai.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Token check ho raha hai: tab tak redirect mat karo, warna refresh par login pe bhej dega
  if (loading) {
    return <div className="px-4 py-24 text-center text-muted">Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  return children;
}