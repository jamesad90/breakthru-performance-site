'use client';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Moon, Sun, Zap } from "lucide-react"
import { UserButton, SignInButton, useUser } from "@clerk/nextjs"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const router = useRouter()
  const { isSignedIn } = useUser()

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

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/plans', label: 'Plans & Pricing' },
    { href: '/blog', label: 'Blog' },
  ]

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-gray-900 border-b border-[#FF7F5C]/20 dark:border-[#FF7F5C]/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#FF7F5C] rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#FF7F5C]">Breakthru Performance</span>
            </Link>
            <nav className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium ${
                    router.pathname === item.href
                      ? 'text-[#FF7F5C]'
                      : 'text-gray-600 dark:text-gray-300 hover:text-[#FF7F5C]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <Button className="bg-[#8B9FEF] text-white hover:bg-[#8B9FEF]/90">
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-[#FF7F5C]/20 dark:border-[#FF7F5C]/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2024 Breakthru Performance. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-sm hover:text-[#FF7F5C]">Privacy Policy</Link>
              <Link href="/terms" className="text-sm hover:text-[#FF7F5C]">Terms of Service</Link>
              <Link href="/contact" className="text-sm hover:text-[#FF7F5C]">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}