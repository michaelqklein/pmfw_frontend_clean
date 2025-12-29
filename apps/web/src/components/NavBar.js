'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function NavBar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lessonsDropdownOpen, setLessonsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when pathname changes (navigation)
  useEffect(() => {
    setLessonsDropdownOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLessonsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const baseNavItems = [
    { href: '/', label: 'Play Music from Within' },
    { href: '/courses', label: 'Courses' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ];

  const navItems = currentUser
    ? [...baseNavItems, { href: '/account', label: `${currentUser.firstName ? `${currentUser.firstName}'s` : 'My'} Account` }]
    : baseNavItems;

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <div className="hidden md:flex justify-center gap-6 py-4 flex-grow">
        {navItems.map((item) => {
          if (item.hasDropdown) {
            return (
              <div key={item.href} className="relative" ref={dropdownRef}>
                <Link href={item.href}>
                  <div
                    className={`relative font-special text-2xl px-4 py-2 bg-transparent cursor-pointer transition-colors duration-200 ${
                      pathname.startsWith(item.href)
                        ? 'text-green-600 before:content-[""] before:absolute before:top-[-6px] before:left-[-6px] before:right-[-6px] before:bottom-[-6px] before:border-4 before:border-green-600 before:rounded-[40%]'
                        : 'text-black hover:text-green-600'
                    }`}
                    onMouseEnter={() => setLessonsDropdownOpen(true)}
                    onMouseLeave={() => !lessonsDropdownOpen && setLessonsDropdownOpen(false)}
                    onClick={() => setLessonsDropdownOpen(!lessonsDropdownOpen)}
                  >
                    {item.label}
                  </div>
                </Link>
                
                {/* Dropdown Menu */}
                {lessonsDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-0 w-64 bg-white border-2 border-green-200 rounded-lg shadow-lg z-50"
                    onMouseEnter={() => setLessonsDropdownOpen(true)}
                    onMouseLeave={() => setLessonsDropdownOpen(false)}
                  >
                    <div className="py-2">
                      {item.dropdownItems.map((dropdownItem) => (
                        <Link key={dropdownItem.href} href={dropdownItem.href}>
                          <div className={`px-4 py-3 hover:bg-green-50 transition-colors ${
                            pathname === dropdownItem.href ? 'bg-green-100 text-green-700' : 'text-gray-700'
                          }`}>
                            {dropdownItem.label}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`relative font-special text-2xl px-4 py-2 bg-transparent cursor-pointer transition-colors duration-200 ${
                  pathname === item.href
                    ? 'text-green-600 before:content-[""] before:absolute before:top-[-6px] before:left-[-6px] before:right-[-6px] before:bottom-[-6px] before:border-4 before:border-green-600 before:rounded-[40%]'
                    : 'text-black hover:text-green-600'
                }`}
              >
                {item.label}
              </button>
            </Link>
          );
        })}

        {!currentUser ? (
          <Link href="/login">
            <button
              className={`relative font-special text-2xl px-4 py-2 bg-transparent cursor-pointer transition-colors duration-200 ${
                pathname === '/login'
                  ? 'text-green-600 before:content-[""] before:absolute before:top-[-6px] before:left-[-6px] before:right-[-6px] before:bottom-[-6px] before:border-4 before:border-green-600 before:rounded-[40%]'
                  : 'text-black hover:text-green-600'
              }`}
            >
              Login
            </button>
          </Link>
        ) : (
          <button
            className="font-special text-2xl px-4 py-2 bg-transparent text-black hover:text-green-600 transition-colors duration-200"
            onClick={logout}
          >
            Logout
          </button>
        )}
      </div>

      {/* MOBILE NAV HEADER */}
      <div className="flex md:hidden justify-between items-center p-4 border-b border-gray-200 bg-yellow-50">
        <div className="text-lg font-special">Menu</div>
        <button
          className="text-3xl text-black focus:outline-none"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* MOBILE NAV MENU */}
      {menuOpen && (
        <div className="flex flex-col items-center bg-yellow-50 py-4 shadow-md md:hidden font-special text-lg">
          {navItems.map((item) => {
            if (item.hasDropdown) {
              return (
                <div key={item.href} className="w-full">
                  <div className="text-center py-2 px-4 text-green-700 font-bold">
                    {item.label}
                  </div>
                  {item.dropdownItems.map((dropdownItem) => (
                    <Link key={dropdownItem.href} href={dropdownItem.href} onClick={() => setMenuOpen(false)}>
                      <div className={`py-2 px-8 text-sm ${
                        pathname === dropdownItem.href ? 'text-green-600' : 'text-black hover:text-green-600'
                      }`}>
                        {dropdownItem.label}
                      </div>
                    </Link>
                  ))}
                </div>
              );
            }
            
            return (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                <button
                  className={`py-2 px-4 ${
                    pathname === item.href ? 'text-green-600' : 'text-black hover:text-green-600'
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            );
          })}

          {!currentUser ? (
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <button
                className={`py-2 px-4 ${
                  pathname === '/login' ? 'text-green-600' : 'text-black hover:text-green-600'
                }`}
              >
                Login
              </button>
            </Link>
          ) : (
            <button
              className="py-2 px-4 text-black hover:text-green-600"
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
            >
              Logout
            </button>
          )}
        </div>
      )}
    </>
  );
}
