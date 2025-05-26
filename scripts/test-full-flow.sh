#!/bin/bash

# Script para testar o fluxo completo de criação de usuário e workflow

echo "🚀 Testando fluxo completo do SaaS..."

# Verificar se o Supabase está rodando
echo "📊 Verificando status do Supabase..."
cd /workspaces/image-saas
npx supabase status > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "⚠️  Supabase não está rodando. Iniciando..."
    npx supabase start
else
    echo "✅ Supabase está rodando"
fi

# Aplicar migração manual se necessário
echo "🔄 Verificando migrações..."
echo "📝 Para aplicar a migração 005 manualmente, execute:"
echo "   npx supabase db reset"
echo "   ou acesse o dashboard e execute a migração SQL"

# Iniciar aplicação
echo "🌐 Iniciando aplicação..."
npm run dev &

# Aguardar um pouco
sleep 3

echo ""
echo "🎯 Próximos passos para testar:"
echo "1. ✅ Acesse http://localhost:5173"
echo "2. ✅ Crie uma nova conta (signup)"
echo "3. ✅ Verifique se o workflow foi criado automaticamente"
echo "4. ✅ Teste a geração de imagens"
echo "5. ✅ Verifique se os créditos foram adicionados"
echo ""
echo "🔧 Configurações importantes:"
echo "- N8N_BASE_URL: ${VITE_N8N_BASE_URL:-'http://localhost:5678'}"
echo "- DEV_MODE: ${VITE_DEV_MODE:-'true'}"
echo ""
echo "📋 Para testar a integração real do n8n:"
echo "1. Configure uma instância n8n"
echo "2. Atualize as variáveis de ambiente no .env"
echo "3. Importe o template de workflow no n8n"
echo ""
