#!/bin/bash

# Script para testar o workflow n8n adaptado
# Uso: ./test-n8n-workflow.sh

echo "🧪 Testando Workflow N8n Adaptado..."

# Verificar se as variáveis estão configuradas
if [ -z "$VITE_N8N_BASE_URL" ] || [ -z "$VITE_N8N_API_KEY" ]; then
    echo "❌ Erro: Variáveis N8n não configuradas"
    echo "Configure VITE_N8N_BASE_URL e VITE_N8N_API_KEY no .env"
    exit 1
fi

# Ler variáveis do .env
source .env

# URL do webhook (assumindo que o path é generate-image)
WEBHOOK_URL="${VITE_N8N_BASE_URL%/}/webhook/generate-image"

echo "📡 Testando webhook: $WEBHOOK_URL"

# Dados de teste - formato compatível com workflow corrigido
TEST_DATA='{
  "productName": "Perfume de Luxo Teste",
  "slogan": "Elegância em cada borrifo",
  "category": "beauty",
  "benefits": "Fragrância duradoura com notas florais e amadeiradas",
  "productImage": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
  "userId": "test-user-123",
  "requestId": "test-req-'$(date +%s)'",
  "brandTone": "Luxuoso, sofisticado e elegante",
  "colorTheme": "Dourado, preto e tons premium",
  "targetAudience": "Adultos jovens interessados em produtos premium",
  "stylePreferences": "Estilo minimalista com toques dourados e composição elegante"
}'

echo "📤 Enviando dados de teste..."
echo "$TEST_DATA" | jq .

# Fazer requisição
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_N8N_API_KEY" \
  -d "$TEST_DATA")

# Separar resposta e código HTTP
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo "📥 Código HTTP: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Webhook executado com sucesso!"
    echo "📋 Resposta:"
    echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
    
    # Tentar extrair execution ID se disponível
    EXECUTION_ID=$(echo "$HTTP_BODY" | jq -r '.executionId // empty' 2>/dev/null)
    if [ ! -z "$EXECUTION_ID" ]; then
        echo "🔍 ID da Execução: $EXECUTION_ID"
        echo "💡 Verifique o status da execução no n8n"
    fi
else
    echo "❌ Erro na execução do webhook"
    echo "📋 Resposta de erro:"
    echo "$HTTP_BODY"
fi

echo ""
echo "🔧 Próximos passos:"
echo "1. Se deu erro 404, verifique se o webhook path está correto"
echo "2. Se deu erro 401, verifique a API key"
echo "3. Se deu erro 500, verifique o workflow no n8n"
echo "4. Acesse o n8n para ver logs detalhados"
