// api/analytics.js (Optional analytics tracking)
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success:false, message:'Method not allowed' });

  try {
    const { event_type, event_data } = req.body || {};
    
    // Simple validation
    if (!event_type || typeof event_type !== 'string') {
      return res.status(400).json({ success:false, message:'Invalid event_type' });
    }

    // Init Supabase with service role (server-side only)
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // Create analytics table if it doesn't exist (optional)
    // You can create this table in Supabase:
    /*
    create table if not exists public.analytics (
      id uuid primary key default gen_random_uuid(),
      event_type text not null,
      event_data jsonb,
      ip text,
      ua text,
      created_at timestamptz not null default now()
    );
    */

    // Store analytics event
    const { error } = await supabase
      .from('analytics')
      .insert({
        event_type: String(event_type).trim(),
        event_data: event_data || null,
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
        ua: req.headers['user-agent'] || null
      });

    if (error) {
      console.error('Analytics insert failed', error);
      // Don't return error to client - analytics shouldn't break user flow
    }

    return res.status(200).json({ success:true });
  } catch (e) {
    console.error('Analytics error:', e);
    // Return success even on error - analytics failures shouldn't affect user
    return res.status(200).json({ success:true });
  }
}