'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell, Medal, Star, Waves as SwimmingPool, Bike, Footprints as Running, Calendar, CreditCard } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
export default function PlansPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('triathlon')
  const [showDialog, setShowDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan)
    setShowDialog(true)
  }

  const handlePayment = () => {
    router.push(`/signup?plan=${selectedPlan.title}&price=${selectedPlan.price}`)
  }

  const handleConsultation = () => {
    window.location.href = `mailto:james@breakthru-performance.com?subject=Consultation Request - ${selectedPlan.title}&body=Hi James, I'm interested in the ${selectedPlan.title} plan and would like to schedule a consultation call to discuss further.`
  }
  const triathlonPlans = [
    {
      title: "Core Triathlon Training",
      price: "65",
      period: "month",
      features: [
        "Tailored Swim, Bike + Run Sessions",
        "Initial 1 Hour Consultation With James",
        "Unlimited Coach Contact via WhatsApp"
      ],
      icon: <SwimmingPool className="w-6 h-6" />,
      popular: false
    },
    {
      title: "Advanced Triathlon Training",
      price: "85",
      period: "month",
      features: [
        "Tailored Swim, Bike + Run Sessions",
        "Weekly Strength + Conditioning Sessions",
        "Initial 1 Hour Consultation With James",
        "Race Day Nutrition Planning + Preparation",
        "Unlimited Coach Contact via WhatsApp",
        "Monthly Data Dive Report"
      ],                           
      icon: <Medal className="w-6 h-6" />,
      popular: true
    },
    {
      title: "Premium Triathlon Coaching",
      price: "200",
      period: "month",
      features: [
        "Everything listed in the Advanced Programme",
        "Weekly Phone/Video Calls with James",
        "Full Season Management - James will plan it all for you",
        "Monthly Personal-Trained Session",
        "Discounted Physiological Testing (UK Athletes)"
      ],
      icon: <Star className="w-6 h-6" />,
      popular: false
    }
  ]

  const singleSportPlans = [
    {
      title: "Core Single Sport Athlete",
      price: "50",
      period: "month",
      features: [
        "Tailored Bike or Run Sessions",
        "Initial 1 Hour Consultation With James",
        "Unlimited Coach Contact via WhatsApp"
      ],
      icon: <Running className="w-6 h-6" />,
      popular: false
    },
    {
      title: "Advanced Single Sport Athlete",
      price: "75",
      period: "month",
      features: [
        "Tailored Bike or Run Sessions",
        "Weekly Strength + Conditioning Sessions",
        "Initial 1 Hour Consultation With James",
        "Race Day Nutrition Planning + Preparation",
        "Unlimited Coach Contact via WhatsApp",
        "Monthly Data Dive Report"
      ],
      icon: <Bike className="w-6 h-6" />,
      popular: true
    },
    {
      title: "Premium Runner/Cyclist",
      price: "150",
      period: "month",
      features: [
        "Everything listed in the Advanced Programme",
        "Weekly Phone/Video Calls with James",
        "Full Season Management - James will help plan it all for you",
        "Monthly Personal-Trained Session",
        "Discounted Physiological Testing (UK Athletes)"
      ],
      icon: <Dumbbell className="w-6 h-6" />,
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#FF7F5C] mb-4">Choose Your Training Plan</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Find one that works for you and your ambitions</p>
        </div>

        {/* Plan Type Selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border border-[#FF7F5C]/20 p-1">
            <button
              onClick={() => setActiveTab('triathlon')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'triathlon'
                  ? 'bg-[#FF7F5C] text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-[#FF7F5C]/10'
              }`}
            >
              Triathlon Plans
            </button>
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'single'
                  ? 'bg-[#FF7F5C] text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-[#FF7F5C]/10'
              }`}
            >
              Run/Bike Plans
            </button>
          </div>
        </div>

        {/* Plans Grid */}
       
        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {(activeTab === 'triathlon' ? triathlonPlans : singleSportPlans).map((plan, index) => (
            <Card key={index} className={`relative border-2 ${
              plan.popular ? 'border-[#FF7F5C]' : 'border-[#FF7F5C]/20'
            } hover:border-[#FF7F5C] transition-all duration-300`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#FF7F5C] text-white px-3 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </span>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-[#FF7F5C]/10 rounded-lg">
                    {plan.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-[#FF7F5C]">£{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">{plan.title}</h3>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="w-5 h-5 text-[#FF7F5C] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={handlePlanSelect} className="w-full bg-[#8B9FEF] hover:bg-[#8B9FEF]/90">
                  Select Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selection Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className='max-w-md bg-white dark:bg-gray-800'>
            <DialogHeader>
              <DialogTitle>Choose Your Next Step</DialogTitle>
              <DialogDescription>
                Would you like to proceed with payment or schedule a consultation call first?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button
                className="w-full bg-[#8B9FEF] hover:bg-[#8B9FEF]/90"
                onClick={handlePayment}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Payment
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleConsultation}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule a Consultation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}