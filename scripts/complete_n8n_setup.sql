-- ====================================================================
-- CONFIGURAÇÃO COMPLETA N8N - WORKFLOW COMPARTILHADO
-- Execute este arquivo completo no SQL Editor do Supabase Dashboard
-- ====================================================================

-- 1. MIGRAÇÃO: Implementar abordagem de workflow compartilhado
-- Todos os usuários usam o mesmo workflow, dados passados via webhook

-- Remover a função de clonagem de workflows (não será mais necessária)
DROP FUNCTION IF EXISTS clone_n8n_workflow_for_user(UUID, UUID);

-- 2. Criar uma nova função simplificada para o trigger de criação de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    shared_workflow_config RECORD;
BEGIN
    -- 1. Criar perfil do usuário (essencial)
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- 2. Tentar adicionar créditos iniciais (se tabela existir)
    BEGIN
        INSERT INTO public.credits (user_id, type, amount, description)
        VALUES (NEW.id, 'signup_bonus', 1, 'Crédito gratuito de boas-vindas');
    EXCEPTION WHEN OTHERS THEN
        -- Se falhar, apenas log o erro (não bloqueia o signup)
        RAISE NOTICE 'Falha ao criar créditos iniciais para usuário %: %', NEW.id, SQLERRM;
    END;
    
    -- 3. Verificar se existe uma configuração de workflow compartilhado
    BEGIN
        SELECT * INTO shared_workflow_config 
        FROM public.n8n_workflow_templates 
        WHERE is_active = true 
        ORDER BY created_at ASC 
        LIMIT 1;
        
        -- Se existir um template ativo, criar uma referência para o usuário
        IF FOUND THEN
            INSERT INTO public.n8n_configurations (
                user_id,
                workflow_name,
                workflow_url,
                webhook_url,
                api_key,
                is_active,
                template_workflow_id
            ) VALUES (
                NEW.id,
                'Workflow Compartilhado - ' || shared_workflow_config.name,
                shared_workflow_config.n8n_base_url,
                'https://primary-production-8c118.up.railway.app/webhook/generate-image',
                '', -- API key será configurada pelo usuário se necessário
                true,
                shared_workflow_config.workflow_id
            );
            
            -- Log da criação automática (se tabela processing_logs existir)
            BEGIN
                INSERT INTO public.processing_logs (
                    image_request_id,
                    step_name,
                    status,
                    message,
                    data
                ) VALUES (
                    NULL,
                    'shared_workflow_setup',
                    'completed',
                    'Configuração de workflow compartilhado criada no registro',
                    json_build_object(
                        'user_id', NEW.id, 
                        'template_id', shared_workflow_config.id,
                        'workflow_url', shared_workflow_config.n8n_base_url
                    )
                );
            EXCEPTION WHEN OTHERS THEN
                -- Se tabela processing_logs não existir, não há problema
                NULL;
            END;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Se falhar, apenas log o erro (não bloqueia o signup)
        RAISE NOTICE 'Falha ao configurar workflow para usuário %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar função para atualizar URLs do N8N facilmente
CREATE OR REPLACE FUNCTION update_n8n_url(new_url TEXT)
RETURNS void AS $$
BEGIN
    -- Atualizar template
    UPDATE public.n8n_workflow_templates 
    SET n8n_base_url = new_url,
        updated_at = NOW()
    WHERE is_active = true;
    
    -- Atualizar configurações dos usuários
    UPDATE public.n8n_configurations 
    SET workflow_url = new_url,
        webhook_url = 'https://primary-production-8c118.up.railway.app/webhook/generate-image',
        updated_at = NOW()
    WHERE template_workflow_id IS NOT NULL;
    
    RAISE NOTICE 'URLs do N8N atualizadas para: %', new_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualizar o template de workflow com URL correta
-- Se existe template com o workflow_id padrão, atualizar
UPDATE public.n8n_workflow_templates 
SET 
    n8n_base_url = 'https://primary-production-8c118.up.railway.app',
    description = 'Workflow compartilhado para geração de imagens - todos os usuários usam o mesmo workflow',
    updated_at = NOW()
