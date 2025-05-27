-- Criação das tabelas básicas do sistema

-- Criar tabela de solicitações de imagens
CREATE TABLE IF NOT EXISTS public.image_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    category TEXT,
    slogan TEXT,
    image_input_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de imagens geradas
CREATE TABLE IF NOT EXISTS public.generated_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_request_id UUID NOT NULL REFERENCES public.image_requests(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    format_type TEXT NOT NULL DEFAULT 'square',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de créditos do usuário
CREATE TABLE IF NOT EXISTS public.credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'signup_bonus', 'usage')),
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_image_requests_user_id ON public.image_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_image_requests_status ON public.image_requests(status);
CREATE INDEX IF NOT EXISTS idx_generated_images_request_id ON public.generated_images(image_request_id);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON public.credits(user_id);

-- Habilitar RLS
ALTER TABLE public.image_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own image requests" ON public.image_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own image requests" ON public.image_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own image requests" ON public.image_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their generated images" ON public.generated_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.image_requests ir 
            WHERE ir.id = image_request_id AND ir.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert generated images" ON public.generated_images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own credits" ON public.credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage credits" ON public.credits
    FOR ALL USING (true);
