// Quick test to verify the webhook fix
// This script tests the N8N webhook URL directly

const WEBHOOK_URL = 'https://primary-production-8c118.up.railway.app/webhook/generate-image';

const testData = {
  imageRequestId: 'test-' + Date.now(),
  productName: 'Teste Produto',
  slogan: 'Um slogan fantástico',
  category: 'beauty',
  benefits: 'Benefícios incríveis',
  productImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
  userId: 'test-user-123',
  requestId: 'req-' + Date.now(),
  brandTone: 'Luxuoso e elegante',
  colorTheme: 'Dourado e preto',
  targetAudience: 'Adultos jovens premium',
  stylePreferences: 'Minimalista com toques dourados',
  timestamp: new Date().toISOString()
};

console.log('🚀 Testing webhook URL:', WEBHOOK_URL);
console.log('📤 Test data:', JSON.stringify(testData, null, 2));

fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Response status:', response.status);
  console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
})
.then(result => {
  console.log('✅ Webhook test successful!');
  console.log('📄 Response:', JSON.stringify(result, null, 2));
  
  if (result.imageUrl) {
    console.log('🖼️ Image generated:', result.imageUrl);
  }
})
.catch(error => {
  console.error('❌ Webhook test failed:', error);
  console.log('');
  console.log('💡 Possible issues:');
  console.log('  - N8N instance might be offline');
  console.log('  - Webhook path might be incorrect');
  console.log('  - N8N workflow might not be active');
  console.log('  - OpenAI credentials might be missing');
});
