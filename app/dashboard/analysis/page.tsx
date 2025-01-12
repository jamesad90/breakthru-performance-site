'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Activity, Calendar, TrendingUp, Timer, Heart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalysisPage() {
    const { user } = useUser();
    const [dateRange, setDateRange] = useState('week');
    const [activityType, setActivityType] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      fetchActivities();
    }, [dateRange, activityType]);
  
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
  
      try {
        const response = await fetch(
          `/api/activities?dateRange=${dateRange}&activityType=${activityType}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
  
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
  
    const chartData = {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [{
        label: 'Distance (km)',
        data: data?.chartData || Array(7).fill(0),
        borderColor: '#FF7F5C',
        backgroundColor: 'rgba(255, 127, 92, 0.1)',
        fill: true,
      }],
    };
  
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
  
    if (isLoading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F5C]"></div>
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
                <p className="text-gray-600">{error}</p>
                <Button 
                  onClick={fetchActivities} 
                  className="mt-4 bg-[#FF7F5C] hover:bg-[#FF7F5C]/90"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FF7F5C] mb-4">Training Analysis</h1>
        
        {/* Connection Status */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className={`border-2 ${isStravaConnected ? 'border-green-500' : 'border-gray-300'}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold mb-2">Strava Connection</h3>
                  <p className="text-sm text-gray-600">
                    {isStravaConnected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                <Button 
                  onClick={connectStrava}
                  className={isStravaConnected ? 'bg-green-500' : 'bg-[#FF7F5C]'}
                >
                  {isStravaConnected ? 'Connected' : 'Connect Strava'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-2 ${isGarminConnected ? 'border-green-500' : 'border-gray-300'}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold mb-2">Garmin Connection</h3>
                  <p className="text-sm text-gray-600">
                    {isGarminConnected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                <Button 
                  onClick={connectGarmin}
                  className={isGarminConnected ? 'bg-green-500' : 'bg-[#FF7F5C]'}
                >
                  {isGarminConnected ? 'Connected' : 'Connect Garmin'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
      <div className="flex gap-4 mb-8">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={activityType} onValueChange={setActivityType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="run">Running</SelectItem>
            <SelectItem value="ride">Cycling</SelectItem>
            <SelectItem value="swim">Swimming</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#FF7F5C]/10 rounded-full">
                <Activity className="h-6 w-6 text-[#FF7F5C]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-xl font-bold">
                  {((data?.stats?.totalDistance || 0) / 1000).toFixed(1)} km
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#8B9FEF]/10 rounded-full">
                <Timer className="h-6 w-6 text-[#8B9FEF]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="text-xl font-bold">
                  {Math.floor((data?.stats?.totalTime || 0) / 3600)}h {Math.floor(((data?.stats?.totalTime || 0) % 3600) / 60)}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#FF7F5C]/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-[#FF7F5C]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Elevation Gain</p>
                <p className="text-xl font-bold">{Math.round(data?.stats?.totalElevation || 0)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#8B9FEF]/10 rounded-full">
                <Heart className="h-6 w-6 text-[#8B9FEF]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Heart Rate</p>
                <p className="text-xl font-bold">{data?.stats?.avgHeartRate || 0} bpm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.activities?.slice(0, 5).map((activity: any) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-[#FF7F5C]/10 rounded-full">
                    <Activity className="h-4 w-4 text-[#FF7F5C]" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-gray-600">
                      {(activity.distance / 1000).toFixed(1)}km • 
                      {Math.floor(activity.moving_time / 60)}min • 
                      {((activity.average_speed * 3.6) || 0).toFixed(1)}km/h
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(activity.url, '_blank')}
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}