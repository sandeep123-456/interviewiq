const jwt = require('jsonwebtoken');

// Protected routes ka guard.
//
// Frontend har request me header bhejega:  Authorization: Bearer <token>
// Token sahi hai to req.user me { userId, role } lag jata hai.
//
// IMPORTANT: aage har query me req.user.userId use hoga, taaki ek user
// dusre user ka interview, resume ya credits kabhi na dekh paaye.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Login required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role };
    next(); // sab sahi hai, aage route chalao
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Sirf admin ke liye. requireAuth ke BAAD lagana.
function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admins only' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };