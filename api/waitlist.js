const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  console.log('API function called');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Request body:', req.body);
    
    const { insuranceType, issue, email } = req.body || {};
    
    if (!insuranceType || !issue || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const hasSupabaseUrl = !!process.env.SUPABASE_URL;
    const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Environment variables check:', { hasSupabaseUrl, hasSupabaseKey });

    if (!hasSupabaseUrl || !hasSupabaseKey) {
      return res.status(500).json({ success: false, message: 'Server misconfiguration: missing Supabase env vars' });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    const userAgent = req.headers['user-agent'] || null;
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;

    const { error } = await supabase
      .from('insurance_submissions')
      .insert({
        insurance_type: String(insuranceType).trim(),
        issue: String(issue).trim(),
        email: String(email).trim().toLowerCase(),
        ua: userAgent,
        ip
      });

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ success: false, message: 'Failed to save your submission. Please try again.' });
    }

    return res.status(200).json({ 
      success: true,
      message: "Thanks! Your case has been submitted. We will be in touch within 24 hours.",
    });

  } catch (e) {
    console.error('Error:', e);
    return res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
}