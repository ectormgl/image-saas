# CORREÇÃO URGENTE: Erro de Signup "Database error saving new user"

## ❌ PROBLEMA IDENTIFICADO
O erro `Database error saving new user` está acontecendo devido a uma falha no trigger `handle_new_user()` da base de dados. O trigger está tentando executar operações que falham e bloqueiam o signup.

## ✅ SOLUÇÃO IMEDIATA

### PASSO 1: Acesse o Supabase Studio
1. Abra https://supabase.com/dashboard/project/ibrywlgszctqthddiknt
2. Vá para **SQL Editor**

### PASSO 2: Execute o SQL de Correção
Copie e execute o seguinte SQL no editor:

```sql
-- CORREÇÃO PARA ERRO DE SIGNUP
-- Remove o trigger problemático e cria uma versão simplificada

-- 1. Remover trigger existente que está falhando
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Criar função mais robusta e simples
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Apenas criar o perfil básico (essencial)
    -- Remover todas as operações extras que podem falhar
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Se até mesmo a criação do perfil falhar, não bloquear o signup
    RAISE NOTICE 'Falha ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar o trigger apenas com o essencial
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### PASSO 3: Verificar Correção
Após executar o SQL, teste o signup novamente na aplicação.

## 🔄 TESTE APÓS CORREÇÃO

Execute este comando para testar:
```bash
cd /workspaces/image-saas && node test-signup.js
```

## 📋 STATUS ATUAL

- ✅ **Problema identificado**: Trigger `handle_new_user()` falhando
- ✅ **Solução criada**: Função simplificada sem operações críticas  
- ❌ **Correção aplicada**: PENDENTE - precisa executar o SQL acima
- ❌ **Teste de signup**: PENDENTE - após aplicar correção

## 🎯 PRÓXIMOS PASSOS APÓS CORREÇÃO

1. **Testar signup** - Verificar se usuários conseguem se registrar
2. **Implementar créditos** - Adicionar lógica de créditos iniciais no frontend
3. **Configurar workflows** - Implementar criação automática de workflows
4. **Testar fluxo completo** - Verificar integração com n8n

## 🚨 NOTA IMPORTANTE

Esta é uma correção de emergência que foca em restaurar a funcionalidade básica de signup. As funcionalidades extras (créditos iniciais, workflows automáticos) serão implementadas de forma mais robusta posteriormente.
