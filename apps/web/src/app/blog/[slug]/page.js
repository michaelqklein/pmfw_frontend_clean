'use client';

import Link from 'next/link';

export default function BlogPostPage({ params }) {
  const { slug } = params;
  
  // For now, we'll use a simple post object
  // Later you can fetch from your content folder
  const post = {
    slug: '5-daily-habits-ear-training',
    title: '5 Daily Habits to Improve Your Ear Training (Fast and Fun)',
    description: 'Learn 5 fun, effective ear training habits to improve your musical ear. Includes theory, song learning, improvisation, singing, and a free ear training game.',
    date: '2024-01-15',
    author: 'Michael Q. Klein',
    tags: ['ear training', 'music education', 'musicianship', 'music theory', 'practice habits', 'melody bricks'],
    content: `# 5 Daily Habits to Improve Your Ear Training (Fast and Fun)

**By Michael Q. Klein, Play Music From Within**

## Introduction

Ear training is one of the most powerful skills you can develop as a musician. Whether you play piano, guitar, or sing, a trained ear will help you learn songs faster, improvise with confidence, and understand music on a much deeper level.

The good news? You don't need to spend hours a day doing it. Just a few minutes, done regularly, can transform your musicianship. Here are the five habits I recommend to my students (and that I use myself) to make ear training effective and fun.

## 1. Learn Your Theory — Know What's Out There

Before you can recognize something by ear, you need to know it exists. That's where music theory comes in.

Start with the basics:

- **Learn the 12 major scales**
- **Learn the four basic triads** (major, minor, diminished, augmented) in every key
- **Understand the seven chords** in a major key
- **Memorize the 12 intervals** within an octave

This theoretical foundation will completely change how you listen to music — you'll know what to listen for and how to identify it.

## 2. Learn Songs by Ear

This is where your theory comes alive. Start simple:

- Learn just the beginning of melodies
- Progress to entire melodies
- Eventually, move on to chords and chord progressions

When you can identify the key of a song, everything falls into place. Your ear will guide you, and your theory will confirm it.

## 3. Use an Ear Training App (That's Actually Fun)

Traditional ear training drills can get boring fast. That's why I created **Melody Bricks** — a free, Tetris-style ear training game that makes practice addictive.

You can also check out my ear training challenges on YouTube and Instagram for quick, engaging exercises you can do daily.

## 4. Improvise by Ear

Take your instrument, forget the theory for a moment, and just play what you hear in your head.

This is about:

- Following your ear
- Experimenting without fear
- Letting your musical intuition lead

Your theory knowledge will still be there in the background, but this habit develops musical freedom.

## 5. Sing — Even if You're Not a Singer

Singing is one of the fastest ways to improve your ear. You don't have to be great at it — the point is to connect what you hear to what you can produce.

Try singing:

- Intervals
- Melodies
- Chord arpeggios

This bridges the gap between hearing and understanding, and makes your recognition skills much stronger.

## Final Thoughts

These five habits don't take long each day — but the consistency is what matters.

Even 5–10 minutes daily can completely transform your ear, your playing, and your overall musicianship.

If you want to make ear training feel like a game, try [Melody Bricks](/levels) for free, and check out my weekly challenges on YouTube and Instagram.`
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'transparent' }}>
      {/* Back to blog link */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link 
          href="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-sm"
        >
          <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>
      </div>

      {/* Article */}
      <div className="max-w-4xl mx-auto">
        <article className="bg-white bg-opacity-95 rounded-lg shadow-lg p-8 mb-8">
          <header className="mb-8">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <time dateTime={post.date}>{post.date}</time>
              <span className="mx-2">•</span>
              <span>{post.author}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              {post.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Article content */}
          <div className="max-w-none">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('# ')) {
                return <h1 key={index} className="text-3xl font-bold text-gray-900 mb-4 mt-8">{paragraph.substring(2)}</h1>
              } else if (paragraph.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-3 mt-6">{paragraph.substring(3)}</h2>
              } else if (paragraph.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold text-gray-800 mb-2 mt-4">{paragraph.substring(4)}</h3>
              } else if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter(item => item.startsWith('- '))
                return (
                  <ul key={index} className="list-disc list-inside mb-4 space-y-1">
                    {items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-700">{item.substring(2)}</li>
                    ))}
                  </ul>
                )
              } else if (paragraph.startsWith('1. ')) {
                const items = paragraph.split('\n').filter(item => /^\d+\./.test(item))
                return (
                  <ol key={index} className="list-decimal list-inside mb-4 space-y-1">
                    {items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-700">{item.replace(/^\d+\.\s*/, '')}</li>
                    ))}
                  </ol>
                )
              } else if (paragraph.includes('**') && paragraph.includes('**')) {
                const formattedParagraph = paragraph
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
                return <p key={index} className="text-gray-700 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
              } else if (paragraph.trim()) {
                return <p key={index} className="text-gray-700 mb-4 leading-relaxed">{paragraph}</p>
              }
              return null
            })}
          </div>
        </article>

        {/* Share section */}
        <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Share this article:
            </div>
            <div className="flex space-x-4">
              <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                Twitter
              </button>
              <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                Facebook
              </button>
              <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                LinkedIn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 