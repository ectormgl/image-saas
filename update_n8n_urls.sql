-- ⚠️  ATENÇÃO: Execute PRIMEIRO o arquivo complete_n8n_setup.sql
-- Este arquivo só funciona APÓS a migração ter sido aplicada!

-- Comandos para atualizar N8N no Supabase Cloud
-- Execute estes comandos no SQL Editor do Dashboard do Supabase

-- 1. Atualizar URL do N8N
SELECT update_n8n_url('https://primary-production-8c118.up.railway.app');

-- 2. Verificar templates ativos
SELECT 
    name,
    n8n_base_url,
    workflow_id,
    is_active
FROM n8n_workflow_templates 
WHERE is_active = true;

-- 3. Verificar configurações dos usuários
SELECT 
    u.email,
    nc.workflow_name,
    nc.workflow_url,
    nc.webhook_url,
    nc.is_active
FROM n8n_configurations nc
JOIN auth.users u ON u.id = nc.user_id
LIMIT 10;

-- 4. Se precisar recriar configurações para usuários existentes
-- (Execute apenas se necessário)
/*
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
*/
