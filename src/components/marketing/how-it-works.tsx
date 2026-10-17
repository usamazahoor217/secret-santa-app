import * as React from 'react';
import { Calendar, Users, Mail, ArrowRight, Check } from '@/components/ui/icons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HowItWorksProps {
  appUrl: string;
}

export function HowItWorks({ appUrl }: HowItWorksProps) {
  const steps = [
    {
      step: '01',
      icon: Calendar,
      title: 'Create Your Event',
      description:
        'Set the event name, spending budget limit, gift exchange date, and optional location or video link in under 60 seconds.',
      highlights: [
        'Custom spending limits & currencies',
        'Physical or virtual event support',
        'Optional theme rules & notes',
      ],
      badgeColor: 'bg-[#0d2818] text-white',
    },
    {
      step: '02',
      icon: Users,
      title: 'Invite & Set Exclusions',
      description:
        'Enter names and email addresses. Prevent couples, spouses, or roommates from drawing each other using smart exclusion rules.',
      highlights: [
        'Unlimited exclusion constraints',
        'Mathematically guaranteed fair pairs',
        'Zero self-matches ever',
      ],
      badgeColor: 'bg-[#d90429] text-white',
    },
    {
      step: '03',
      icon: Mail,
      title: 'Reveal With Zero Spoilers',
      description:
        'Hit "Draw Names" and transactional emails are delivered via Resend. Each participant gets a 1-click magic link with a festive unwrap reveal.',
      highlights: [
        'No app downloads or passwords needed',
        'Built-in wishlists & clothing size hints',
        'Organizers cannot peek or spoil results',
      ],
      badgeColor: 'bg-[#2d6a4f] text-white',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white border-b border-gray-200/80">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-[15px] bg-[#0d2818]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0d2818] mb-3">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-black text-[#0d2818] sm:text-4xl md:text-5xl">
            How Secret Santa Organizer Works
          </h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            Organizing a holiday exchange used to mean cutting paper slips and drawing again when someone picked themselves. We made it automated, private, and fun.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.step} className="flex flex-col h-full">
                <Card className="h-full flex flex-col justify-between border border-gray-200/90 bg-[#f8f9fa] hover:border-gray-300 hover:shadow-md transition-all">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-[15px] font-black text-sm shadow-xs ${item.badgeColor}`}>
                        {item.step}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-[15px] bg-white border border-gray-200 text-gray-700 shadow-2xs">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <CardTitle className="text-xl font-extrabold text-[#0d2818]">
                      {item.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <ul className="space-y-2 border-t border-gray-200/60 pt-4 text-xs font-medium text-gray-700">
                      {item.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-[#2d6a4f] shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA within How It Works */}
        <div className="mt-14 text-center">
          <a href={appUrl}>
            <Button
              variant="festive"
              size="lg"
              className="font-bold shadow-lg shadow-red-500/20"
            >
              Start Your Free Exchange Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
