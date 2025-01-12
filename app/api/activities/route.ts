import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const dateRange = searchParams.get('dateRange') || 'week';
  const activityType = searchParams.get('activityType') || 'all';

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user's Strava tokens
    console.log("fetching activities")
    const { data: tokens } = await supabase
      .from('strava_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!tokens) {
      return NextResponse.json({ error: 'Strava not connected' }, { status: 404 });
    }

    // Check if token needs refresh
    if (tokens.expires_at * 1000 < Date.now()) {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const newTokens = await response.json();

      // Update tokens in database
      await supabase
        .from('strava_tokens')
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: newTokens.expires_at,
        })
        .eq('user_id', userId);

      tokens.access_token = newTokens.access_token;
    }

    // Calculate date range
    const now = new Date();
    let after = new Date();
    switch (dateRange) {
      case 'week':
        after.setDate(now.getDate() - 7);
        break;
      case 'month':
        after.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        after.setFullYear(now.getFullYear() - 1);
        break;
      default:
        after.setDate(now.getDate() - 7);
    }

    // Fetch activities from Strava
    const activities = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${Math.floor(after.getTime() / 1000)}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    ).then(res => res.json());

    // Filter by activity type if specified
    const filteredActivities = activityType === 'all'
      ? activities
      : activities.filter((activity: any) => 
          activity.type.toLowerCase() === activityType.toLowerCase()
        );

    // Calculate statistics
    const stats = filteredActivities.reduce((acc: any, activity: any) => ({
      totalDistance: acc.totalDistance + activity.distance,
      totalTime: acc.totalTime + activity.moving_time,
      totalElevation: acc.totalElevation + activity.total_elevation_gain,
      avgHeartRate: activity.average_heartrate 
        ? acc.avgHeartRate + activity.average_heartrate 
        : acc.avgHeartRate,
      heartRateCount: activity.average_heartrate 
        ? acc.heartRateCount + 1 
        : acc.heartRateCount,
    }), {
      totalDistance: 0,
      totalTime: 0,
      totalElevation: 0,
      avgHeartRate: 0,
      heartRateCount: 0,
    });

    // Format data for chart
    const chartData = Array(7).fill(0);
    filteredActivities.forEach((activity: any) => {
      const date = new Date(activity.start_date);
      const dayIndex = date.getDay();
      chartData[dayIndex] += activity.distance / 1000; // Convert to km
    });

    return NextResponse.json({
      activities: filteredActivities,
      stats: {
        ...stats,
        avgHeartRate: stats.heartRateCount > 0 
          ? Math.round(stats.avgHeartRate / stats.heartRateCount) 
          : 0,
      },
      chartData,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}