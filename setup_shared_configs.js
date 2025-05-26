import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibrywlgszctqthddiknt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicnl3bGdzemN0cXRoZGRpa250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODQsImV4cCI6MjA2MzY5Nzc4NH0.ENmovJ4olXKn2iHQnnsd3JjeAXWOvITQsiIsS8tHt6A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSharedWorkflowConfigs() {
    console.log('🔧 Configurando workflows compartilhados para usuários existentes...\n');
    
    try {
        // 1. Buscar usuários existentes
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email');
        
        if (profilesError) {
            console.error('❌ Erro ao buscar usuários:', profilesError);
            return;
        }
        
        console.log(`👥 Encontrados ${profiles.length} usuários`);
        
        // 2. Buscar template de workflow ativo
        const { data: templates, error: templatesError } = await supabase
            .from('n8n_workflow_templates')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (templatesError || !templates || templates.length === 0) {
            console.error('❌ Nenhum template de workflow ativo encontrado:', templatesError);
            return;
        }
        
        const template = templates[0];
        console.log(`📋 Usando template: ${template.name} (ID: ${template.workflow_id})`);
        
        // 3. Criar configurações para cada usuário
        for (const profile of profiles) {
            console.log(`⚙️ Configurando workflow para ${profile.email}...`);
            
            // Verificar se já existe configuração
            const { data: existingConfig } = await supabase
                .from('n8n_configurations')
                .select('id')
                .eq('user_id', profile.id)
                .single();
            
            if (existingConfig) {
                console.log(`  ⏭️ Configuração já existe para ${profile.email}`);
                continue;
            }
            
            // Criar nova configuração
            const { error: insertError } = await supabase
                .from('n8n_configurations')
                .insert({
                    user_id: profile.id,
                    workflow_name: `Workflow Compartilhado - ${template.name}`,
                    workflow_url: template.n8n_base_url,
                    webhook_url: 'https://primary-production-8c118.up.railway.app/webhook/generate-image',
                    api_key: null, // Não necessário para webhook
                    is_active: true,
                    template_workflow_id: template.workflow_id
                });
            
            if (insertError) {
                console.error(`  ❌ Erro ao criar configuração para ${profile.email}:`, insertError);
            } else {
                console.log(`  ✅ Configuração criada para ${profile.email}`);
            }
        }
        
        console.log('\n🎉 Configuração de workflows compartilhados concluída!');
        
        // 4. Verificar resultado
        const { data: activeConfigs } = await supabase
            .from('n8n_configurations')
            .select('*')
            .eq('is_active', true);
        
        console.log(`\n📊 Total de configurações ativas: ${activeConfigs?.length || 0}`);
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

setupSharedWorkflowConfigs();
