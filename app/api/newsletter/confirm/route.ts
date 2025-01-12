import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Confirmation token is required' },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ confirmed: true })
      .eq('confirmation_token', token);

    if (error) throw error;

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/confirmed`);
  } catch (error) {
    console.error('Error confirming subscription:', error);
    return NextResponse.json(
      { error: 'Failed to confirm subscription' },
      { status: 500 }
    );
  }
}