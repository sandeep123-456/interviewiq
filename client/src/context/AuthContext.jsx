import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from '../lib/api';

// Context = ek global dabba jisse koi bhi component "user" padh sakta hai,
// bina har component me props pass kiye.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // loading: app khulte hi token check ho raha hai. Tab tak "logged out" mat dikhao.
  const [loading, setLoading] = useState(true);

  // App khulte hi: token saved hai to /me se user wapas lao (refresh karne par login na jaye)
  useEffect(() => {
    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const data = await api('/auth/me');
        setUser(data.user);
      } catch {
        setToken(null); // token purana ya galat tha
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  async function login(email, password) {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    setToken(data.token);
    setUser(data.user);
  }

  async function register(name, email, password) {
    const data = await api('/auth/register', { method: 'POST', body: { name, email, password } });
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  // Interview ke baad credits badal jate hain, tab ye chalake navbar ka balance naya karenge
  const refreshUser = useCallback(async () => {
    const data = await api('/auth/me');
    setUser(data.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Use: const { user, login, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}