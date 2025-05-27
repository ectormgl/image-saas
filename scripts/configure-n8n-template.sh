#!/bin/bash

# Script para configurar o template de workflow com base nas variáveis de ambiente

echo "🔧 Configurando template de workflow..."

# Carregar variáveis de ambiente
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verificar se as variáveis necessárias estão definidas
if [ -z "$VITE_N8N_TEMPLATE_WORKFLOW_ID" ] || [ "$VITE_N8N_TEMPLATE_WORKFLOW_ID" = "your-workflow-id-here" ]; then
    echo "⚠️  VITE_N8N_TEMPLATE_WORKFLOW_ID não configurado no .env"
    echo "📝 Configure com o ID do seu workflow no n8n"
    exit 1
fi

if [ -z "$VITE_N8N_BASE_URL" ] || [ "$VITE_N8N_BASE_URL" = "http://localhost:5678" ]; then
    echo "⚠️  Configure VITE_N8N_BASE_URL no .env com a URL da sua instância n8n"
fi

if [ -z "$VITE_N8N_API_KEY" ] || [ "$VITE_N8N_API_KEY" = "your-n8n-api-key-here" ]; then
    echo "⚠️  Configure VITE_N8N_API_KEY no .env com sua chave de API do n8n"
fi

echo "✅ Configurações encontradas:"
echo "   - N8N Base URL: $VITE_N8N_BASE_URL"
echo "   - Template Workflow ID: $VITE_N8N_TEMPLATE_WORKFLOW_ID"
echo "   - API Key: ${VITE_N8N_API_KEY:0:10}..."

# Atualizar template no banco de dados
echo "🔄 Atualizando template no banco de dados..."

cat << EOF > /tmp/update_template.sql
UPDATE public.n8n_workflow_templates 
SET 
    template_workflow_id = '$VITE_N8N_TEMPLATE_WORKFLOW_ID',
    default_workflow_url = '$VITE_N8N_BASE_URL',
    default_api_key = '$VITE_N8N_API_KEY'
WHERE name = 'Template Padrão - Geração de Imagens';
EOF

# Executar SQL no Supabase local
npx supabase db reset --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" < /tmp/update_template.sql

if [ $? -eq 0 ]; then
    echo "✅ Template atualizado com sucesso!"
else
    echo "❌ Erro ao atualizar template. Execute manualmente:"
    cat /tmp/update_template.sql
fi

# Limpar arquivo temporário
rm -f /tmp/update_template.sql

echo ""
echo "🎯 Próximos passos:"
echo "1. ✅ Configure seu workflow no n8n com o ID: $VITE_N8N_TEMPLATE_WORKFLOW_ID"
echo "2. ✅ Aplique a migração 005 para ativar auto-criação de workflows"
echo "3. ✅ Teste criando uma nova conta"
echo ""
