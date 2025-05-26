-- Verificar se as tabelas necessárias existem no Supabase Cloud
-- Executar este script no SQL Editor do Supabase Studio

-- 1. Verificar tabelas existentes relacionadas ao N8N
SELECT 
    table_name,
    'Existe ✓' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('n8n_workflow_templates', 'n8n_configurations', 'profiles', 'credits')
ORDER BY table_name;

-- 2. Verificar se há template de workflow ativo
SELECT 
    'Templates de Workflow:' as verificacao,
    COUNT(*) as total,
    COUNT(CASE WHEN is_active THEN 1 END) as ativos
FROM n8n_workflow_templates;

-- 3. Verificar função handle_new_user
SELECT 
    'Função handle_new_user:' as verificacao,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'handle_new_user'
        ) THEN 'Existe ✓'
        ELSE 'Não existe ✗'
    END as status;

-- 4. Verificar trigger
SELECT 
    'Trigger on_auth_user_created:' as verificacao,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'on_auth_user_created'
        ) THEN 'Existe ✓'
        ELSE 'Não existe ✗'
    END as status;

-- 5. Se não existir o template, mostrar estrutura esperada
SELECT 
    'URL N8N esperada:' as info,
    'https://primary-production-8c118.up.railway.app' as valor
UNION ALL
SELECT 
    'Webhook URL esperada:' as info,
    'https://primary-production-8c118.up.railway.app/webhook/generate-image' as valor;
