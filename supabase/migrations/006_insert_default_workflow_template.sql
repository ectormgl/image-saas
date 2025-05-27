-- Inserir template padrão de workflow para auto-criação

-- Inserir template padrão se não existir
INSERT INTO public.n8n_workflow_templates (
    name,
    description,
    workflow_json,
    default_workflow_url,
    default_api_key,
    template_workflow_id,
    is_active,
    category
) 
SELECT 
    'Template Padrão - Geração de Imagens',
    'Template padrão para geração automática de imagens de marketing usando IA. Configure VITE_N8N_TEMPLATE_WORKFLOW_ID no .env com o ID do seu workflow no n8n.',
    '{
        "nodes": [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "generate-images",
                    "responseMode": "responseNode"
                },
                "id": "webhook-1",
                "name": "Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [240, 300]
            },
            {
                "parameters": {
                    "model": "dall-e-3",
                    "prompt": "=Professional marketing image for {{$json.productName}} in {{$json.theme}} style, {{$json.stylePreferences}}, high quality, commercial use",
                    "size": "1024x1024",
                    "quality": "hd"
                },
                "id": "openai-1",
                "name": "OpenAI DALL-E",
                "type": "n8n-nodes-base.openAi",
                "typeVersion": 1,
                "position": [460, 300]
            },
            {
                "parameters": {
                    "respondWith": "json",
                    "responseBody": "={{ { images: [$json.data.map(item => item.url)] } }}"
                },
                "id": "respond-1",
                "name": "Respond to Webhook",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [680, 300]
            }
        ],
        "connections": {
            "Webhook": {
                "main": [
                    [
                        {
                            "node": "OpenAI DALL-E",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            },
            "OpenAI DALL-E": {
                "main": [
                    [
                        {
                            "node": "Respond to Webhook",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        }
    }'::jsonb,
    'http://localhost:5678',
    '',
    'TEMPLATE_FROM_ENV',  -- Placeholder para ser substituído pelo valor real
    true,
    'marketing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.n8n_workflow_templates 
    WHERE name = 'Template Padrão - Geração de Imagens'
);

-- Comentários da migração
COMMENT ON TABLE public.n8n_workflow_templates IS 'Templates de workflows n8n que podem ser clonados para usuários';
