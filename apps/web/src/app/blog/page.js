'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // For now, we'll use a simple array of posts
    // Later you can fetch from your content folder
    setPosts([
      {
        slug: '5-daily-habits-ear-training',
        title: '5 Daily Habits to Improve Your Ear Training (Fast and Fun)',
        description: 'Learn 5 fun, effective ear training habits to improve your musical ear. Includes theory, song learning, improvisation, singing, and a free ear training game.',
        date: '2025-08-19',
        author: 'Michael Q. Klein',
        tags: ['ear training', 'music education', 'musicianship', 'music theory', 'practice habits', 'melody bricks']
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen p-8">
      {/* Blog Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Play Music From Within Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn music theory, improve your ear training, and learn to express yourself.
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="bg-white bg-opacity-95 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <time dateTime={post.date}>{post.date}</time>
                  <span className="mx-2">•</span>
                  <span>{post.author}</span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600 transition-colors duration-200"
                  >
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  Read more
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
} 