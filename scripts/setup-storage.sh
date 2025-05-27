#!/bin/bash

# Script para configurar o Supabase Storage
echo "🚀 Configurando Supabase Storage para imagens..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instale primeiro: npm install -g supabase"
    exit 1
fi

# Verificar se está logado no Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Não está logado no Supabase. Execute: supabase login"
    exit 1
fi

echo "📦 Criando bucket 'user-uploads' para imagens..."

# Criar o bucket se não existir
supabase storage bucket create user-uploads --public

echo "🔧 Configurando políticas de segurança..."

# SQL para criar políticas de segurança
cat > /tmp/storage_policies.sql << 'EOF'
-- Política para upload de imagens (usuários autenticados)
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'user-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para visualização de imagens (público)
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'user-uploads');

-- Política para deletar imagens (apenas o proprietário)
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'user-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para atualizar imagens (apenas o proprietário)
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'user-uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
EOF

# Aplicar as políticas
echo "📝 Aplicando políticas de segurança..."
supabase db push --file /tmp/storage_policies.sql

# Limpeza
rm /tmp/storage_policies.sql

echo "✅ Configuração do Supabase Storage concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no arquivo .env"
echo "2. Configure o n8n webhook para receber os dados"
echo "3. Teste o upload de imagens na aplicação"
echo ""
echo "🔗 URLs importantes:"
echo "- Storage URL: https://your-project.supabase.co/storage/v1/object/public/user-uploads/"
echo "- Dashboard: https://app.supabase.com/project/your-project/storage/buckets"
