-- Correção simplificada para o erro de signup
-- Execute este SQL no Supabase Studio > SQL Editor

-- 1. Criar uma versão mais robusta da função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Apenas criar o perfil do usuário (essencial)
    -- Todo o resto é opcional e não deve bloquear o signup
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- Tentar adicionar créditos iniciais (não crítico)
    BEGIN
        INSERT INTO public.credits (user_id, type, amount, description)
        VALUES (NEW.id, 'signup_bonus', 1, 'Crédito gratuito de boas-vindas');
    EXCEPTION 
        WHEN undefined_table THEN 
            -- Tabela credits não existe ainda
            NULL;
        WHEN OTHERS THEN
            -- Outros erros, mas não bloqueia o signup
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
