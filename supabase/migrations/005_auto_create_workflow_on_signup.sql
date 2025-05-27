-- Migração para criar workflow automaticamente quando usuário se registra

-- Atualizar função handle_new_user para criar workflow automático
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_template_id UUID;
    new_workflow_id UUID;
BEGIN
    -- 1. Criar perfil do usuário
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- 2. Buscar template padrão ativo
    SELECT id INTO default_template_id 
    FROM public.n8n_workflow_templates 
    WHERE is_active = true 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- 3. Criar workflow automático se template existir
    IF default_template_id IS NOT NULL THEN
        SELECT clone_n8n_workflow_for_user(NEW.id, default_template_id) INTO new_workflow_id;
        
        -- Log da criação automática
        INSERT INTO public.processing_logs (
            image_request_id,
            step_name,
            status,
            message,
            data
        ) VALUES (
            NULL,
            'auto_workflow_creation',
            'completed',
            'Workflow criado automaticamente no registro',
            json_build_object('user_id', NEW.id, 'template_id', default_template_id, 'workflow_id', new_workflow_id)
        );
    END IF;
    
    -- 4. Adicionar créditos iniciais gratuitos
    INSERT INTO public.credits (user_id, type, amount, description)
    VALUES (NEW.id, 'signup_bonus', 1, 'Crédito gratuito de boas-vindas');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
