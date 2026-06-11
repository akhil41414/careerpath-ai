// lib/auth.js
// JWT (JSON Web Token) is how we verify "is this user logged in?" on every API call.
// When user logs in → server creates a token → frontend stores it → sends it with every request.
// Server checks the token to know who the user is without hitting the database every time.
// JWT_SECRET is a random string you set in Vercel env vars. Keep it secret.

const crypto = require('crypto');

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Create a JWT token for a user after login/signup
function createToken(payload) {
  const header  = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body    = base64url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  const sig     = crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret-change-this')
    .update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

// Verify a JWT token — returns payload or throws
function verifyToken(token) {
  const [header, body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', process.env.JWT_SECRET || 'fallback-secret-change-this')
    .update(`${header}.${body}`).digest('base64url');
  if (sig !== expected) throw new Error('Invalid token');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (payload.exp < Date.now()) throw new Error('Token expired');
  return payload;
}

// Middleware — extract user from Authorization header
function getUser(req) {
  const auth  = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) throw new Error('No token');
  return verifyToken(token);
}

module.exports = { createToken, verifyToken, getUser };
