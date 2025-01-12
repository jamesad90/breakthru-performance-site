'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, ChevronRight, Activity, Watch } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [isGarminConnected, setIsGarminConnected] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const connectStrava = async () => {
    window.location.href = '/api/auth/strava';
  };

  const connectGarmin = async () => {
    window.location.href = '/api/auth/garmin';
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setShowSuccessDialog(true);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Getting Started</span>
              <span>Connect Services</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Breakthrü Performance! 🎉</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Let's get your account set up so you can start tracking your training progress.
                  We'll help you connect your fitness services to get the most out of your training.
                </p>
                <div className="flex justify-end">
                  <Button onClick={handleNext} className="bg-[#8B9FEF] hover:bg-[#8B9FEF]/90">
                    Get Started <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Card className={`border-2 ${isStravaConnected ? 'border-green-500' : 'border-gray-300'}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-[#FF7F5C]/10 rounded-full">
                            <Activity className="h-6 w-6 text-[#FF7F5C]" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Connect Strava</h3>
                            <p className="text-sm text-gray-600">Sync your activities automatically</p>
                          </div>
                        </div>
                        <Button 
                          onClick={connectStrava}
                          className={isStravaConnected ? 'bg-green-500' : 'bg-[#FF7F5C]'}
                        >
                          {isStravaConnected ? (
                            <>
                              <Check className="mr-2 h-4 w-4" /> Connected
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border-2 ${isGarminConnected ? 'border-green-500' : 'border-gray-300'}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-[#8B9FEF]/10 rounded-full">
                            <Watch className="h-6 w-6 text-[#8B9FEF]" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Connect Garmin</h3>
                            <p className="text-sm text-gray-600">Import your watch data</p>
                          </div>
                        </div>
                        <Button 
                          onClick={connectGarmin}
                          className={isGarminConnected ? 'bg-green-500' : 'bg-[#8B9FEF]'}
                        >
                          {isGarminConnected ? (
                            <>
                              <Check className="mr-2 h-4 w-4" /> Connected
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNext} className="bg-[#8B9FEF] hover:bg-[#8B9FEF]/90">
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>You're All Set!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Great job! Your account is now configured and ready to go. 
                  You can start tracking your training progress and view your analytics.
                </p>
                <div className="flex justify-end">
                  <Button onClick={handleComplete} className="bg-[#8B9FEF] hover:bg-[#8B9FEF]/90">
                    Go to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Setup Complete! 🎉</DialogTitle>
              <DialogDescription>
                Your account is now fully configured. You can start tracking your training progress
                and view your analytics on the dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={handleComplete} className="bg-[#8B9FEF] hover:bg-[#8B9FEF]/90">
                Go to Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}