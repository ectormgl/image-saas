-- Script para verificar o que aconteceu APÓS o teste de registro
-- Execute este script DEPOIS de criar uma nova conta de teste

-- 1. Verificar o usuário mais recente criado
SELECT 
    'Usuário Mais Recente:' as verificacao,
    id,
    email,
    created_at,
    raw_user_meta_data->>'name' as nome_fornecido
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;

-- 2. Verificar se o perfil foi criado para o usuário mais recente
WITH ultimo_usuario AS (
    SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
    'Perfil Criado:' as verificacao,
    p.id,
    p.email,
    p.name,
    p.created_at,
    CASE WHEN p.id IS NOT NULL THEN 'Sim ✓' ELSE 'Não ✗' END as status
FROM ultimo_usuario u
LEFT JOIN profiles p ON p.id = u.id;

-- 3. Verificar se a configuração de workflow foi criada
WITH ultimo_usuario AS (
    SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
    'Workflow Configurado:' as verificacao,
    nc.id,
    nc.workflow_name,
    nc.workflow_url,
    nc.webhook_url,
    nc.is_active,
    nc.template_workflow_id,
    nc.created_at,
    CASE WHEN nc.id IS NOT NULL THEN 'Sim ✓' ELSE 'Não ✗' END as status
FROM ultimo_usuario u
LEFT JOIN n8n_configurations nc ON nc.user_id = u.id;

-- 4. Verificar se os créditos foram adicionados
WITH ultimo_usuario AS (
    SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
    'Créditos Criados:' as verificacao,
    c.id,
    c.type,
    c.amount,
    c.description,
    c.created_at,
    CASE WHEN c.id IS NOT NULL THEN 'Sim ✓' ELSE 'Não ✗' END as status
FROM ultimo_usuario u
LEFT JOIN credits c ON c.user_id = u.id AND c.type = 'signup_bonus';

-- 5. Verificar logs do processo de criação
WITH ultimo_usuario AS (
    SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
    'Logs de Criação:' as verificacao,
    pl.step_name,
    pl.status,
    pl.message,
    pl.data,
    pl.created_at
FROM ultimo_usuario u
LEFT JOIN processing_logs pl ON (pl.data->>'user_id')::uuid = u.id
WHERE pl.step_name IN ('shared_workflow_setup', 'auto_workflow_creation')
ORDER BY pl.created_at DESC;

-- 6. Verificar se há algum erro nos logs recentes
SELECT 
    'Logs de Erro Recentes:' as verificacao,
    step_name,
    status,
    message,
    created_at
FROM processing_logs 
WHERE status = 'failed' 
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Estatísticas gerais após o teste
SELECT 
    'Estatísticas Atuais:' as info,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM profiles) as total_perfis,
    (SELECT COUNT(*) FROM n8n_configurations) as total_workflows,
    (SELECT COUNT(*) FROM credits WHERE type = 'signup_bonus') as total_creditos_bonus;

-- 8. Verificar se o webhook está correto
WITH ultimo_usuario AS (
    SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
    'URL do Webhook:' as verificacao,
    nc.webhook_url,
    CASE 
        WHEN nc.webhook_url = 'https://primary-production-8c118.up.railway.app/webhook/generate-image' THEN 'URL correta ✓'
        WHEN nc.webhook_url IS NULL THEN 'Webhook não configurado ✗'
        ELSE 'URL pode estar incorreta ⚠️'
    END as status_url
FROM ultimo_usuario u
LEFT JOIN n8n_configurations nc ON nc.user_id = u.id;

-- 9. Simulação de dados que seriam enviados para o N8N
WITH ultimo_usuario AS (
    SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT 
    'Dados para N8N:' as simulacao,
    json_build_object(
        'userId', u.id,
        'userEmail', u.email,
        'webhookUrl', nc.webhook_url,
        'workflowId', nc.template_workflow_id,
        'isActive', nc.is_active
    ) as dados_n8n
FROM ultimo_usuario u
LEFT JOIN n8n_configurations nc ON nc.user_id = u.id;

SELECT '
🎯 RESULTADO DO TESTE:

✅ Se todos os status mostram ✓, o registro funcionou perfeitamente!
⚠️  Se algum mostra ⚠️, pode haver um problema menor
❌ Se algum mostra ✗, há um problema que precisa ser corrigido

📊 Próximos passos se tudo estiver OK:
1. Teste fazer login com a conta criada
2. Teste fazer upload de uma imagem
3. Teste gerar uma imagem para ver se o webhook do N8N é chamado

🔧 Se houver problemas:
1. Verifique os logs de erro
2. Execute novamente o complete_n8n_setup.sql
3. Teste criar outra conta

' as resultado_do_teste;
