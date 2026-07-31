process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || 'https://becijhlpbnuuaiyrlkcg.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlY2lqaGxwYm51dWFpeXJsa2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNzI5NDMsImV4cCI6MjEwMDk0ODk0M30.pg1Ex3hfpo2D6g1ZotlBITFSC5JO2LcaOHfn5cknfDM';

const supabase = createClient(url, key);

async function testInsert() {
  const newUser = {
    id: `USR-TEST-${Date.now()}`,
    full_name: 'Teste de Cadastro Multidispositivo',
    role: 'Divulgador',
    coordinator_name: 'Coordenador Teste',
    deputado_estadual: 'Deputado Teste',
    social_media: '@teste',
    pix_key: 'pix@teste.com',
    whatsapp: '(11) 99999-8888',
    address: 'Rua Teste, 123 - São Paulo / SP',
    electoral_zone: '176',
    registered_by: 'Próprio',
    registration_type: 'PROPRIO',
    ip_address: '189.0.0.1',
    status: 'PENDENTE',
    documents: {},
    updated_at: new Date().toISOString()
  };

  console.log('Inserindo usuario de teste no Supabase...');
  const { data, error } = await supabase.from('campaign_users').upsert(newUser).select();
  if (error) {
    console.error('INSERT ERROR:', error);
  } else {
    console.log('INSERT SUCCESS:', data);
  }

  const { data: allData, error: selectErr } = await supabase.from('campaign_users').select('*');
  console.log('Total registros no Supabase:', allData ? allData.length : 0);
}

testInsert();
