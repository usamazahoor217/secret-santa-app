'use client';

import * as React from 'react';
import { ChevronDown, HelpCircle } from '@/components/ui/icons';
import { Card } from '@/components/ui/card';

export function FAQSection() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  const faqs = [
    {
      q: 'Can the organizer see who drew whom?',
      a: 'No! Privacy is our highest priority. The assignments table is protected by a strict anti-spoiler architecture in MySQL. Organizers are prevented from viewing matches, ensuring you can participate in the exchange with 100% surprise.',
    },
    {
      q: 'Do participants need to download an app or create an account?',
      a: 'Never. Each participant receives a personalized email from Resend with a secure, tokenized magic link. Clicking the link instantly opens their confidential reveal page in any web browser without logging in.',
    },
    {
      q: 'Can I prevent couples or siblings from drawing each other?',
      a: 'Yes! During setup, you can add exclusion constraints (e.g., "Alice cannot draw Bob"). Our backtracking derangement algorithm will mathematically guarantee that those participants are never matched.',
    },
    {
      q: 'What if an email bounces or a participant loses their link?',
      a: 'Immediately after you draw names, your event confirmation dashboard displays a complete list of backup reveal URLs. You can copy any link and send it directly via WhatsApp, iMessage, Slack, or SMS.',
    },
    {
      q: 'How do wishlists work?',
      a: 'When participants open their reveal link, they can add their top gift wishes, sizes, and preferences. Their secret Santa can view these notes in real time without spoiling the secret.',
    },
    {
      q: 'How many participants can join?',
      a: 'Our Free Elf plan supports up to 15 participants—ideal for families and close friend groups. For larger corporate exchanges or communities, the Santa Pro Pass ($9.99 one-time) unlocks unlimited participants.',
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#f8f9fa] border-b border-gray-200/80">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-[15px] bg-[#0d2818]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0d2818] mb-3">
            <HelpCircle className="h-3.5 w-3.5" /> Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-black text-[#0d2818] sm:text-4xl md:text-5xl">
            Everything You Need To Know
          </h2>
          <p className="mt-4 text-base text-gray-600">
            Have questions about pairing fairness, security, or email delivery? We&apos;ve got you covered.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Card
                key={idx}
                className="border border-gray-200/90 bg-white p-5 cursor-pointer transition-all hover:border-gray-300"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-bold text-[#0d2818]">
                    {faq.q}
                  </h3>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[15px] bg-gray-100 transition-transform ${
                      isOpen ? 'rotate-180 bg-red-100 text-[#d90429]' : 'text-gray-500'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>

                {isOpen && (
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
