import * as React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Gift,
  Calendar,
  Star,
} from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface HeroProps {
  appUrl: string;
}

export function Hero({ appUrl }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-gray-200/80 bg-gradient-to-b from-white via-snow-50 to-[#edf2f4]/40 pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Decorative festive ambient glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-red-100/60 blur-3xl" />
      <div className="pointer-events-none absolute top-48 right-10 -z-10 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: High-Converting Copy (7 Cols) */}
          <div className="text-center lg:col-span-7 lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-[15px] border border-red-200/90 bg-red-50/90 px-4 py-1.5 text-xs font-bold text-[#d90429] shadow-xs mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Free Secret Santa Generator • Zero Spoilers</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-black tracking-tight text-[#0d2818] sm:text-6xl lg:text-6xl xl:text-7xl">
              The Stress-Free <br />
              <span className="text-[#d90429]">Secret Santa</span> Generator
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg text-gray-600 sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              No paper slips, no duplicate draws, and zero spoilers for the organizer.
              Set custom exclusion rules, let our derangement algorithm pair everyone fairly,
              and deliver magic reveal links straight to their inboxes.
            </p>

            {/* CTA Group */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a href={appUrl} className="w-full sm:w-auto">
                <Button
                  variant="festive"
                  size="lg"
                  className="w-full sm:w-auto text-base font-bold shadow-xl shadow-red-500/25"
                >
                  Create an Exchange — It&apos;s Free{' '}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>

              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base font-semibold"
                >
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Social Proof & Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 border-t border-gray-200/60 text-xs font-medium text-gray-600">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-gray-900">4.9/5</span>
                <span>(10,000+ groups)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#0d2818]" />
                <span className="font-semibold">Zero-Spoiler Guarantee</span>
              </div>

              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#2d6a4f]" />
                <span className="font-semibold">No Passwords Required</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mockup / Hero Interactive Card (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              {/* Floating accent badge */}
              <div className="absolute -top-4 -right-2 z-20 rounded-[15px] bg-[#d90429] px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-red-600/30">
                🎁 1-Click Reveal Ready
              </div>

              {/* Main Sample Card */}
              <Card className="border-2 border-gray-200/90 bg-white shadow-2xl p-6 relative">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#0d2818] text-white">
                      <Gift className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-base">
                        Smith Family Christmas 2026
                      </h2>
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> All Pairs Matched
                      </span>
                    </div>
                  </div>
                  <span className="rounded-[15px] bg-[#e9c46a]/20 border border-[#e9c46a] text-amber-900 font-black text-xs px-2.5 py-1">
                    $35 Limit
                  </span>
                </div>

                <div className="space-y-3 py-4">
                  <div className="flex items-center justify-between rounded-[15px] bg-gray-50 p-3 text-xs font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#d90429]" />
                      <span>Dec 24, 2026</span>
                    </div>
                    <span className="rounded-[15px] bg-gray-200 px-2 py-0.5 text-gray-600 font-mono text-[11px]">
                      5 Participants
                    </span>
                  </div>

                  {/* Sample Participant Pairs Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-[15px] border border-gray-100 bg-white p-2.5 shadow-2xs">
                      <span className="text-xs font-semibold text-gray-800">
                        Alice Smith
                      </span>
                      <span className="rounded-[15px] bg-[#0d2818]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#0d2818]">
                        Secret Giver
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-[15px] border border-gray-100 bg-white p-2.5 shadow-2xs">
                      <span className="text-xs font-semibold text-gray-800">
                        Bob Smith
                      </span>
                      <span className="rounded-[15px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[11px] font-medium">
                        🚫 Alice Excluded
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-[15px] border border-gray-100 bg-white p-2.5 shadow-2xs">
                      <span className="text-xs font-semibold text-gray-800">
                        Charlie Brown
                      </span>
                      <span className="rounded-[15px] bg-green-50 text-green-800 border border-green-200 px-2.5 py-0.5 text-[11px] font-semibold">
                        Wishlist Ready (3 items)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Callout in card */}
                <div className="rounded-[15px] bg-red-50 p-3 text-center border border-red-100">
                  <p className="text-xs font-bold text-[#d90429]">
                    🔒 Cryptographically Sealed Vault
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Organizers cannot accidentally see assignments.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
