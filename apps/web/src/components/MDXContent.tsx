import { MDXProvider } from '@mdx-js/react'
import { ReactNode } from 'react'

interface MDXContentProps {
  content: string
}

// Custom components for MDX
const components = {
  h1: ({ children }: { children: ReactNode }) => (
    <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-8">{children}</h1>
  ),
  h2: ({ children }: { children: ReactNode }) => (
    <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>
  ),
  h3: ({ children }: { children: ReactNode }) => (
    <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">{children}</h3>
  ),
  p: ({ children }: { children: ReactNode }) => (
    <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children: ReactNode }) => (
    <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children: ReactNode }) => (
    <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
  ),
  li: ({ children }: { children: ReactNode }) => (
    <li className="text-gray-700">{children}</li>
  ),
  strong: ({ children }: { children: ReactNode }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }: { children: ReactNode }) => (
    <em className="italic text-gray-800">{children}</em>
  ),
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4">{children}</blockquote>
  ),
  code: ({ children }: { children: ReactNode }) => (
    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>
  ),
  pre: ({ children }: { children: ReactNode }) => (
    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
  ),
  a: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href} className="text-blue-600 hover:text-blue-800 underline">{children}</a>
  ),
}

export default function MDXContent({ content }: MDXContentProps) {
  return (
    <MDXProvider components={components}>
      <div className="mdx-content">
        {/* For now, we'll render the content as plain text with basic formatting */}
        {/* In a full MDX setup, this would render the actual MDX content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: content
              .replace(/\n\n/g, '</p><p>')
              .replace(/\n/g, '<br>')
              .replace(/^/, '<p>')
              .replace(/$/, '</p>')
          }} 
        />
      </div>
    </MDXProvider>
  )
} 