# 🚀 Guia de Configuração N8N - Workflow Compartilhado

## ⚠️ Problema Identificado

O sistema estava tentando criar workflows individuais para cada usuário durante o registro, mas:

1. **URL Placeholder**: Usando `https://n8n.seudominio.com` (não real)
2. **Função Incompleta**: `clone_n8n_workflow_for_user` não estava implementada corretamente
3. **Complexidade Desnecessária**: Criar workflows individuais é complexo e pode causar problemas

## ✅ Solução Implementada: Workflow Compartilhado

### Abordagem Escolhida
- **Um único workflow** no N8N para todos os usuários
- **Dados do usuário** são passados via webhook
- **Configuração simples** e fácil de manter
- **Escalável** e confiável

### O que foi alterado:

1. **Nova Migração**: `008_shared_workflow_approach.sql`
2. **Função Atualizada**: `handle_new_user()` agora configura workflow compartilhado
3. **Script de Configuração**: Para facilitar a aplicação

## 🔧 Como Aplicar a Solução

### Passo 1: Aplicar a Migração

```bash
# Navegue para o diretório do projeto
cd /workspaces/image-saas

# Execute o script de configuração com sua URL real do N8N
./scripts/configure-n8n-shared.sh https://sua-url-real-do-n8n.com
```

**Exemplo:**
```bash
./scripts/configure-n8n-shared.sh https://n8n.minhaempresa.com
```

### Passo 2: Configurar o N8N

No seu N8N, você precisa:

1. **Criar/Configurar um workflow** com ID: `image-generation-workflow`
2. **Configurar um webhook** que aceite dados em: `/webhook/image-generation-workflow`
3. **Processar os dados** que chegam via webhook

### Passo 3: Estrutura de Dados do Webhook

O webhook receberá dados neste formato:

```json
{
  "imageRequestId": "uuid-da-solicitacao",
  "productName": "Nome do Produto",
  "slogan": "Slogan do produto",
  "category": "categoria",
  "benefits": "Benefícios do produto",
  "productImage": "url-da-imagem-no-supabase",
  "userId": "uuid-do-usuario",
  "requestId": "identificador-unico",
  "brandTone": "tom-da-marca",
  "colorTheme": "tema-de-cores",
  "targetAudience": "publico-alvo",
  "stylePreferences": "preferencias-de-estilo",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🔄 Como Funciona Agora

### Durante o Registro de Usuário:
1. ✅ Perfil criado
2. ✅ Créditos iniciais adicionados
3. ✅ **Configuração de workflow compartilhado** criada automaticamente
4. ✅ Log da operação registrado

### Durante a Geração de Imagem:
1. Usuario faz upload da imagem
2. Preenche o formulário
3. Sistema envia dados para o webhook do N8N
4. N8N processa e retorna resultado
5. Sistema salva e exibe para o usuário

## 🛠️ Comandos Úteis

### Atualizar URL do N8N
Se você precisar mudar a URL do N8N no futuro:

```sql
SELECT update_n8n_url('https://nova-url-do-n8n.com');
```

### Verificar Configurações
```sql
-- Ver templates ativos
SELECT * FROM n8n_workflow_templates WHERE is_active = true;

-- Ver configurações dos usuários
SELECT 
    u.email,
    nc.workflow_name,
    nc.workflow_url,
    nc.webhook_url,
    nc.is_active
FROM n8n_configurations nc
JOIN auth.users u ON u.id = nc.user_id;
```

## 🔍 Resolução de Problemas

### Se o workflow não for criado durante o registro:
1. Verifique se existe um template ativo: `SELECT * FROM n8n_workflow_templates WHERE is_active = true;`
2. Verifique os logs: `SELECT * FROM processing_logs WHERE step_name = 'shared_workflow_setup';`

### Se a URL estiver errada:
```sql
SELECT update_n8n_url('https://url-correta.com');
```

### Se quiser recriar configurações para usuários existentes:
```sql
-- Apagar configurações antigas
DELETE FROM n8n_configurations;

-- Para cada usuário, a configuração será recriada no próximo login
-- Ou execute manualmente:
INSERT INTO n8n_configurations (user_id, workflow_name, workflow_url, webhook_url, is_active, template_workflow_id)
SELECT 
    u.id,
    'Workflow Compartilhado - Geração de Imagens',
    t.n8n_base_url,
    t.n8n_base_url || '/webhook/' || t.workflow_id,
    true,
    t.workflow_id
FROM auth.users u
CROSS JOIN n8n_workflow_templates t 
WHERE t.is_active = true;
```

## 🎯 Vantagens desta Abordagem

1. **Simplicidade**: Um workflow para gerenciar
2. **Manutenção**: Fácil de atualizar e manter
3. **Escalabilidade**: Suporta muitos usuários
4. **Confiabilidade**: Menos pontos de falha
5. **Flexibilidade**: Dados do usuário passados via webhook permitem personalização

## 📞 Próximos Passos

1. Execute o script de configuração
2. Configure seu workflow no N8N
3. Teste criando um novo usuário
4. Verifique se o workflow é configurado automaticamente
5. Teste a geração de imagem

Se tiver problemas, verifique os logs no Supabase e no N8N.
