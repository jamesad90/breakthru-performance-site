import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    // Generate tokens
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Insert subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        email,
        name,
        confirmation_token: confirmationToken,
        unsubscribe_token: unsubscribeToken,
      }]);

    if (error) throw error;

    // Here you would typically send a confirmation email
    // For now, we'll just return success
    return NextResponse.json({ 
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}