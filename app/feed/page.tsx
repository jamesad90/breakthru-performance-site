import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, ChevronRight } from 'lucide-react'

const blogPosts = [
  {
    id: 1,
    title: "Mastering the Mental Game: Techniques for Endurance Athletes",
    excerpt: "Discover powerful mental strategies to enhance your performance and overcome challenges in endurance sports.",
    author: "Dr. James Donaldson",
    date: "2024-03-15",
    imageUrl: "/placeholder.svg?height=200&width=400",
    slug: "mastering-mental-game"
  },
  {
    id: 2,
    title: "Nutrition Strategies for Long-Distance Events",
    excerpt: "Learn about optimal fueling techniques to maintain energy levels and performance during extended endurance activities.",
    author: "Sarah Johnson",
    date: "2024-03-10",
    imageUrl: "/placeholder.svg?height=200&width=400",
    slug: "nutrition-strategies"
  },
  {
    id: 3,
    title: "Recovery Techniques for Peak Performance",
    excerpt: "Explore cutting-edge recovery methods to optimize your training and prevent burnout in your endurance journey.",
    author: "Mike Chen",
    date: "2024-03-05",
    imageUrl: "/placeholder.svg?height=200&width=400",
    slug: "recovery-techniques"
  },
]

export default function BlogListing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-[#FF7F5C] mb-8">Breakthru Performance Blog</h1>
        
        <div className="mb-8">
          <Input 
            type="search" 
            placeholder="Search blog posts..." 
            className="max-w-md"
          />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={400}
                height={200}
                className="rounded-t-lg object-cover h-48 w-full"
              />
              <CardContent className="flex-grow p-4">
                <h2 className="text-xl font-semibold mb-2 text-[#FF7F5C]">{post.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt={post.author} />
                    <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span>{post.author}</span>
                  <span>•</span>
                  <time dateTime={post.date}>
                    <Calendar className="inline mr-1 h-4 w-4" />
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </time>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/blog/${post.slug}`} passHref>
                  <Button variant="ghost" className="w-full justify-between text-[#8B9FEF] hover:text-[#8B9FEF]/80">
                    Read More
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button>Load More Posts</Button>
        </div>
      </main>
    </div>
  )
}