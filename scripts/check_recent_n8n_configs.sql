-- Verificar configurações N8N criadas
SELECT 
  user_id,
  template_id,
  workflow_id,
  n8n_base_url,
  is_active,
  created_at
FROM n8n_configurations 
ORDER BY created_at DESC 
LIMIT 10;
