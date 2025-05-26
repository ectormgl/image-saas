-- Verificar todos os perfis criados
SELECT 
  id,
  name,
  email,
  created_at,
  business_name,
  category
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;
