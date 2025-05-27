-- Script para atualizar a URL do webhook em todas as configurações existentes
-- Execute este script no Supabase SQL Editor se você já executou o setup anterior

-- Atualizar todas as configurações existentes para usar a URL correta do webhook
UPDATE public.n8n_configurations 
SET webhook_url = 'https://primary-production-8c118.up.railway.app/webhook/generate-image',
    updated_at = NOW()
WHERE webhook_url != 'https://primary-production-8c118.up.railway.app/webhook/generate-image' 
   OR webhook_url IS NULL;

-- Atualizar o template também
UPDATE public.n8n_workflow_templates 
SET n8n_base_url = 'https://primary-production-8c118.up.railway.app',
    updated_at = NOW()
WHERE is_active = true;

-- Verificar os resultados
SELECT 
    'Configurações atualizadas:' as status,
    COUNT(*) as total_configuracoes,
    COUNT(CASE WHEN webhook_url = 'https://primary-production-8c118.up.railway.app/webhook/generate-image' THEN 1 END) as com_webhook_correto
FROM n8n_configurations;

-- Mostrar configurações atualizadas
SELECT 
    u.email,
    nc.webhook_url,
    nc.workflow_url,
    nc.is_active
FROM n8n_configurations nc
JOIN auth.users u ON u.id = nc.user_id
ORDER BY nc.created_at DESC
LIMIT 5;
