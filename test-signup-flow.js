// Test signup flow to check if credits are being created
// This will help us verify if the SQL fix was applied

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibrywlgszctqthddiknt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicnl3bGdzemN0cXRoZGRpa250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODQsImV4cCI6MjA2MzY5Nzc4NH0.ENmovJ4olXKn2iHQnnsd3JjeAXWOvITQsiIsS8tHt6A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignupFlow() {
  console.log('🧪 Testing signup flow and credits creation...');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    // 1. Create test user
    console.log('👤 Creating test user:', testEmail);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }
    
    console.log('✅ User created successfully:', authData.user?.id);
    
    // Wait a moment for triggers to execute
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Check if profile was created
    console.log('📋 Checking profile creation...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile not found:', profileError.message);
    } else {
      console.log('✅ Profile created:', profile);
    }
    
    // 3. Check if credits were created
    console.log('💳 Checking credits creation...');
    const { data: credits, error: creditsError } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', authData.user?.id);
    
    if (creditsError) {
      console.log('❌ Error checking credits:', creditsError.message);
    } else if (credits && credits.length > 0) {
      console.log('✅ Credits created:', credits);
      console.log('💰 Total credits amount:', credits.reduce((sum, c) => sum + c.amount, 0));
    } else {
      console.log('❌ No credits found for user');
    }
    
    // 4. Check if N8N configuration was created
    console.log('🔧 Checking N8N configuration...');
    const { data: n8nConfig, error: n8nError } = await supabase
      .from('n8n_configurations')
      .select('*')
      .eq('user_id', authData.user?.id);
    
    if (n8nError) {
      console.log('❌ Error checking N8N config:', n8nError.message);
    } else if (n8nConfig && n8nConfig.length > 0) {
      console.log('✅ N8N configuration created:', n8nConfig);
    } else {
      console.log('⚠️ No N8N configuration found (this might be expected if template not configured)');
    }
    
    // 5. Cleanup - delete test user (optional)
    console.log('🧹 Cleaning up test user...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user?.id);
    if (deleteError) {
      console.log('⚠️ Could not delete test user (this is normal):', deleteError.message);
    } else {
      console.log('✅ Test user cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSignupFlow().then(() => {
  console.log('🏁 Signup flow test completed');
}).catch(console.error);
