// Script para aplicar migração 007 no Supabase remoto
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = "https://ibrywlgszctqthddiknt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicnl3bGdzemN0cXRoZGRpa250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODQsImV4cCI6MjA2MzY5Nzc4NH0.ENmovJ4olXKn2iHQnnsd3JjeAXWOvITQsiIsS8tHt6A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyMigration() {
  console.log('Aplicando migração 007_fix_signup_error.sql...');
  
  try {
    // Ler o arquivo de migração
    const migrationSQL = readFileSync('/workspaces/image-saas/supabase/migrations/007_fix_signup_error.sql', 'utf8');
    
    console.log('Executando SQL...');
    
    // Aplicar a migração usando rpc
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('Erro ao aplicar migração:', error);
      
      // Tentar executar partes específicas da migração
      console.log('Tentando aplicar apenas a função handle_new_user...');
      
      const handleNewUserFunction = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_template_id UUID;
    new_workflow_id UUID;
BEGIN
    -- 1. Criar perfil do usuário (essencial)
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- 2. Tentar adicionar créditos iniciais (se tabela existir)
    BEGIN
        INSERT INTO public.credits (user_id, type, amount, description)
        VALUES (NEW.id, 'signup_bonus', 1, 'Crédito gratuito de boas-vindas');
    EXCEPTION WHEN OTHERS THEN
        -- Se falhar, apenas log o erro (não bloqueia o signup)
        RAISE NOTICE 'Falha ao criar créditos iniciais para usuário %: %', NEW.id, SQLERRM;
    END;
    
    -- 3. Tentar criar workflow automático (se possível)
    BEGIN
        -- Buscar template padrão ativo
        SELECT id INTO default_template_id 
        FROM public.n8n_workflow_templates 
        WHERE is_active = true 
        ORDER BY created_at ASC 
        LIMIT 1;
        
        -- Criar workflow automático se template existir
        IF default_template_id IS NOT NULL THEN
            SELECT clone_n8n_workflow_for_user(NEW.id, default_template_id) INTO new_workflow_id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Se falhar, apenas log o erro (não bloqueia o signup)
        RAISE NOTICE 'Falha ao criar workflow automático para usuário %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;
      
      // Executar usando uma query SQL direta
      const result = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ query: handleNewUserFunction })
      });
      
      console.log('Resultado da execução direta:', await result.text());
      
    } else {
      console.log('Migração aplicada com sucesso!', data);
    }
    
  } catch (error) {
    console.error('Erro na aplicação da migração:', error);
  }
}

applyMigration();
