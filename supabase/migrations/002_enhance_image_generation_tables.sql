-- Melhorias nas tabelas para suporte completo ao workflow de geração de imagens
-- Adicionar novos campos à tabela image_requests
ALTER TABLE public.image_requests 
ADD COLUMN IF NOT EXISTS theme TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS brand_colors JSONB DEFAULT '{"primary": "#3B82F6", "secondary": "#8B5CF6"}'::jsonb,
ADD COLUMN IF NOT EXISTS style_preferences TEXT,
ADD COLUMN IF NOT EXISTS additional_info TEXT,
ADD COLUMN IF NOT EXISTS n8n_workflow_id TEXT,
ADD COLUMN IF NOT EXISTS n8n_execution_id TEXT,
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS total_credits_used INTEGER DEFAULT 1;

-- Adicionar novos campos à tabela generated_images
ALTER TABLE public.generated_images
ADD COLUMN IF NOT EXISTS format_type TEXT NOT NULL DEFAULT 'instagram_post',
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS generation_prompt TEXT,
ADD COLUMN IF NOT EXISTS processing_time_seconds INTEGER;

-- Criar tabela para templates de prompts
CREATE TABLE IF NOT EXISTS public.prompt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    template TEXT NOT NULL,
    variables JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para configurações de n8n
CREATE TABLE IF NOT EXISTS public.n8n_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    workflow_url TEXT NOT NULL,
    webhook_url TEXT,
    api_key TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para logs de processamento
CREATE TABLE IF NOT EXISTS public.processing_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_request_id UUID REFERENCES public.image_requests(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    status TEXT NOT NULL, -- 'started', 'completed', 'failed'
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualizar triggers para as novas tabelas
CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON public.prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_n8n_configurations_updated_at
    BEFORE UPDATE ON public.n8n_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS para as novas tabelas
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para prompt_templates (público para leitura)
CREATE POLICY "Everyone can view prompt templates" ON public.prompt_templates
    FOR SELECT USING (is_active = true);

-- Políticas de segurança para n8n_configurations
CREATE POLICY "Users can view own n8n configurations" ON public.n8n_configurations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own n8n configurations" ON public.n8n_configurations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own n8n configurations" ON public.n8n_configurations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas de segurança para processing_logs
CREATE POLICY "Users can view own processing logs" ON public.processing_logs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.image_requests 
            WHERE id = processing_logs.image_request_id
        )
    );

-- Inserir templates de prompts padrão
INSERT INTO public.prompt_templates (name, category, template, variables) VALUES
('Instagram Post - Fashion', 'fashion', 
 'Create a professional Instagram post for {{productName}}, a {{category}} product. Style: {{theme}}. Target audience: {{targetAudience}}. Brand colors: {{brandColors}}. Include engaging copy and hashtags.', 
 '{"productName": "", "category": "", "theme": "", "targetAudience": "", "brandColors": ""}'::jsonb),
 
('Instagram Story - Product Showcase', 'general', 
 'Design an Instagram story showcasing {{productName}}. Make it eye-catching with {{theme}} style. Highlight key features and include call-to-action. Brand colors: {{brandColors}}.', 
 '{"productName": "", "theme": "", "brandColors": ""}'::jsonb),
 
('Product Detail Page', 'ecommerce', 
 'Create a detailed product image for {{productName}} suitable for e-commerce. Clean background, professional lighting, show product details clearly. Style: {{theme}}.', 
 '{"productName": "", "theme": ""}'::jsonb),
 
('Facebook Ad Creative', 'advertising', 
 'Design a Facebook ad for {{productName}} targeting {{targetAudience}}. Include compelling copy, clear product image, and strong call-to-action. Style: {{theme}}.', 
 '{"productName": "", "targetAudience": "", "theme": ""}'::jsonb),
 
('Website Banner', 'web', 
 'Create a website banner featuring {{productName}}. Modern design with {{theme}} style. Include product benefits and brand colors: {{brandColors}}.', 
 '{"productName": "", "theme": "", "brandColors": ""}'::jsonb);

-- Adicionar configuração padrão de n8n (exemplo)
-- Esta será configurada individualmente por cada usuário
COMMENT ON TABLE public.n8n_configurations IS 'Configurações de workflows n8n para automação de geração de imagens';
