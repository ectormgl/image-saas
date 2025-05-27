// Verificar schemas das tabelas
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ibrywlgszctqthddiknt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlidnlsd2dzemN0cXRoZGRpa250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MDQ5NzcsImV4cCI6MjA1Mjk4MDk3N30.bv2YQv1FbFQ0O5wWJTjIJDk6_EpfYllUo8y8MUU8yp8'
);

async function checkSchemas() {
  try {
    console.log('=== VERIFICANDO TABELA PROFILES ===');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('Erro na tabela profiles:', profileError);
    } else {
      console.log('✅ Tabela profiles existe');
      console.log('Sample data structure:', Object.keys(profileData[0] || {}));
    }
    
    console.log('\n=== VERIFICANDO TABELA CREDITS ===');
    const { data: creditsData, error: creditsError } = await supabase
      .from('credits')
      .select('*')
      .limit(1);
    
    if (creditsError) {
      console.log('❌ Tabela credits não existe:', creditsError.message);
    } else {
      console.log('✅ Tabela credits existe');
    }
    
    console.log('\n=== VERIFICANDO TABELA N8N_CONFIGURATIONS ===');
    const { data: n8nData, error: n8nError } = await supabase
      .from('n8n_configurations')
      .select('*')
      .limit(1);
    
    if (n8nError) {
      console.error('Erro na tabela n8n_configurations:', n8nError);
    } else {
      console.log('✅ Tabela n8n_configurations existe');
      console.log('Sample data structure:', Object.keys(n8nData[0] || {}));
    }
    
    console.log('\n=== VERIFICANDO FUNÇÃO HANDLE_NEW_USER ===');
    const { data: functionData, error: functionError } = await supabase.rpc('handle_new_user');
    
    if (functionError) {
      console.log('Erro ao verificar função:', functionError.message);
    }
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

checkSchemas();
