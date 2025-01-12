'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { Card } from "@/components/ui/card";
import { format } from 'date-fns';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, auth.users(email)')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7F5C]"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-[#FF7F5C] mb-4">Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <article className="max-w-3xl mx-auto">
          {post.featured_image && (
            <div className="relative h-[400px] w-full mb-8">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold text-[#FF7F5C] mb-4">{post.title}</h1>

          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-8">
            <span>By {post.users?.email}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.published_at}>
              {format(new Date(post.published_at), 'MMMM d, yyyy')}
            </time>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags?.map((tag: string) => (
              <span
                key={tag}
                className="text-sm bg-[#8B9FEF]/10 text-[#8B9FEF] px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}