'use client';

import Link from 'next/link';
import { useState } from 'react';
import { loginUrl } from '../../config/management-system';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Security', href: '/security' },
    { name: 'Resources', href: '/resources' },
    { name: 'Demo', href: '/demo' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">TotHub</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <a
              href={loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Login
            </a>
            <Link
              href="/demo"
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <a
              href={loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </a>
            <Link
              href="/demo"
              className="bg-primary-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}