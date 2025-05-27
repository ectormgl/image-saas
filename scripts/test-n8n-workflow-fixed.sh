#!/bin/bash

# Script para testar o workflow n8n CORRIGIDO
# Uso: ./test-n8n-workflow-fixed.sh [webhook-url]

echo "🧪 Testando Workflow N8n CORRIGIDO..."

# URL do webhook (pode ser passada como parâmetro)
if [ -n "$1" ]; then
    WEBHOOK_URL="$1"
else
    # Tentar ler do .env
    if [ -f ".env" ]; then
        source .env
        WEBHOOK_URL="${VITE_N8N_BASE_URL%/}/webhook/generate-image"
    else
        echo "❌ Erro: URL do webhook não fornecida"
        echo "Uso: ./test-n8n-workflow-fixed.sh [webhook-url]"
        echo "Ou configure VITE_N8N_BASE_URL no .env"
        exit 1
    fi
fi

echo "📡 Testando webhook: $WEBHOOK_URL"

# Dados de teste compatíveis com workflow corrigido
TEST_DATA='{
  "productName": "Creme Hidratante Premium",
  "slogan": "Hidratação que você sente",
  "category": "skincare",
  "benefits": "Fórmula avançada com ácido hialurônico e vitamina E para hidratação profunda",
  "productImage": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
  "userId": "test-user-456",
  "requestId": "test-req-'$(date +%s)'",
  "brandTone": "Clean, natural e confiável",
  "colorTheme": "Tons naturais, verde suave e branco",
  "targetAudience": "Mulheres de 25-45 anos que valorizam skincare natural",
  "stylePreferences": "Fotografia clean, iluminação natural, composição minimalista"
}'

echo "📤 Enviando dados de teste..."
echo "$TEST_DATA" | jq . 2>/dev/null || echo "$TEST_DATA"

echo ""
echo "⏳ Enviando requisição..."

# Fazer requisição
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

# Separar resposta e código HTTP
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

echo "📥 Código HTTP: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Requisição bem-sucedida!"
    echo ""
    echo "📄 Resposta:"
    echo "$HTTP_BODY" | jq . 2>/dev/null || echo "$HTTP_BODY"
    
    # Verificar se a resposta contém imageUrl
    if echo "$HTTP_BODY" | grep -q "imageUrl"; then
        echo ""
        echo "🎉 Workflow funcionando! Imagem gerada com sucesso!"
        
        # Extrair URL da imagem
        IMAGE_URL=$(echo "$HTTP_BODY" | jq -r '.imageUrl' 2>/dev/null)
        if [ "$IMAGE_URL" != "null" ] && [ -n "$IMAGE_URL" ]; then
            echo "🖼️  URL da imagem: $IMAGE_URL"
        fi
    else
        echo ""
        echo "⚠️  Workflow executado mas sem imageUrl na resposta"
    fi
else
    echo "❌ Erro na requisição!"
    echo ""
    echo "📄 Resposta de erro:"
    echo "$HTTP_BODY"
fi

echo ""
echo "🔍 Verifique no n8n:"
echo "   - Se o workflow está ativo"
echo "   - Se as credenciais OpenAI estão configuradas"
echo "   - Logs de execução para mais detalhes"
