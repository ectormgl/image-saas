import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibrywlgszctqthddiknt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicnl3bGdzemN0cXRoZGRpa250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODQsImV4cCI6MjA2MzY5Nzc4NH0.ENmovJ4olXKn2iHQnnsd3JjeAXWOvITQsiIsS8tHt6A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWorkflowConfigurations() {
    console.log('🔍 Verificando configurações de workflow...\n');
    
    try {
        // 1. Verificar templates disponíveis
        console.log('📋 Templates de Workflow:');
        const { data: templates, error: templatesError } = await supabase
            .from('n8n_workflow_templates')
            .select('*')
            .eq('is_active', true);
        
        if (templatesError) {
            console.error('Erro ao buscar templates:', templatesError);
        } else {
            console.table(templates);
        }
        
        // 2. Verificar configurações de usuários
        console.log('\n👥 Configurações de Usuários:');
        const { data: configs, error: configsError } = await supabase
            .from('n8n_configurations')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (configsError) {
            console.error('Erro ao buscar configurações:', configsError);
        } else {
            console.table(configs);
        }
        
        // 3. Verificar configuração ativa
        console.log('\n✅ Configurações Ativas:');
        const { data: activeConfigs, error: activeError } = await supabase
            .from('n8n_configurations')
            .select('*')
            .eq('is_active', true);
        
        if (activeError) {
            console.error('Erro ao buscar configurações ativas:', activeError);
        } else {
            console.table(activeConfigs);
            console.log(`Total de configurações ativas: ${activeConfigs.length}`);
        }
        
    } catch (error) {
        console.error('Erro geral:', error);
    }
}

checkWorkflowConfigurations();
