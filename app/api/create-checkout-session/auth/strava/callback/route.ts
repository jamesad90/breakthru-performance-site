import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: Request) {
  const { userId } = auth();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code || !userId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/analysis?error=unauthorized`);
  }

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();

    // Store tokens in Supabase
    await supabase
      .from('strava_tokens')
      .upsert({
        user_id: userId,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
      }, {
        onConflict: 'user_id'
      });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/analysis?success=true`);
  } catch (error) {
    console.error('Error exchanging Strava code:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/analysis?error=token_exchange`);
  }
}