#!/bin/bash

# Script simplificado para Supabase Cloud
# Aplica a migração e oferece comandos SQL para executar manualmente

echo "🔧 Configuração N8N - Workflow Compartilhado (Supabase Cloud)"
echo "============================================================="

# Verificar se a URL foi fornecida
if [ -z "$1" ]; then
    echo "❌ Por favor, forneça a URL do seu N8N:"
    echo ""
    echo "Uso: ./setup-n8n-cloud.sh https://your-n8n-domain.com"
    echo ""
    echo "Exemplo:"
    echo "  ./setup-n8n-cloud.sh https://n8n.minhaempresa.com"
    exit 1
fi

N8N_URL="$1"

echo "🌐 URL do N8N configurada: $N8N_URL"
echo ""

# Aplicar migração via Supabase CLI
echo "📂 Aplicando migração..."
echo "Execute este comando para aplicar a migração:"
echo ""
echo "npx supabase db push"
echo ""

# Mostrar comandos SQL para executar no Dashboard do Supabase
echo "🔄 Após aplicar a migração, execute estes comandos SQL no Dashboard do Supabase:"
echo ""
echo "-- 1. Atualizar URL do N8N"
echo "SELECT update_n8n_url('$N8N_URL');"
echo ""
echo "-- 2. Verificar se foi configurado corretamente"
echo "SELECT name, n8n_base_url, workflow_id, is_active"
echo "FROM n8n_workflow_templates" 
echo "WHERE is_active = true;"
echo ""
echo "-- 3. Ver configurações dos usuários (se houver)"
echo "SELECT "
echo "    u.email,"
echo "    nc.workflow_name,"
echo "    nc.workflow_url,"
echo "    nc.webhook_url,"
echo "    nc.is_active"
echo "FROM n8n_configurations nc"
echo "JOIN auth.users u ON u.id = nc.user_id"
echo "LIMIT 5;"
echo ""

# Criar arquivo SQL para facilitar
cat > update_n8n_urls.sql << EOF
-- Comandos para atualizar N8N no Supabase Cloud
-- Execute estes comandos no SQL Editor do Dashboard do Supabase

-- 1. Atualizar URL do N8N
SELECT update_n8n_url('$N8N_URL');

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
EOF

echo "📝 Arquivo SQL criado: update_n8n_urls.sql"
echo ""
echo "🎯 Passos para completar a configuração:"
echo ""
echo "1. Execute: npx supabase db push"
echo "2. Abra o Dashboard do Supabase"
echo "3. Vá para SQL Editor"
echo "4. Execute os comandos do arquivo: update_n8n_urls.sql"
echo "5. Configure seu workflow no N8N: $N8N_URL"
echo "6. Use o ID do workflow: 'image-generation-workflow'"
echo "7. Configure o webhook: $N8N_URL/webhook/image-generation-workflow"
echo ""
echo "✅ Pronto! Sua configuração estará funcionando."
