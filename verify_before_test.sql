-- Script para testar a configuração de workflow durante o registro
-- Execute este script ANTES de testar o registro de usuário

-- 1. Verificar se o template de workflow existe e está ativo
SELECT 
    'Status do Template:' as verificacao,
    COUNT(*) as templates_ativos,
    string_agg(name, ', ') as nomes_templates,
    string_agg(n8n_base_url, ', ') as urls_n8n
FROM n8n_workflow_templates 
WHERE is_active = true;

-- 2. Verificar se a função handle_new_user existe
SELECT 
    'Função handle_new_user:' as verificacao,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'handle_new_user'
        ) THEN 'Existe ✓'
        ELSE 'Não existe ✗'
    END as status;

-- 3. Verificar se o trigger existe
SELECT 
    'Trigger on_auth_user_created:' as verificacao,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'on_auth_user_created'
        ) THEN 'Existe ✓'
        ELSE 'Não existe ✗'
    END as status;

-- 4. Verificar se a função update_n8n_url existe
SELECT 
    'Função update_n8n_url:' as verificacao,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'update_n8n_url'
        ) THEN 'Existe ✓'
        ELSE 'Não existe ✗'
    END as status;

-- 5. Verificar estrutura das tabelas necessárias
SELECT 
    'Tabela profiles:' as verificacao,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public')
        THEN 'Existe ✓'
        ELSE 'Não existe ✗'
    END as status;

SELECT 
    'Tabela n8n_configurations:' as verificacao,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'n8n_configurations' AND table_schema = 'public')
        THEN 'Existe ✓'
        ELSE 'Não existe ✗'
    END as status;

SELECT 
    'Tabela credits:' as verificacao,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credits' AND table_schema = 'public')
        THEN 'Existe ✓'
        ELSE 'Não existe ✗'
    END as status;

-- 6. Verificar quantos usuários já existem
SELECT 
    'Usuários Existentes:' as info,
    COUNT(*) as total_usuarios
FROM auth.users;

-- 7. Verificar quantos usuários têm configuração de workflow
SELECT 
    'Usuários com Workflow:' as info,
    COUNT(*) as usuarios_com_workflow
FROM n8n_configurations;

-- 8. Mostrar detalhes dos templates ativos
SELECT 
    'Detalhes dos Templates:' as secao,
    id,
    name,
    description,
    workflow_id,
    n8n_base_url,
    is_active,
    created_at
FROM n8n_workflow_templates 
WHERE is_active = true;

-- 9. Simulação: testar se a função handle_new_user funcionaria
-- (não executa, só mostra o que seria feito)
SELECT 
    'Simulação - Template que seria usado:' as simulacao,
    id,
    name,
    workflow_id,
    n8n_base_url
FROM n8n_workflow_templates 
WHERE is_active = true 
ORDER BY created_at ASC 
LIMIT 1;

-- 10. Verificar se há erros nos logs recentes
SELECT 
    'Logs Recentes:' as secao,
    step_name,
    status,
    message,
    created_at
FROM processing_logs 
WHERE step_name IN ('shared_workflow_setup', 'auto_workflow_creation')
ORDER BY created_at DESC 
LIMIT 5;

SELECT '
🔍 RESUMO DA VERIFICAÇÃO PRÉ-TESTE:

1. Execute este script para verificar se tudo está configurado
2. Se todos os status mostrarem ✓, está pronto para testar
3. Se algum mostrar ✗, execute primeiro o complete_n8n_setup.sql
4. Após confirmar que tudo está OK, teste criando uma nova conta

📝 Para testar:
- Abra: http://localhost:8080
- Clique em "Criar Conta"
- Preencha os dados e registre
- Após o registro, execute este outro script de verificação pós-teste

' as instrucoes_pre_teste;
