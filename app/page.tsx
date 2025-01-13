'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Moon, Sun } from "lucide-react"

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('darkMode', newMode.toString())
    document.documentElement.classList.toggle('dark', newMode)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        {/* Navigation
        <nav className="border-b border-[#FF7F5C]/20 dark:border-[#FF7F5C]/10">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-sm font-medium hover:text-[#FF7F5C]">
                  Home
                </Link>
                <Link href="/plans" className="text-sm font-medium hover:text-[#FF7F5C]">
                  Plans
                </Link>
                <Link href="/about" className="text-sm font-medium hover:text-[#FF7F5C]">
                  About Breakthru
                </Link>
                <Link href="/feed" className="text-sm font-medium hover:text-[#FF7F5C]">
                  Feed
                </Link>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </nav> */}

        {/* Hero Section */}
        <section className="bg-[#FF7F5C] dark:bg-[#FF7F5C]/90 py-20 text-white">
           <div className="container mx-auto px-4 text-center">
            <div className="mb-8 flex items-center justify-center rounded-full bg-white/20 p-4">
              <Image
                src="/images/logo/high_res_files/original_on_transparent.png"
                alt="logo on transparent"
                className="object-cover"
                priority
                width={600}
                height={300}
              />
            </div>
            <Button className="mt-8 bg-[#8B9FEF] text-white hover:bg-[#8B9FEF]/90">
              Get In Touch
            </Button>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-[#FF7F5C]">About Breakthru Performance</h2>
                <p className="mb-4">
                  Led by Dr. James Donaldson, Breakthru Performance specializes in providing customized coaching services to help endurance sports athletes achieve their goals.
                </p>
                <p className="mb-4">
                  Our coaching philosophy emphasizes a scientific approach to endurance training, utilizing data-driven training plans and incorporating physiological testing to optimize your performance.
                </p>
                <p className="mb-4">
                  We believe that endurance training is as much about mental strength as it is physical. That's why we work with our athletes to develop both aspects, ensuring a holistic approach to your athletic journey.
                </p>
                <Button className="mt-4 bg-[#8B9FEF] text-white hover:bg-[#8B9FEF]/90">Learn More About Us</Button>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/home_image.png"
                  alt="Athlete in action"
                  height={200}
                  width={800}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-[#FF7F5C]/5 dark:bg-[#FF7F5C]/10 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#FF7F5C]">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Personalized Training Plans", description: "Tailored programs designed to fit your specific goals and lifestyle." },
                { title: "Performance Testing", description: "State-of-the-art physiological assessments to track your progress and optimize training." },
                { title: "Mental Conditioning", description: "Techniques to strengthen your mental game and boost performance under pressure." },
              ].map((service, index) => (
                <Card key={index} className="dark:bg-gray-800 border-[#FF7F5C]/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-[#FF7F5C]">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#FF7F5C]">What Our Athletes Say</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {[
                { name: "David C.", sport: "Triathlete", quote: "Breakthru Performance transformed my approach to training. I've seen incredible improvements in my race times and overall endurance." },
                { name: "Ben F.", sport: "Marathon Runner", quote: "The personalized plans and constant support from the Breakthru team have been instrumental in helping me qualify for Boston." },
              ].map((testimonial, index) => (
                <Card key={index} className="dark:bg-gray-800 border-[#FF7F5C]/20">
                  <CardContent className="p-6">
                    <p className="italic mb-4">"{testimonial.quote}"</p>
                    <p className="font-semibold text-[#8B9FEF]">{testimonial.name} - {testimonial.sport}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#FF7F5C] dark:bg-[#FF7F5C]/90 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Break Through?</h2>
            <p className="mb-8 text-xl">Join us and start rewriting your personal bests today.</p>
            <Button className="bg-[#8B9FEF] text-white hover:bg-[#8B9FEF]/90">
              <Link href="/signup">Get Started Now</Link>
            </Button>
          </div>
        </section>

       
      </div>
    </div>
  )
}