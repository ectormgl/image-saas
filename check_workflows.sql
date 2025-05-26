-- Script para verificar configurações de workflow atuais

-- 1. Verificar templates de workflow disponíveis
SELECT 
    'Templates Disponíveis:' as verificacao,
    id,
    name,
    workflow_id,
    n8n_base_url,
    is_active
FROM n8n_workflow_templates
WHERE is_active = true;

-- 2. Verificar configurações de usuários
SELECT 
    'Configurações por Usuário:' as verificacao,
    user_id,
    workflow_name,
    workflow_url,
    webhook_url,
    is_active,
    template_workflow_id,
    created_at
FROM n8n_configurations
ORDER BY created_at DESC;

-- 3. Verificar se há configuração ativa
SELECT 
    'Configuração Ativa:' as verificacao,
    COUNT(*) as total_ativas,
    CASE WHEN COUNT(*) > 0 THEN 'Sim ✓' ELSE 'Não ✗' END as status
FROM n8n_configurations
WHERE is_active = true;

-- 4. Mostrar URL do webhook configurado
SELECT 
    'Webhook URL Configurado:' as verificacao,
    webhook_url,
    workflow_url,
    template_workflow_id
FROM n8n_configurations
WHERE is_active = true
LIMIT 1;
