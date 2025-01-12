import { NextResponse } from 'next/server';

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/strava/callback`;

export async function GET() {
  const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=activity:read_all`;
  
  return NextResponse.redirect(stravaAuthUrl);
}