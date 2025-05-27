import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibrywlgszctqthddiknt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicnl3bGdzemN0cXRoZGRpa250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODQsImV4cCI6MjA2MzY5Nzc4NH0.ENmovJ4olXKn2iHQnnsd3JjeAXWOvITQsiIsS8tHt6A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserConfigurations() {
  console.log('🔍 Verificando configurações de usuários...\n');
  
  // Verificar todas as configurações N8N
  const { data: configs, error: configError } = await supabase
    .from('n8n_configurations')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (configError) {
    console.error('❌ Erro ao buscar configurações:', configError.message);
    return;
  }
  
  console.log('📋 Configurações N8N encontradas:');
  console.table(configs);
  
  // Verificar perfis
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (profileError) {
    console.error('❌ Erro ao buscar perfis:', profileError.message);
    return;
  }
  
  console.log('\n👥 Perfis encontrados:');
  console.table(profiles);

  // Verificar se tabela user_credits existe
  console.log('\n💰 Verificando tabela user_credits...');
  const { data: credits, error: creditsError } = await supabase
    .from('user_credits')
    .select('*')
    .limit(5);
    
  if (creditsError) {
    console.error('❌ Erro ao acessar user_credits:', creditsError.message);
  } else {
    console.log('✅ Tabela user_credits existe');
    console.table(credits);
  }
}

checkUserConfigurations().catch(console.error);
