// Test script para testar signup
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ibrywlgszctqthddiknt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicnl3bGdzemN0cXRoZGRpa250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjE3ODQsImV4cCI6MjA2MzY5Nzc4NH0.ENmovJ4olXKn2iHQnnsd3JjeAXWOvITQsiIsS8tHt6A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSignup() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' });
    console.log('Connection test:', { data, error });
    
    // Test signup
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'password123';
    const testName = 'Test User';
    
    console.log('Testing signup with:', { testEmail, testName });
    
    const signupResult = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
        },
      },
    });
    
    console.log('Signup result:', signupResult);
    
    if (signupResult.error) {
      console.error('Signup error:', signupResult.error);
    } else {
      console.log('Signup successful!');
      
      // Check if profile was created
      setTimeout(async () => {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signupResult.data.user?.id)
          .single();
        
        console.log('Profile check:', { profile, profileError });
      }, 2000);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testSignup();
