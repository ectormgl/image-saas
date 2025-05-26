#!/usr/bin/env node

// Script de teste para verificar o processo de signup
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibrywlgszctqthddiknt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicnl3bGdzemN0cXRoZGRpa250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODQsImV4cCI6MjA2MzY5Nzc4NH0.ENmovJ4olXKn2iHQnnsd3JjeAXWOvITQsiIsS8tHt6A';

console.log('🔧 Configurações:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.slice(0, 20)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'test123456';
  const testName = 'Usuario Teste';
  
  console.log(`\n🧪 Testando signup com:`);
  console.log(`Email: ${testEmail}`);
  console.log(`Nome: ${testName}`);
  
  try {
    // Tentar criar conta
    console.log('\n📝 Criando conta...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
        },
      },
    });

    if (error) {
      console.error('❌ Erro no signup:', error.message);
      return;
    }

    console.log('✅ Signup bem-sucedido!');
    console.log('User ID:', data.user?.id);
    console.log('Email confirmado:', data.user?.email_confirmed_at ? 'Sim' : 'Não');
    
    // Aguardar um pouco para os triggers executarem
    console.log('\n⏳ Aguardando triggers do banco...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se o perfil foi criado
    console.log('\n🔍 Verificando criação do perfil...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
    } else {
      console.log('✅ Perfil criado:', {
        id: profile.id,
        name: profile.name,
        email: profile.email
      });
    }
    
    // Verificar se a configuração N8N foi criada
    console.log('\n🔍 Verificando configuração N8N...');
    const { data: n8nConfig, error: n8nError } = await supabase
      .from('n8n_configurations')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
      
    if (n8nError) {
      console.error('❌ Erro ao buscar configuração N8N:', n8nError.message);
    } else {
      console.log('✅ Configuração N8N criada:', {
        user_id: n8nConfig.user_id,
        workflow_id: n8nConfig.workflow_id,
        n8n_base_url: n8nConfig.n8n_base_url,
        is_active: n8nConfig.is_active
      });
    }
    
    // Verificar créditos
    console.log('\n🔍 Verificando créditos iniciais...');
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
      
    if (creditsError) {
      console.error('❌ Erro ao buscar créditos:', creditsError.message);
    } else {
      console.log('✅ Créditos criados:', {
        user_id: credits.user_id,
        credits: credits.credits
      });
    }
    
  } catch (error) {
    console.error('❌ Exceção:', error.message);
  }
}

testSignup().then(() => {
  console.log('\n🏁 Teste concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
