import * as React from 'react';
import {
  ShieldCheck,
  Cpu,
  Mail,
  Heart,
  Smartphone,
  Sparkles,
} from '@/components/ui/icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function Features() {
  const featureList = [
    {
      icon: ShieldCheck,
      title: 'Zero-Spoiler Architecture',
      description:
        'Strict anti-spoiler architecture in MySQL locks the assignments table. Even event creators cannot view confidential pairings unless intentionally unsealed.',
      badge: 'Security',
      color: 'bg-[#0d2818]',
    },
    {
      icon: Cpu,
      title: 'Derangement Constraint Engine',
      description:
        'Our mathematical backtracking algorithm guarantees nobody is matched to themselves and all exclusion rules (couples, siblings) are 100% satisfied.',
      badge: 'Algorithm',
      color: 'bg-[#d90429]',
    },
    {
      icon: Mail,
      title: 'Resend Magic Email Delivery',
      description:
        'Deliver personalized, tokenized reveal links straight to participant inboxes. No account signup or forgotten passwords required.',
      badge: 'Deliverability',
      color: 'bg-[#2d6a4f]',
    },
    {
      icon: Heart,
      title: 'Integrated Wishlists',
      description:
        'Giftees can easily input their wishlist items, clothing sizes, and dislikes so Secret Santas never have to stress about buying the wrong present.',
      badge: 'Delight',
      color: 'bg-[#e9c46a] text-[#0d2818]',
    },
    {
      icon: Smartphone,
      title: '100% Mobile Optimized',
      description:
        'Designed from the ground up for phones, tablets, and desktops with an exact 15px border radius standard and clean Inter typography.',
      badge: 'UI/UX',
      color: 'bg-[#0d2818]',
    },
    {
      icon: Sparkles,
      title: 'Large Groups & Festive Passes',
      description:
        'From intimate family gatherings of 4 to corporate department exchanges with 500+ teammates, scale effortlessly with Stripe-backed Pro Passes.',
      badge: 'Scalability',
      color: 'bg-[#d90429]',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-[#f8f9fa] border-b border-gray-200/80">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-[15px] bg-[#d90429]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#d90429] mb-3">
            Built For Precision & Privacy
          </span>
          <h2 className="text-3xl font-black text-[#0d2818] sm:text-4xl md:text-5xl">
            Everything You Need For The Perfect Exchange
          </h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            Say goodbye to clunky spreadsheets, leaked matches, and complicated group chats.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <article key={i}>
                <Card className="h-full border border-gray-200/90 bg-white hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-[15px] text-white shadow-xs ${f.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-[15px] bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                        {f.badge}
                      </span>
                    </div>

                    <CardTitle className="text-lg font-bold text-[#0d2818]">
                      {f.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
