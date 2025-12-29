const path = require('path');
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [require('remark-gfm')],
    rehypePlugins: [],
  },
})

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/src': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../../packages/utils'),
      '@shared/utils': path.resolve(__dirname, '../../packages/utils'),
      '@audio': path.resolve(__dirname, '../../packages/audio'),
      '@data': path.resolve(__dirname, '../../packages/data'),
      '@engines': path.resolve(__dirname, '../../packages/engines'),
    };
    return config;
  },
};

module.exports = withMDX(nextConfig);

