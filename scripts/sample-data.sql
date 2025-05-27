-- Exemplo de dados para teste do sistema
-- Execute estes comandos no Supabase Studio ou via SQL

-- Inserir templates de prompt de exemplo
INSERT INTO prompt_templates (name, category, template, variables, is_active) VALUES
('Instagram Post Fashion', 'fashion', 'Create a stylish Instagram post for {{product_name}} targeting {{target_audience}}. Style: {{style_preferences}}. Brand colors: {{brand_colors}}. Theme: {{theme}}', '{"product_name": "Nome do produto", "target_audience": "Público-alvo", "style_preferences": "Preferências de estilo", "brand_colors": "Cores da marca", "theme": "Tema"}', true),
('Product Detail Food', 'food', 'Generate a detailed product image for {{product_name}} showing appetizing details. Target: {{target_audience}}. Style: clean and modern with {{brand_colors}} accents', '{"product_name": "Nome do produto", "target_audience": "Público-alvo", "brand_colors": "Cores da marca"}', true),
('Banner Tech', 'technology', 'Create a professional banner for {{product_name}} tech product. Theme: {{theme}}. Target audience: {{target_audience}}. Include modern elements with {{brand_colors}}', '{"product_name": "Nome do produto", "theme": "Tema", "target_audience": "Público-alvo", "brand_colors": "Cores da marca"}', true),
('Story Beauty', 'beauty', 'Design an elegant Instagram story for {{product_name}} beauty product. Style: {{style_preferences}}. Target: {{target_audience}} with luxurious feel', '{"product_name": "Nome do produto", "style_preferences": "Preferências de estilo", "target_audience": "Público-alvo"}', true),
('E-commerce Thumbnail', 'general', 'Create a compelling thumbnail for {{product_name}} for e-commerce listing. Clean background, focus on product details, {{brand_colors}} theme', '{"product_name": "Nome do produto", "brand_colors": "Cores da marca"}', true);

-- Inserir configurações n8n de exemplo
INSERT INTO n8n_configurations (user_id, base_url, api_key, webhook_url, workflow_id, is_active) VALUES
-- Substitua user_id pelos IDs reais dos usuários
('00000000-0000-0000-0000-000000000000', 'https://demo-n8n.example.com', 'demo_api_key_123', 'https://demo-n8n.example.com/webhook/image-generation', 'image-generation-workflow', true);

-- Inserir exemplos de solicitações de imagem
INSERT INTO image_requests (
    user_id, 
    product_name, 
    category, 
    slogan, 
    image_input_url, 
    theme, 
    target_audience, 
    brand_colors, 
    style_preferences, 
    status
) VALUES
('00000000-0000-0000-0000-000000000000', 'Tênis Esportivo Nike', 'fashion', 'Just Do It', 'https://example.com/nike-shoe.jpg', 'sporty', 'jovens 18-35', '{"primary": "#000000", "secondary": "#FFFFFF"}', '{"mood": "energetic", "style": "modern"}', 'completed'),
('00000000-0000-0000-0000-000000000000', 'Smartphone Galaxy', 'technology', 'Innovation in Your Hands', 'https://example.com/galaxy.jpg', 'modern', 'tech enthusiasts', '{"primary": "#1a1a1a", "secondary": "#0066cc"}', '{"mood": "professional", "style": "minimalist"}', 'processing'),
('00000000-0000-0000-0000-000000000000', 'Café Premium Blend', 'food', 'Wake Up to Excellence', 'https://example.com/coffee.jpg', 'cozy', 'coffee lovers 25-50', '{"primary": "#8B4513", "secondary": "#F5DEB3"}', '{"mood": "warm", "style": "rustic"}', 'failed');

-- Inserir exemplos de imagens geradas
INSERT INTO generated_images (image_request_id, type, image_url, caption) VALUES
-- Para o tênis Nike (assumindo que o ID da solicitação seja conhecido)
((SELECT id FROM image_requests WHERE product_name = 'Tênis Esportivo Nike'), 'instagram_post', 'https://example.com/generated/nike-post.jpg', 'Post Instagram - Tênis Esportivo Nike'),
((SELECT id FROM image_requests WHERE product_name = 'Tênis Esportivo Nike'), 'instagram_story', 'https://example.com/generated/nike-story.jpg', 'Story Instagram - Tênis Esportivo Nike'),
((SELECT id FROM image_requests WHERE product_name = 'Tênis Esportivo Nike'), 'product_detail', 'https://example.com/generated/nike-detail.jpg', 'Detalhe do Produto - Tênis Esportivo Nike'),
((SELECT id FROM image_requests WHERE product_name = 'Tênis Esportivo Nike'), 'banner', 'https://example.com/generated/nike-banner.jpg', 'Banner - Tênis Esportivo Nike'),
((SELECT id FROM image_requests WHERE product_name = 'Tênis Esportivo Nike'), 'thumbnail', 'https://example.com/generated/nike-thumb.jpg', 'Miniatura - Tênis Esportivo Nike');

-- Inserir logs de processamento de exemplo
INSERT INTO processing_logs (image_request_id, step_name, status, message, data) VALUES
((SELECT id FROM image_requests WHERE product_name = 'Tênis Esportivo Nike'), 'workflow_started', 'completed', 'Workflow iniciado com sucesso', '{"timestamp": "2025-05-25T10:00:00Z"}'),
((SELECT id FROM image_requests WHERE product_name = 'Tênis Esportivo Nike'), 'image_analysis', 'completed', 'Análise da imagem concluída', '{"confidence": 0.95, "objects_detected": ["shoe", "nike_logo"]}'),
((SELECT id FROM image_requests WHERE product_name = 'Tênis Esportivo Nike'), 'prompt_generation', 'completed', 'Prompts gerados para 5 tipos de imagem', '{"prompts_generated": 5}'),
((SELECT id FROM image_requests WHERE product_name = 'Tênis Esportivo Nike'), 'ai_generation', 'completed', 'Geração de imagens concluída', '{"images_generated": 5, "processing_time": "2.5 minutes"}'),
((SELECT id FROM image_requests WHERE product_name = 'Smartphone Galaxy'), 'workflow_started', 'completed', 'Workflow iniciado', '{"timestamp": "2025-05-25T11:00:00Z"}'),
((SELECT id FROM image_requests WHERE product_name = 'Smartphone Galaxy'), 'image_analysis', 'running', 'Analisando imagem do produto...', '{}'),
((SELECT id FROM image_requests WHERE product_name = 'Café Premium Blend'), 'workflow_started', 'failed', 'Erro ao iniciar workflow', '{"error": "API key inválida"}');

-- Inserir créditos de exemplo
INSERT INTO credits (user_id, type, amount, description) VALUES
('00000000-0000-0000-0000-000000000000', 'purchase', 10, 'Créditos do plano Starter'),
('00000000-0000-0000-0000-000000000000', 'usage', -1, 'Geração: Tênis Esportivo Nike'),
('00000000-0000-0000-0000-000000000000', 'usage', -1, 'Geração: Smartphone Galaxy'),
('00000000-0000-0000-0000-000000000000', 'bonus', 2, 'Bônus de boas-vindas');
