#!/bin/bash

# Script para configurar variáveis de ambiente de desenvolvimento
# Execute este script para configurar o ambiente local

echo "🚀 Configurando ambiente de desenvolvimento para Image SaaS..."

# Criar arquivo .env.local se não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "✅ Arquivo .env.local criado! Configure as variáveis antes de continuar."
else
    echo "📁 Arquivo .env.local já existe."
fi

# Verificar se as dependências estão instaladas
echo "📦 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules não encontrado. Instalando dependências..."
    npm install
else
    echo "✅ Dependências já instaladas."
fi

# Instruções para configuração do Supabase
echo ""
echo "🔧 PRÓXIMOS PASSOS:"
echo "1. Configure as variáveis no arquivo .env.local:"
echo "   - VITE_SUPABASE_URL: URL do seu projeto Supabase"
echo "   - VITE_SUPABASE_ANON_KEY: Chave anônima do Supabase"
echo "   - VITE_N8N_BASE_URL: URL da sua instância n8n"
echo "   - VITE_N8N_API_KEY: Chave de API do n8n"
echo ""
echo "2. Execute as migrações do banco de dados:"
echo "   - Acesse o Supabase Studio"
echo "   - Vá para SQL Editor"
echo "   - Execute o conteúdo dos arquivos em supabase/migrations/"
echo ""
echo "3. Configure o Supabase Storage:"
echo "   - Execute: bash scripts/setup-storage.sh"
echo ""
echo "4. Popule com dados de exemplo (opcional):"
echo "   - Execute o script scripts/sample-data.sql no Supabase Studio"
echo ""
echo "5. Inicie o servidor de desenvolvimento:"
echo "   - Execute: npm run dev"
echo ""
echo "📚 Documentação completa disponível no README.md"
echo ""
echo "🎉 Configuração concluída! Siga os próximos passos acima."
