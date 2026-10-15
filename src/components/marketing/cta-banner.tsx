import * as React from 'react';
import { Gift, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTABannerProps {
  appUrl: string;
}

export function CTABanner({ appUrl }: CTABannerProps) {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-r from-[#0d2818] via-[#164228] to-[#0d2818] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute -bottom-10 left-10 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
      <div className="pointer-events-none absolute top-0 right-10 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />

      <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 rounded-[15px] bg-white/10 px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-sm mb-6">
          <Sparkles className="h-4 w-4" /> Ready in under 60 seconds
        </div>

        <h2 className="text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">
          Make This Year&apos;s Gift Exchange <br />
          <span className="text-[#e9c46a]">Completely Unforgettable</span>
        </h2>

        <p className="mt-6 text-base text-gray-200 sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Zero signups for participants, zero spoilers for you, and automated matching with custom exclusion rules. Start organizing today!
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={appUrl} className="w-full sm:w-auto">
            <Button
              variant="festive"
              size="lg"
              className="w-full sm:w-auto text-base font-bold shadow-2xl shadow-black/40"
            >
              <Gift className="mr-2 h-5 w-5" /> Start Your Secret Santa Now
            </Button>
          </a>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          No credit card required • Up to 15 participants free
        </p>
      </div>
    </section>
  );
}
