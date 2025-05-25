#!/bin/bash

# Script para aplicar migrações no Supabase
# Este script conecta ao seu projeto Supabase e executa as migrações SQL

echo "🚀 Aplicando migrações do banco de dados Supabase..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

# Verificar se já existe um projeto Supabase inicializado
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Projeto Supabase não inicializado."
    echo "Execute: supabase init"
    exit 1
fi

# Verificar se está logado no Supabase
if ! supabase status &> /dev/null; then
    echo "📝 Fazendo login no Supabase..."
    supabase login
fi

# Aplicar migrações
echo "📦 Aplicando migração: 001_create_profiles_table.sql"

# Verificar se existe migração local
if [ -f "supabase/migrations/001_create_profiles_table.sql" ]; then
    echo "✅ Migração encontrada localmente"
    
    # Fazer push das migrações para o projeto remoto
    supabase db push
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrações aplicadas com sucesso!"
        echo ""
        echo "🎉 Agora sua aplicação está configurada para:"
        echo "   - Armazenar perfis de usuário na tabela 'profiles'"
        echo "   - Upload de logos no bucket 'user-uploads'"
        echo "   - Sincronização automática de perfis quando usuários se registram"
        echo ""
        echo "📝 Próximos passos:"
        echo "   1. Teste a aplicação fazendo login/cadastro"
        echo "   2. Preencha as informações do perfil de negócio"
        echo "   3. Verifique no painel do Supabase se os dados estão sendo salvos"
    else
        echo "❌ Erro ao aplicar migrações"
        exit 1
    fi
else
    echo "❌ Arquivo de migração não encontrado"
    exit 1
fi
