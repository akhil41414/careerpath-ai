// lib/cors.js
// Vercel Node.js requires setting CORS headers one by one using res.setHeader()
// NOT res.setHeaders() with an object — that causes ERR_INVALID_ARG_TYPE

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
}

function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.status(200).end();
    return true;
  }
  return false;
}

module.exports = { setCors, handleOptions };
