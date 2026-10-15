import * as React from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PricingProps {
  appUrl: string;
}

export function PricingSection({ appUrl }: PricingProps) {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white border-b border-gray-200/80">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-[15px] bg-[#0d2818]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0d2818] mb-3">
            Simple, Transparent Pricing
          </span>
          <h2 className="text-3xl font-black text-[#0d2818] sm:text-4xl md:text-5xl">
            Free for Families & Friends. <br />
            Pro for Large Teams.
          </h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            Start completely free for exchanges up to 15 members. Upgrade only if you have massive groups.
          </p>
        </div>

        <div className="grid gap-8 max-w-4xl mx-auto lg:grid-cols-2 items-stretch">
          {/* Free Tier Card */}
          <Card className="flex flex-col justify-between border-2 border-gray-200/90 bg-[#f8f9fa] p-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-[15px] bg-gray-200 px-3 py-1 text-xs font-bold text-gray-800 uppercase">
                  Free Elf Tier
                </span>
              </div>

              <div className="mt-6 mb-4">
                <span className="text-5xl font-black text-[#0d2818]">$0</span>
                <span className="text-gray-500 text-sm ml-2 font-medium">Free forever</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Perfect for families, friendly circles, and small office teams.
              </p>

              <ul className="space-y-3 border-t border-gray-200 pt-6 text-sm text-gray-700">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#2d6a4f] shrink-0" />
                  <span>Up to <strong>15 participants</strong> per exchange</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#2d6a4f] shrink-0" />
                  <span>Automated constraint matching (no self-matches)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#2d6a4f] shrink-0" />
                  <span>Up to 5 exclusion rules (couples/roommates)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#2d6a4f] shrink-0" />
                  <span>Resend magic email delivery</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#2d6a4f] shrink-0" />
                  <span>Interactive participant wishlists</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <a href={appUrl} className="block w-full">
                <Button variant="outline" size="lg" className="w-full font-bold">
                  Start Free Exchange
                </Button>
              </a>
            </div>
          </Card>

          {/* Pro Pass Card */}
          <Card className="flex flex-col justify-between border-2 border-[#d90429] bg-white p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#d90429] text-white text-[11px] font-black uppercase px-4 py-1 rounded-bl-[15px]">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-[15px] bg-red-100 px-3 py-1 text-xs font-bold text-[#d90429] uppercase">
                  Santa Pro Pass
                </span>
              </div>

              <div className="mt-6 mb-4">
                <span className="text-5xl font-black text-[#0d2818]">$9.99</span>
                <span className="text-gray-500 text-sm ml-2 font-medium">One-time per event</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Designed for large companies, schools, communities, and massive holiday parties.
              </p>

              <ul className="space-y-3 border-t border-gray-200 pt-6 text-sm text-gray-700">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#d90429] shrink-0 font-bold" />
                  <span><strong>Unlimited participants</strong> (up to 1,000+)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#d90429] shrink-0 font-bold" />
                  <span><strong>Unlimited exclusion rules</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#d90429] shrink-0 font-bold" />
                  <span>Priority email delivery & open tracking</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#d90429] shrink-0 font-bold" />
                  <span>Festive custom email themes & branding</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#d90429] shrink-0 font-bold" />
                  <span>CSV bulk roster import</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <a href={appUrl} className="block w-full">
                <Button variant="festive" size="lg" className="w-full font-bold shadow-lg shadow-red-500/25">
                  Get Started with Pro <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