WHERE workflow_id = 'LAe3gsTKSMaKWegC';

-- 5. Se não existir template, criar um
INSERT INTO public.n8n_workflow_templates (
    name, 
    description, 
    workflow_id, 
    n8n_base_url, 
    is_active
)
VALUES (
    'Geração de Imagens - Workflow Compartilhado',
    'Workflow compartilhado para todos os usuários. Os dados são enviados via webhook.',
    'LAe3gsTKSMaKWegC',
    'https://primary-production-8c118.up.railway.app',
    true
)
ON CONFLICT DO NOTHING;

-- 6. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. Adicionar comentários informativos
COMMENT ON FUNCTION public.handle_new_user() IS 'Função para configurar novo usuário com workflow compartilhado do N8N';
COMMENT ON FUNCTION update_n8n_url(TEXT) IS 'Função para atualizar a URL base do N8N em todas as configurações';

-- ====================================================================
-- COMANDOS DE VERIFICAÇÃO E CONFIGURAÇÃO
-- ====================================================================

-- Verificar se a função foi criada corretamente
SELECT 'Função update_n8n_url criada com sucesso!' as status;

-- Atualizar URLs com sua URL real do N8N
SELECT update_n8n_url('https://primary-production-8c118.up.railway.app');

-- Verificar templates ativos
SELECT 
    'Templates Ativos:' as tipo,
    name,
    n8n_base_url,
    workflow_id,
    is_active
FROM n8n_workflow_templates 
WHERE is_active = true;

-- Verificar configurações dos usuários existentes
SELECT 
    'Configurações de Usuários:' as tipo,
    u.email,
    nc.workflow_name,
    nc.workflow_url,
    nc.webhook_url,
    nc.is_active
FROM n8n_configurations nc
JOIN auth.users u ON u.id = nc.user_id
LIMIT 10;

-- Contar quantos usuários têm configuração
SELECT 
    'Estatísticas:' as info,
    COUNT(DISTINCT u.id) as total_usuarios,
    COUNT(DISTINCT nc.user_id) as usuarios_com_workflow
FROM auth.users u
LEFT JOIN n8n_configurations nc ON nc.user_id = u.id;

-- ====================================================================
-- OPCIONAL: RECRIAR CONFIGURAÇÕES PARA USUÁRIOS EXISTENTES
-- Descomente e execute se quiser configurar usuários que já existem
-- ====================================================================

/*
-- Criar configurações para usuários que ainda não têm
INSERT INTO n8n_configurations (user_id, workflow_name, workflow_url, webhook_url, is_active, template_workflow_id)
SELECT 
    u.id,
    'Workflow Compartilhado - ' || t.name,
    t.n8n_base_url,
    t.n8n_base_url || '/webhook/' || t.workflow_id,
    true,
    t.workflow_id
FROM auth.users u
CROSS JOIN n8n_workflow_templates t 
WHERE t.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM n8n_configurations nc2 
    WHERE nc2.user_id = u.id
);

-- Verificar novamente após criar configurações
SELECT 
    'Após recriar configurações:' as info,
    COUNT(DISTINCT u.id) as total_usuarios,
    COUNT(DISTINCT nc.user_id) as usuarios_com_workflow
FROM auth.users u
LEFT JOIN n8n_configurations nc ON nc.user_id = u.id;
*/

-- ====================================================================
-- INSTRUÇÕES FINAIS
-- ====================================================================

SELECT '
🎉 CONFIGURAÇÃO CONCLUÍDA!

✅ Próximos passos:
1. Configure seu workflow no N8N: https://primary-production-8c118.up.railway.app
2. Use o ID do workflow: "LAe3gsTKSMaKWegC"
3. Configure o webhook: https://primary-production-8c118.up.railway.app/webhook/generate-image
4. Teste criando um novo usuário para verificar se o workflow é configurado automaticamente

🔧 Para alterar a URL do N8N no futuro:
SELECT update_n8n_url(''https://nova-url.com'');

📊 Para monitorar:
- Novos registros: SELECT * FROM processing_logs WHERE step_name = ''shared_workflow_setup'';
- Configurações: SELECT * FROM n8n_configurations;
' as instrucoes;
