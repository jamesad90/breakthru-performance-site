'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-[#FF7F5C] mb-6">About Breakthrü Performance</h1>
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#FF7F5C]/10 rounded-full flex items-center justify-center">
              <Zap className="w-10 h-10 text-[#FF7F5C]" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-[#FF7F5C] mb-6">Our Passion For Endurance Sports</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                At Breakthrü Performance, we are passionate about cycling and helping athletes achieve their goals. Our coaching philosophy emphasises a scientific approach to endurance training, use of data-driven training plans & physiological testing to help athletes optimize training & achieve their goals.
              </p>
              <p>
                Endurance training is not just about physical strength, but also mental strength, and we work with our athletes to develop both.
              </p>
              <p>
                I provide a range of coaching services for cyclists of all levels, from beginners to competitive racers. I will work with you to develop a customised training plan that meets your specific needs and goals.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#FF7F5C] mb-6">Credentials</h2>
            <div className="grid gap-6">
              <Card className="border-[#FF7F5C]/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-[#FF7F5C]">Our Coaches&apos; Qualifications</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>USA Cycling Level 2 Certified Coach</li>
                    <li>TrainingPeaks Level 2 Certified Coach</li>
                    <li>British Triathlon Federation Level 2 Certified Coach</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-[#FF7F5C]/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-[#FF7F5C]">Our Coaches&apos; Education</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>BSc Degree in Exercise Science</li>
                    <li>MSc Degree in Sports Physiology</li>
                    <li>PhD in Exercise Physiology</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}