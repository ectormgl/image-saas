-- Migração para suportar a criação de workflows individuais para cada usuário

-- Atualizar a tabela n8n_configurations para incluir campos necessários para clonagem de workflows
ALTER TABLE public.n8n_configurations 
ADD COLUMN IF NOT EXISTS template_workflow_id TEXT,
ADD COLUMN IF NOT EXISTS cloned_workflow_id TEXT,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- Criar uma nova tabela para armazenar os detalhes do templato e de workflow
CREATE TABLE IF NOT EXISTS public.n8n_workflow_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    workflow_id TEXT NOT NULL,
    n8n_base_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_n8n_workflow_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_n8n_workflow_templates_updated_at
    BEFORE UPDATE ON public.n8n_workflow_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS na nova tabela
ALTER TABLE public.n8n_workflow_templates ENABLE ROW LEVEL SECURITY;

-- Adicionar permissões para administradores
CREATE POLICY "Admins can manage workflow templates" ON public.n8n_workflow_templates
    USING (auth.jwt() ? 'is_admin' && auth.jwt() : 'is_admin' = 'true');

-- Criar política para que todos os usuários possam visualizar templates ativos
CREATE POLICY "Users can view active workflow templates" ON public.n8n_workflow_templates
    FOR SELECT USING (is_active = true);

-- Criar função para clonar um workflow para um usuário
CREATE OR REPLACE FUNCTION clone_n8n_workflow_for_user(
    user_id UUID,
    template_id UUID
)
RETURNS UUID AS $$
DECLARE
    template_record RECORD;
    new_config_id UUID;
BEGIN
    -- Obter informações do template
    SELECT * INTO template_record FROM public.n8n_workflow_templates WHERE id = template_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template de workflow não encontrado';
    END IF;
    
    -- Inserir nova configuração para o usuário
    INSERT INTO public.n8n_configurations (
        user_id,
        workflow_name,
        workflow_url,
        api_key,
        is_active,
        template_workflow_id,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        template_record.name || ' (Clonado)',
        template_record.n8n_base_url,
        '', -- API key será configurada pelo usuário
        true,
        template_record.workflow_id,
        NOW(),
        NOW()
    )
    RETURNING id INTO new_config_id;
    
    RETURN new_config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir um template de workflow padrão
INSERT INTO public.n8n_workflow_templates (
    name, 
    description, 
    workflow_id, 
    n8n_base_url, 
    is_active
)
VALUES (
    'Geração de Imagens de Marketing',
    'Workflow padrão para geração de imagens de marketing usando IA',
    'image-generation-workflow',
    'https://n8n.seudominio.com',
    true
)
ON CONFLICT DO NOTHING;

-- Comentários de tabelas
COMMENT ON TABLE public.n8n_workflow_templates IS 'Templates de workflows n8n que podem ser clonados para usuários';
COMMENT ON COLUMN public.n8n_configurations.template_workflow_id IS 'ID do workflow template original usado para criar este workflow';
COMMENT ON COLUMN public.n8n_configurations.cloned_workflow_id IS 'ID do novo workflow clonado para o usuário';
COMMENT ON COLUMN public.n8n_configurations.last_sync_at IS 'Última vez que o workflow foi sincronizado com o template';
