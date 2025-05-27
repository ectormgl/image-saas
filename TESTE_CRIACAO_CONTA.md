# 🧪 GUIA DE TESTE - Criação de Conta com Workflow N8N

## 📋 Pré-Requisitos

1. ✅ Aplicação rodando em: http://localhost:8080
2. ✅ Script `complete_n8n_setup.sql` executado no Supabase
3. ✅ URL do N8N configurada: `https://primary-production-8c118.up.railway.app`

## 🔍 Passo 1: Verificação Pré-Teste

**Execute este comando no SQL Editor do Supabase:**
```sql
-- Copie e cole o conteúdo do arquivo: verify_before_test.sql
```

**O que verificar:**
- ✅ Template de workflow ativo existe
- ✅ Função `handle_new_user` existe  
- ✅ Trigger `on_auth_user_created` existe
- ✅ Todas as tabelas necessárias existem

## 🎯 Passo 2: Teste de Criação de Conta

### 2.1 Acessar a Aplicação
1. Abra: http://localhost:8080
2. Clique em **"Criar Conta"** ou **"Sign Up"**

### 2.2 Preencher Dados de Teste
Use estes dados para o teste:
```
Nome: João Teste Workflow  
Email: joao.teste.workflow@exemplo.com
Senha: MinhaSenh@123!
```

### 2.3 Completar o Registro
1. Preencha o formulário
2. Clique em **"Criar Conta"**
3. **Aguarde a confirmação**
4. Se solicitado, confirme o email (depende da configuração do Supabase)

## 🔍 Passo 3: Verificação Pós-Teste

**Imediatamente após criar a conta, execute este comando no SQL Editor:**
```sql
-- Copie e cole o conteúdo do arquivo: verify_after_test.sql
```

**O que verificar:**
- ✅ Usuário criado na tabela `auth.users`
- ✅ Perfil criado na tabela `profiles`  
- ✅ Configuração de workflow criada na tabela `n8n_configurations`
- ✅ Créditos iniciais adicionados na tabela `credits`
- ✅ Log de sucesso na tabela `processing_logs`

## 📊 Resultados Esperados

### ✅ Sucesso Total
Se tudo funcionou, você verá:
```
Perfil Criado: Sim ✓
Workflow Configurado: Sim ✓  
Créditos Criados: Sim ✓
Logs de Criação: shared_workflow_setup completed
URL do Webhook: URL correta ✓
```

### ⚠️ Sucesso Parcial
Se algumas coisas funcionaram:
```
Perfil Criado: Sim ✓
Workflow Configurado: Não ✗  
Créditos Criados: Sim ✓
```
**Solução:** Execute novamente `complete_n8n_setup.sql`

### ❌ Falha Total  
Se nada funcionou:
```
Perfil Criado: Não ✗
Workflow Configurado: Não ✗
Créditos Criados: Não ✗
```
**Solução:** Verifique se a migração foi aplicada corretamente

## 🔧 Comandos Úteis Durante o Teste

### Ver logs em tempo real:
```sql
SELECT * FROM processing_logs 
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;
```

### Ver último usuário criado:
```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;
```

### Ver configuração do último usuário:
```sql
WITH ultimo_usuario AS (
    SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1
)
SELECT nc.* FROM n8n_configurations nc
JOIN ultimo_usuario u ON nc.user_id = u.id;
```

## 🎯 Próximos Testes (Se Passo 3 for Sucesso)

### Teste 4: Login com a Nova Conta
1. Faça logout (se logado)
2. Faça login com: `joao.teste.workflow@exemplo.com`
3. Verifique se o dashboard carrega

### Teste 5: Upload de Imagem
1. No dashboard, vá para "Criar Imagem"  
2. Faça upload de uma imagem de teste
3. Preencha o formulário
4. **NÃO clique em gerar ainda** (só se o N8N estiver configurado)

### Teste 6: Verificar Workflow no N8N
1. Acesse: https://primary-production-8c118.up.railway.app
2. Verifique se existe workflow com ID: `image-generation-workflow`
3. Configure o webhook: `/webhook/image-generation-workflow`

## 🚨 Resolução de Problemas

### Problema: "Database error while saving new user"
**Solução:**
1. Execute `complete_n8n_setup.sql` novamente
2. Verifique se todas as tabelas existem
3. Teste com novo email

### Problema: Workflow não é criado  
**Solução:**
1. Verifique se o template está ativo: `SELECT * FROM n8n_workflow_templates WHERE is_active = true;`
2. Verifique logs: `SELECT * FROM processing_logs WHERE step_name = 'shared_workflow_setup';`

### Problema: URL do webhook incorreta
**Solução:**
```sql
SELECT update_n8n_url('https://primary-production-8c118.up.railway.app');
```

## 📝 Checklist Final

- [ ] Script pré-teste executado
- [ ] Conta criada com sucesso  
- [ ] Script pós-teste executado
- [ ] Todos os status mostram ✓
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Configuração do N8N verificada

---

**🎉 Se todos os checkboxes estão marcados, sua configuração está funcionando perfeitamente!**
