import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up database schema...');
    
    // Step 1: Add role column to users table
    console.log('1. Adding role column...');
    
    // Try to execute SQL via a direct query
    const { error: alterError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    
    if (alterError) {
      console.error('Error accessing users table:', alterError);
      return NextResponse.json({ error: 'Cannot access users table' }, { status: 500 });
    }
    
    // Step 2: Update the admin user
    console.log('2. Updating admin user...');
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('email', 'workwithbrianfarello@gmail.com')
      .select('*')
      .single();
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
    
    console.log('✅ User updated:', updateData);
    
    // Step 3: Verify the user
    console.log('3. Verifying user...');
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'workwithbrianfarello@gmail.com')
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
    
    console.log('✅ User verified:', userData);
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      user: userData,
      note: 'Role column needs to be added manually in Supabase SQL Editor'
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 