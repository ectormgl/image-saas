-- Migração para criar as tabelas básicas do n8n

-- Criar tabela para armazenar as configurações de integração com n8n
CREATE TABLE IF NOT EXISTS public.n8n_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    workflow_url TEXT NOT NULL,
    api_key TEXT,
    webhook_url TEXT,
    workflow_id TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_n8n_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o campo updated_at
CREATE TRIGGER update_n8n_configurations_updated_at
    BEFORE UPDATE ON public.n8n_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_n8n_configurations_updated_at();

-- Adicionar índice para buscas por usuário
CREATE INDEX idx_n8n_configurations_user_id ON public.n8n_configurations(user_id);

-- Habilitar RLS na tabela
ALTER TABLE public.n8n_configurations ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários possam gerenciar apenas suas próprias configurações
CREATE POLICY "Users can manage their own n8n configurations" ON public.n8n_configurations
    FOR ALL USING (auth.uid() = user_id);

-- Criar política para que administradores possam gerenciar todas as configurações
CREATE POLICY "Admins can manage all n8n configurations" ON public.n8n_configurations
    FOR ALL USING ((auth.jwt()->>'is_admin')::boolean = true);

-- Adicionar comentários na tabela
COMMENT ON TABLE public.n8n_configurations IS 'Armazena as configurações de integração com o n8n para cada usuário';
COMMENT ON COLUMN public.n8n_configurations.workflow_name IS 'Nome do workflow configurado';
COMMENT ON COLUMN public.n8n_configurations.workflow_url IS 'URL base do servidor n8n';
COMMENT ON COLUMN public.n8n_configurations.api_key IS 'Chave API para autenticação com o n8n';
COMMENT ON COLUMN public.n8n_configurations.webhook_url IS 'URL do webhook para executar o workflow';
COMMENT ON COLUMN public.n8n_configurations.workflow_id IS 'ID do workflow no n8n';
COMMENT ON COLUMN public.n8n_configurations.is_active IS 'Indica se esta configuração está ativa';

-- Criar tabela para logs de processamento dos workflows
CREATE TABLE IF NOT EXISTS public.processing_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_request_id UUID NOT NULL REFERENCES public.image_requests(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índice para buscas por solicitação de imagem
CREATE INDEX idx_processing_logs_image_request_id ON public.processing_logs(image_request_id);

-- Habilitar RLS na tabela
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários possam visualizar apenas seus próprios logs
CREATE POLICY "Users can view their own processing logs" ON public.processing_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.image_requests ir
            WHERE ir.id = image_request_id AND ir.user_id = auth.uid()
        )
    );

-- Criar política para que administradores possam gerenciar todos os logs
CREATE POLICY "Admins can manage all processing logs" ON public.processing_logs
    FOR ALL USING ((auth.jwt()->>'is_admin')::boolean = true);

-- Adicionar comentários na tabela
COMMENT ON TABLE public.processing_logs IS 'Armazena logs do processamento de imagens via n8n';
COMMENT ON COLUMN public.processing_logs.image_request_id IS 'ID da solicitação de imagem relacionada';
COMMENT ON COLUMN public.processing_logs.step_name IS 'Nome da etapa do processamento';
COMMENT ON COLUMN public.processing_logs.status IS 'Status da etapa (started, completed, failed, etc.)';
COMMENT ON COLUMN public.processing_logs.message IS 'Mensagem descritiva do log';
COMMENT ON COLUMN public.processing_logs.data IS 'Dados adicionais em formato JSON';
