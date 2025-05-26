#!/bin/bash

# Script para configurar o N8N com workflow compartilhado
# Este script aplica a migração e configura a URL correta do N8N

echo "🔧 Configurando N8N com abordagem de workflow compartilhado..."

# Verificar se a URL do N8N foi fornecida
if [ -z "$1" ]; then
    echo "❌ Erro: Você deve fornecer a URL do seu N8N"
    echo "📖 Uso: ./configure-n8n-shared.sh https://your-n8n-domain.com"
    echo ""
    echo "Exemplo:"
    echo "  ./configure-n8n-shared.sh https://n8n.minhaempresa.com"
    exit 1
fi

N8N_URL="$1"

echo "🌐 URL do N8N: $N8N_URL"

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instalando via npm..."
    npm install -g @supabase/cli
fi

# 1. Aplicar a migração
echo "📂 Aplicando migração de workflow compartilhado..."
npx supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migração aplicada com sucesso!"
else
    echo "❌ Erro ao aplicar migração. Verifique sua conexão com o Supabase."
    exit 1
fi

# 2. Executar função para atualizar URLs
echo "🔄 Atualizando URLs do N8N no banco de dados..."

# Criar arquivo SQL temporário
cat > /tmp/update_n8n_url.sql << EOF
-- Atualizar URL do N8N
SELECT update_n8n_url('$N8N_URL');

-- Verificar se foi atualizado
SELECT 
    name,
    n8n_base_url,
    workflow_id,
    is_active
FROM n8n_workflow_templates 
WHERE is_active = true;

-- Mostrar configurações atualizadas
SELECT 
    u.email,
    nc.workflow_name,
    nc.workflow_url,
    nc.webhook_url,
    nc.is_active
FROM n8n_configurations nc
JOIN auth.users u ON u.id = nc.user_id
LIMIT 5;
EOF

# Executar o SQL
npx supabase db exec --file /tmp/update_n8n_url.sql

if [ $? -eq 0 ]; then
    echo "✅ URLs atualizadas com sucesso!"
else
    echo "⚠️  Aviso: Pode ter havido algum problema ao atualizar as URLs."
fi

# Limpar arquivo temporário
rm -f /tmp/update_n8n_url.sql

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Resumo das alterações:"
echo "  • Migração aplicada: 008_shared_workflow_approach.sql"
echo "  • URL do N8N configurada: $N8N_URL"
echo "  • Abordagem: Workflow compartilhado (todos os usuários usam o mesmo workflow)"
echo ""
echo "🔗 Próximos passos:"
echo "  1. Configure seu workflow no N8N: $N8N_URL"
echo "  2. Use o ID do workflow: 'image-generation-workflow'"
echo "  3. Configure o webhook: $N8N_URL/webhook/image-generation-workflow"
echo "  4. Teste um registro de usuário para verificar se o workflow é configurado automaticamente"
echo ""
echo "💡 Para alterar a URL do N8N no futuro, execute:"
echo "  SELECT update_n8n_url('https://nova-url.com');"
