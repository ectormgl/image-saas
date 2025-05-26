// Testar signup após correção da função handle_new_user
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ibrywlgszctqthddiknt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlidnlsd2dzemN0cXRoZGRpa250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MDQ5NzcsImV4cCI6MjA1Mjk4MDk3N30.bv2YQv1FbFQ0O5wWJTjIJDk6_EpfYllUo8y8MUU8yp8'
);

async function testSignup() {
  const timestamp = Date.now();
  const testEmail = `test-${timestamp}@example.com`;
  const testPassword = 'testpassword123';
  const testName = 'Usuario Teste Fixed';

  console.log('🧪 Testando signup após correção...');
  console.log(`Email: ${testEmail}`);
  console.log(`Nome: ${testName}`);

  try {
    // 1. Tentar criar conta
    console.log('\n📝 Criando conta...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName
        }
      }
    });

    if (error) {
      console.error('❌ Erro no signup:', error.message);
      return;
    }

    console.log('✅ Conta criada com sucesso!');
    console.log('User ID:', data.user?.id);

    // 2. Aguardar um pouco para triggers processarem
    console.log('\n⏳ Aguardando processamento dos triggers...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Verificar se perfil foi criado
    console.log('\n🔍 Verificando perfil criado...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id);

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
    } else if (profileData && profileData.length > 0) {
      console.log('✅ Perfil encontrado:', profileData[0]);
    } else {
      console.log('❌ Perfil não encontrado');
    }

    // 4. Verificar se configuração N8N foi criada
    console.log('\n🔍 Verificando configuração N8N...');
    const { data: n8nData, error: n8nError } = await supabase
      .from('n8n_configurations')
      .select('*')
      .eq('user_id', data.user?.id);

    if (n8nError) {
      console.error('❌ Erro ao buscar configuração N8N:', n8nError.message);
    } else if (n8nData && n8nData.length > 0) {
      console.log('✅ Configuração N8N encontrada:', n8nData[0]);
    } else {
      console.log('❌ Configuração N8N não encontrada');
    }

    // 5. Verificar templates disponíveis
    console.log('\n🔍 Verificando templates N8N disponíveis...');
    const { data: templatesData, error: templatesError } = await supabase
      .from('n8n_workflow_templates')
      .select('*')
      .eq('is_active', true);

    if (templatesError) {
      console.error('❌ Erro ao buscar templates:', templatesError.message);
    } else {
      console.log(`✅ Templates ativos encontrados: ${templatesData.length}`);
      if (templatesData.length > 0) {
        console.log('Template mais recente:', {
          id: templatesData[0].id,
          name: templatesData[0].name,
          workflow_id: templatesData[0].workflow_id,
          n8n_base_url: templatesData[0].n8n_base_url
        });
      }
    }

    console.log('\n🎉 Teste concluído!');

  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

testSignup();
