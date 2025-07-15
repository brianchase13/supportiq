const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://hpraeernirsdhnbgjrit.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcmFlZXJuaXJzZGhuYmdqcml0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI5Mjc0NywiZXhwIjoyMDY3ODY4NzQ3fQ.ZOvg11ZqxhhquZlF7EfzDfZNSF_DycPX1LTUss8Ob2E';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeUserAdmin(email) {
  try {
    console.log(`Updating user ${email} to admin role...`);
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('id, email, role, updated_at')
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return;
    }

    if (!data) {
      console.error('User not found');
      return;
    }

    console.log('✅ Success! User updated to admin:');
    console.log('ID:', data.id);
    console.log('Email:', data.email);
    console.log('Role:', data.role);
    console.log('Updated at:', data.updated_at);

  } catch (error) {
    console.error('Script error:', error);
  }
}

// Make the user an admin
makeUserAdmin('workwithbrianfarello@gmail.com'); 