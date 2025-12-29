// app/layout.js

'use client';

import '@/styles/globals.css';
import NavBar from '@/components/NavBar';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const hideNavBar = pathname === '/key-commander-i' || pathname === '/audiation-studio' || pathname === '/melody-bricks';
  const noWhiteBg = pathname === '/key-commander-i' || pathname === '/melody-bricks';

  return (
    <html lang="en">
      <head>
        {/* ✅ This is the critical part */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        {/* Plausible Analytics */}
        <script 
          defer 
          data-domain="playmusicfromwithin.com" 
          src="https://analytics.playmusicfromwithin.com/js/script.js"
        ></script>
      </head>
      <body className={noWhiteBg ? 'blackbg' : 'whitebg'}>
        <AuthProvider>
          <ProductProvider>
            {!hideNavBar && <NavBar />}
            <main>{children}</main>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
