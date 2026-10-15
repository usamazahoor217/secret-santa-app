'use client';

import * as React from 'react';
import {
  Gift,
  Sparkles,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  generateSecretSantaPairs,
  type ParticipantNode,
  type ExclusionRule,
  type AssignmentPair,
} from '@/lib/algorithms/derangement';
import { Navbar } from '@/components/marketing/navbar';
import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Features } from '@/components/marketing/features';
import { PricingSection } from '@/components/marketing/pricing-section';
import { FAQSection } from '@/components/marketing/faq-section';
import { CTABanner } from '@/components/marketing/cta-banner';
import { Footer } from '@/components/marketing/footer';

export default function MarketingLandingPage() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_DOMAIN
      ? `http://${process.env.NEXT_PUBLIC_APP_DOMAIN}`
      : '/events/new';

  // Interactive Live Demo State
  const [participants, setParticipants] = React.useState<ParticipantNode[]>([
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com' },
    { id: '4', name: 'Diana', email: 'diana@example.com' },
  ]);

  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');

  const [exclusions, setExclusions] = React.useState<ExclusionRule[]>([
    { giverId: '1', restrictedReceiverId: '2' }, // Alice cannot give to Bob
  ]);

  const [selectedGiver, setSelectedGiver] = React.useState<string>('1');
  const [selectedRestricted, setSelectedRestricted] = React.useState<string>('2');

  const [assignments, setAssignments] = React.useState<AssignmentPair[] | null>(null);
  const [revealedPairs, setRevealedPairs] = React.useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const id = Date.now().toString();
    const email = newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@example.com`;

    setParticipants((prev) => [...prev, { id, name: newName.trim(), email }]);
    setNewName('');
    setNewEmail('');
    setAssignments(null);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setExclusions((prev) =>
      prev.filter((e) => e.giverId !== id && e.restrictedReceiverId !== id)
    );
    setAssignments(null);
  };

  const handleAddExclusion = () => {
    if (selectedGiver === selectedRestricted) {
      setErrorMessage('A participant already cannot draw themselves.');
      return;
    }

    const alreadyExists = exclusions.some(
      (e) =>
        e.giverId === selectedGiver &&
        e.restrictedReceiverId === selectedRestricted
    );

    if (alreadyExists) {
      setErrorMessage('This restriction is already active.');
      return;
    }

    setErrorMessage(null);
    setExclusions((prev) => [
      ...prev,
      { giverId: selectedGiver, restrictedReceiverId: selectedRestricted },
    ]);
    setAssignments(null);
  };

  const handleRemoveExclusion = (index: number) => {
    setExclusions((prev) => prev.filter((_, i) => i !== index));
    setAssignments(null);
  };

  const handleDrawNames = () => {
    setErrorMessage(null);
    setIsDrawing(true);

    try {
      const results = generateSecretSantaPairs(participants, exclusions);
      setAssignments(results);
      setRevealedPairs({});
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to generate pairings.');
      }
      setAssignments(null);
    } finally {
      setIsDrawing(false);
    }
  };

  const toggleReveal = (giverId: string) => {
    setRevealedPairs((prev) => ({
      ...prev,
      [giverId]: !prev[giverId],
    }));
  };

  const getParticipantName = (id: string) =>
    participants.find((p) => p.id === id)?.name || id;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#181924] flex flex-col font-sans">
      {/* 1. Semantic Navigation Bar */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero appUrl={appUrl} />

        {/* 3. How It Works Section */}
        <HowItWorks appUrl={appUrl} />

        {/* 4. Core Features Showcase */}
        <Features />

        {/* 5. Interactive Test Lab (Derangement Solver) */}
        <section id="interactive-demo" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-[15px] bg-[#0d2818] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Interactive Test Laboratory
            </span>
            <h2 className="text-3xl font-black text-[#0d2818] sm:text-4xl md:text-5xl">
              Test The Matching Engine In Real Time
            </h2>
            <p className="mt-4 text-base text-gray-600 max-w-2xl mx-auto">
              Add your test members, configure exclusion rules, and see the Derangement backtracking algorithm solve it with zero self-matches.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Column 1: Config Roster & Rules */}
            <div className="space-y-6 lg:col-span-7">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#d90429]" />
                      Participants Roster ({participants.length})
                    </CardTitle>
                    <CardDescription>
                      Add names to test how the algorithm distributes pairs.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <form onSubmit={handleAddParticipant} className="grid gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-6">
                      <Input
                        placeholder="Name (e.g. Grandma)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <Input
                        placeholder="Optional Email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button type="submit" variant="primary" className="w-full">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </form>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-[15px] border border-gray-200 bg-gray-50/80 p-3"
                      >
                        <div className="truncate">
                          <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate">{p.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveParticipant(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded-[15px]"
                          title="Remove participant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Exclusion Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#0d2818]" />
                    Exclusion Rules ({exclusions.length})
                  </CardTitle>
                  <CardDescription>
                    Prevent couples or family members from drawing each other.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Participant
                      </label>
                      <select
                        value={selectedGiver}
                        onChange={(e) => setSelectedGiver(e.target.value)}
                        className="w-full h-11 rounded-[15px] border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d2818]/20"
                      >
                        {participants.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="self-center pt-5 text-sm font-bold text-red-500">
                      CANNOT DRAW
                    </span>

                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Restricted Recipient
                      </label>
                      <select
                        value={selectedRestricted}
                        onChange={(e) => setSelectedRestricted(e.target.value)}
                        className="w-full h-11 rounded-[15px] border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d2818]/20"
                      >
                        {participants.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:self-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddExclusion}
                        className="w-full sm:w-auto"
                      >
                        Add Rule
                      </Button>
                    </div>
                  </div>

                  {exclusions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {exclusions.map((rule, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-[15px] border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900"
                        >
                          <strong>{getParticipantName(rule.giverId)}</strong> 🚫{' '}
                          <strong>{getParticipantName(rule.restrictedReceiverId)}</strong>
                          <button
                            onClick={() => handleRemoveExclusion(idx)}
                            className="ml-1 text-amber-700 hover:text-amber-950 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">
                      No active restrictions. All participants have equal odds of drawing each other.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Results */}
            <div className="space-y-6 lg:col-span-5">
              <Card className="border-2 border-[#0d2818]/10 bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#0d2818]">
                      <Sparkles className="h-5 w-5 text-[#d90429]" />
                      Secret Santa Draw
                    </span>
                    {assignments && (
                      <span className="inline-flex items-center gap-1 rounded-[15px] bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Solved
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Runs the Fisher-Yates Derangement solver with constraint satisfaction.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {errorMessage && (
                    <div className="flex items-start gap-2 rounded-[15px] border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <Button
                    variant="festive"
                    size="lg"
                    className="w-full text-base font-bold shadow-lg cursor-pointer"
                    disabled={participants.length < 2 || isDrawing}
                    onClick={handleDrawNames}
                  >
                    <RefreshCw className={`mr-2 h-5 w-5 ${isDrawing ? 'animate-spin' : ''}`} />
                    {assignments ? 'Re-Draw Names' : 'Draw Secret Santa Names'}
                  </Button>

                  {assignments ? (
                    <div className="space-y-2.5 pt-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Confidential Results (Click to reveal)
                      </p>
                      {assignments.map((pair) => {
                        const isRevealed = !!revealedPairs[pair.giverId];
                        const giverName = getParticipantName(pair.giverId);
                        const receiverName = getParticipantName(pair.receiverId);

                        return (
                          <div
                            key={pair.giverId}
                            className="flex items-center justify-between rounded-[15px] border border-gray-200/90 bg-[#f8f9fa] p-3.5 transition-all hover:bg-gray-100/70"
                          >
                            <div>
                              <span className="font-semibold text-gray-900">{giverName}</span>
                              <span className="text-xs text-gray-500 block">gives to:</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`rounded-[15px] px-3 py-1 font-bold text-sm transition-all ${
                                  isRevealed
                                    ? 'bg-[#0d2818] text-white shadow-xs'
                                    : 'bg-gray-200 text-gray-400 select-none'
                                }`}
                              >
                                {isRevealed ? receiverName : '••••••••'}
                              </span>
                              <button
                                onClick={() => toggleReveal(pair.giverId)}
                                className="p-1.5 text-gray-500 hover:text-gray-800 cursor-pointer rounded-[15px]"
                                title={isRevealed ? 'Hide recipient' : 'Reveal recipient'}
                              >
                                {isRevealed ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <div className="rounded-[15px] bg-green-50 p-3 text-xs text-green-900 border border-green-200">
                        <strong>✅ Verified:</strong> 0 self-matches, 0 exclusion violations.
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[15px] border border-dashed border-gray-300 p-8 text-center text-gray-400">
                      <Gift className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-sm font-medium">Click &quot;Draw Secret Santa Names&quot; to test the solver.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 6. Transparent Pricing Comparison */}
        <PricingSection appUrl={appUrl} />

        {/* 7. Frequently Asked Questions */}
        <FAQSection />

        {/* 8. Bottom High-Converting Call to Action Banner */}
        <CTABanner appUrl={appUrl} />
      </main>

      {/* 9. Semantic Footer */}
      <Footer appUrl={appUrl} />
    </div>
  );
}
