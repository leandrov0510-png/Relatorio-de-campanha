process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function testSelect() {
  const { data, error } = await supabase.from('campaign_users').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('SELECT ERROR:', error);
  } else {
    console.log('SELECT SUCCESS. Total Rows:', data ? data.length : 0);
    console.log('Rows:', data);
  }
}

testSelect();
