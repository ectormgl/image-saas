# 🔧 Como Adaptar Seu Workflow N8n para a Aplicação SaaS

## 📋 Passos para Adaptação

### 1. **Abrir o Workflow no N8n**
1. Acesse sua instância n8n: `https://primary-production-8c118.up.railway.app/`
2. Abra o workflow "AGENT MARKETING" (ID: LAe3gsTKSMaKWegC)

### 2. **Substituir o FormTrigger por Webhook**

**REMOVER:**
```json
{
  "type": "n8n-nodes-base.formTrigger",
  "name": "On form submission"
}
```

**ADICIONAR:**
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "generate-image",
    "options": {
      "rawBody": false
    }
  },
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1.1,
  "position": [0, 0],
  "id": "webhook-trigger-new",
  "name": "Webhook Trigger"
}
```

### 3. **Adaptar o Edit Fields Node**

**SUBSTITUIR o conteúdo do "Edit Fields":**
```json
{
  "parameters": {
    "mode": "raw",
    "jsonOutput": "={\n  \"brandName\": \"{{ $json.brandName || 'Sua Marca' }}\",\n  \"slogan\": \"{{ $json.slogan }}\",\n  \"categoryType\": \"{{ $json.category }}\",\n  \"benefits\": \"{{ $json.benefits }}\",\n  \"brandTone\": \"{{ $json.brandTone || 'Elegante e moderno' }}\",\n  \"colorTheme\": \"{{ $json.colorTheme || 'Cores neutras e sofisticadas' }}\",\n  \"backgroundStyle\": \"Fundos limpos e elegantes\",\n  \"lightningStyle\": \"Iluminação suave e profissional\",\n  \"productPlacement\": \"Produto centralizado em superfície elegante\",\n  \"typhograpyStyle\": \"Tipografia moderna e legível\",\n  \"compositionGuidelines\": \"Composição equilibrada e atrativa\",\n  \"requestId\": \"{{ $json.requestId }}\",\n  \"userId\": \"{{ $json.userId }}\"\n}",
    "options": {}
  },
  "type": "n8n-nodes-base.set",
  "name": "Edit Fields"
}
```

### 4. **Remover Google Drive Node**
- Deletar o node "Google Drive"
- Conectar "Edit Fields" diretamente ao "AI Agent"

### 5. **Simplificar o Workflow**
**Novo fluxo:**
```
Webhook Trigger → Edit Fields → AI Agent → OpenAI → Response Node
```

### 6. **Adicionar Response Node**
**No final do workflow, adicionar:**
```json
{
  "parameters": {
    "mode": "raw",
    "jsonOutput": "={\n  \"success\": true,\n  \"requestId\": \"{{ $('Edit Fields').item.json.requestId }}\",\n  \"imageUrl\": \"{{ $('OpenAI1').item.json.data[0].url }}\",\n  \"prompt\": \"{{ $('AI Agent').item.json.text }}\",\n  \"timestamp\": \"{{ $now }}\",\n  \"userId\": \"{{ $('Edit Fields').item.json.userId }}\"\n}",
    "options": {}
  },
  "type": "n8n-nodes-base.set",
  "name": "Format Response"
}
```

### 7. **Atualizar Conexões**
```
Webhook Trigger → Edit Fields → AI Agent → OpenAI1 → Format Response
```

### 8. **Configurar Webhook URL**
Após salvar o workflow, copie a URL do webhook que será algo como:
```
https://primary-production-8c118.up.railway.app/webhook/generate-image
```

### 9. **Atualizar .env**
```bash
# Atualizar com o ID real do workflow adaptado
VITE_N8N_TEMPLATE_WORKFLOW_ID=seu-novo-workflow-id
```

## 🧪 Como Testar

### 1. **Teste Manual via Webhook**
```bash
curl -X POST https://primary-production-8c118.up.railway.app/webhook/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Perfume Premium",
    "slogan": "Elegância em cada borrifo",
    "category": "beauty",
    "benefits": "Fragrância duradoura e sofisticada",
    "productImage": "https://example.com/image.jpg",
    "userId": "test-user",
    "requestId": "test-req-123",
    "brandTone": "Luxuoso e elegante",
    "colorTheme": "Dourado e preto"
  }'
```

### 2. **Verificar Resposta**
A resposta deve ser algo como:
```json
{
  "success": true,
  "requestId": "test-req-123",
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "prompt": "...",
  "timestamp": "2025-01-25T...",
  "userId": "test-user"
}
```

## 📝 Campos Esperados pela Aplicação

### Campos Obrigatórios:
- `productName`: Nome do produto
- `category`: Categoria do produto  
- `benefits`: Benefícios/descrição
- `userId`: ID do usuário
- `requestId`: ID único da requisição

### Campos Opcionais:
- `slogan`: Slogan customizado
- `brandTone`: Tom da marca
- `colorTheme`: Tema de cores
- `targetAudience`: Público-alvo
- `stylePreferences`: Preferências de estilo

## 🚀 Próximos Passos

1. **Fazer as adaptações no n8n**
2. **Testar o webhook manualmente**
3. **Atualizar o ID do workflow no .env**
4. **Testar na aplicação SaaS**
5. **Verificar o debug panel para status**

## 🔍 Debug

Para debugar problemas:

1. **Ver logs no n8n**: Abra o workflow e veja execuções
2. **Debug panel**: Acesse o painel de debug na aplicação
3. **Console do navegador**: Verifique logs de execução
4. **Network tab**: Veja requisições para o n8n

## ⚠️ Pontos Importantes

- **Webhook Path**: Use `/generate-image` como path
- **Timeout**: O workflow pode demorar 1-3 minutos
- **Credenciais**: Certifique-se que OpenAI API está configurada
- **Imagens**: URLs devem ser públicas e acessíveis
