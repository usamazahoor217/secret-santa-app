'use client';

import * as React from 'react';
import Link from 'next/link';
import { Gift, Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // App subdomain URL fallback for development & production
  const appUrl =
    process.env.NEXT_PUBLIC_APP_DOMAIN
      ? `http://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
      : '/events/new';

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[15px] bg-[#d90429] text-white shadow-md shadow-red-500/20">
            <Gift className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-[#0d2818]">
              SecretSanta<span className="text-[#d90429]">.io</span>
            </span>
            <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase -mt-1">
              Zero Spoilers
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
          <a
            href="#how-it-works"
            className="hover:text-[#0d2818] transition-colors"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="hover:text-[#0d2818] transition-colors"
          >
            Features
          </a>
          <a
            href="#interactive-demo"
            className="hover:text-[#0d2818] transition-colors flex items-center gap-1.5 text-[#0d2818]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#d90429]" />
            Live Demo
          </a>
          <a
            href="#pricing"
            className="hover:text-[#0d2818] transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="hover:text-[#0d2818] transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <a href={appUrl}>
            <Button
              variant="festive"
              size="md"
              className="font-bold shadow-md shadow-red-500/20"
            >
              Start an Exchange <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-700 md:hidden rounded-[15px] hover:bg-gray-100 cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 font-semibold text-gray-700">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0d2818]"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0d2818]"
            >
              Features
            </a>
            <a
              href="#interactive-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0d2818] flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-[#d90429]" /> Live Demo
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0d2818]"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#0d2818]"
            >
              FAQ
            </a>
          </nav>
          <div className="pt-2">
            <a href={appUrl} className="block w-full">
              <Button variant="festive" className="w-full font-bold">
                Start an Exchange <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
