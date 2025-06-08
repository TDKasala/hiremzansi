import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (supabase) {
      try {
        await supabase
          .from('newsletter_subscriptions')
          .insert([{ email, created_at: new Date().toISOString() }]);
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter'
    });

  } catch (error) {
    console.error('Newsletter error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}