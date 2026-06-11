// lib/supabase.js
// Supabase is a free PostgreSQL database with a REST API.
// SUPABASE_URL and SUPABASE_SERVICE_KEY come from Vercel environment variables.
// The service key has admin access — never expose it on the frontend.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;
