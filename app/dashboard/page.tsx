'use client';

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Activity, Clock, Target } from "lucide-react";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FF7F5C] mb-2">
            Welcome back, {user?.firstName || 'Athlete'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your progress and manage your training plan
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#FF7F5C]/10 rounded-full">
                  <Activity className="h-6 w-6 text-[#FF7F5C]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next Session</p>
                  <p className="font-semibold">45min Zone 2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#8B9FEF]/10 rounded-full">
                  <Clock className="h-6 w-6 text-[#8B9FEF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Training Hours</p>
                  <p className="font-semibold">12.5 hrs this week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#FF7F5C]/10 rounded-full">
                  <Target className="h-6 w-6 text-[#FF7F5C]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next Goal</p>
                  <p className="font-semibold">Marathon PR</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#8B9FEF]/10 rounded-full">
                  <Calendar className="h-6 w-6 text-[#8B9FEF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next Event</p>
                  <p className="font-semibold">London Marathon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Training Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Monday - Recovery Run</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">30 minutes, Zone 2</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Tuesday - Intervals</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">8x400m repeats</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Wednesday - Rest</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active recovery</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Weekly Distance</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">32.5 km / 40 km</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div className="h-full bg-[#FF7F5C] rounded-full" style={{ width: '81.25%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Monthly Goals</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">4 / 5 completed</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div className="h-full bg-[#8B9FEF] rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}