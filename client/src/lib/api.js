// Backend (Express, port 4000) ko call karne ki ek hi jagah.
// Deploy ke baad VITE_API_URL se asli server ka address aa jayega.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'interviewiq_token';

// IMPORTANT (interview me ye bolna): token localStorage me rakha hai kyunki ye simple hai.
// Trade-off: agar kisi ne XSS se JavaScript chala di to wo token padh sakta hai.
// httpOnly cookie zyada safe hai, par uske liye backend me CSRF ka dhyan rakhna padta hai.
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // private window me localStorage band ho sakta hai, tab bhi app crash na ho
  }
}

// Use: const data = await api('/auth/login', { method: 'POST', body: { email, password } })
// File bhejni ho to body me FormData do (resume upload).
export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  let res;
  try {
    res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers: {
        // FormData me Content-Type browser khud lagata hai (boundary ke saath). Hum mat lagao.
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    // Network error: server band hai ya internet nahi
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // body JSON nahi thi, koi baat nahi
  }

  if (!res.ok) {
    const err = new Error(data?.error || 'Something went wrong');
    err.status = res.status; // 401 = login chahiye, 402 = credits nahi, 409 = conflict
    throw err;
  }
  return data;
}