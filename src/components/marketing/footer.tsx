import * as React from 'react';
import Link from 'next/link';
import { Gift } from 'lucide-react';

interface FooterProps {
  appUrl: string;
}

export function Footer({ appUrl }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 bg-white py-12 px-6 text-gray-600">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4 pb-8 border-b border-gray-100">
          {/* Col 1: Brand */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[15px] bg-[#d90429] text-white">
                <Gift className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-[#0d2818] text-lg">
                SecretSanta<span className="text-[#d90429]">.io</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed">
              The modern, privacy-first Secret Santa organizer with zero spoilers and automated derangement matching.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="#how-it-works" className="hover:text-[#0d2818]">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#0d2818]">
                  Features
                </a>
              </li>
              <li>
                <a href="#interactive-demo" className="hover:text-[#0d2818]">
                  Interactive Test Lab
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#0d2818]">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href={appUrl} className="hover:text-[#0d2818]">
                  Launch Web App
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#0d2818]">
                  FAQ & Support
                </a>
              </li>
              <li>
                <a href="/prd.md" target="_blank" className="hover:text-[#0d2818]">
                  Product Architecture (PRD)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Design Rules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              Design & Standards
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Built strictly with the <strong>Inter</strong> font family and a uniform <strong>15px border radius</strong> standard across all elements.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 Secret Santa Organizer. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted for joyous holiday gift exchanges.
          </p>
        </div>
      </div>
    </footer>
  );
}
