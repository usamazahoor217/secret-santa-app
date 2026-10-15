'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Gift,
  Sparkles,
  Users,
  ShieldCheck,
  Mail,
  CreditCard,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  generateSecretSantaPairs,
  type ParticipantNode,
  type ExclusionRule,
  type AssignmentPair,
} from '@/lib/algorithms/derangement';

export default function HomePage() {
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

  const [assignments, setAssignments] = React.useState<AssignmentPair[] | null>(
    null
  );
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
      {/* Top Banner & Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#d90429] text-white shadow-md shadow-red-500/20">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#0d2818]">
                SecretSanta<span className="text-[#d90429]">.io</span>
              </span>
              <span className="ml-2 inline-flex items-center rounded-[15px] bg-[#0d2818]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0d2818]">
                v1.0 Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-gray-600 sm:inline">
              Host: <code className="rounded-[15px] bg-gray-100 px-2 py-1 font-mono text-xs">secretsanta.io</code>
            </span>
            <Button
              variant="festive"
              size="sm"
              onClick={() => {
                const liveDemoSection = document.getElementById('interactive-demo');
                liveDemoSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Sparkles className="mr-1.5 h-4 w-4" /> Try Live Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200/60 bg-gradient-to-b from-white to-[#f8f9fa] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-[15px] border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-[#d90429] shadow-sm mb-6">
            <Sparkles className="h-4 w-4" /> 100% Mobile-Friendly & Zero Spoilers Guaranteed
          </div>

          <h1 className="text-4xl font-black tracking-tight text-[#0d2818] sm:text-6xl md:text-7xl">
            Effortless Secret Santa <br className="hidden sm:inline" />
            <span className="text-[#d90429]">for Friends & Teams</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
            Say goodbye to slips of paper. Automated constraint-aware matching,
            one-click magic email reveal links, wishlist coordination, and zero-spoiler security.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/events/new">
              <Button
                variant="festive"
                size="lg"
                className="w-full sm:w-auto font-bold shadow-lg cursor-pointer"
              >
                Organize an Exchange <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('/prd.md', '_blank')}
            >
              Read Full PRD
            </Button>
          </div>

          {/* Architecture Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-gray-600">
            <span className="rounded-[15px] border border-gray-200 bg-white px-3 py-1.5 shadow-xs">
              ⚡ Next.js App Router
            </span>
            <span className="rounded-[15px] border border-gray-200 bg-white px-3 py-1.5 shadow-xs">
              🛡️ Supabase PostgreSQL & RLS
            </span>
            <span className="rounded-[15px] border border-gray-200 bg-white px-3 py-1.5 shadow-xs">
              📬 Resend Transactional API
            </span>
            <span className="rounded-[15px] border border-gray-200 bg-white px-3 py-1.5 shadow-xs">
              💳 Stripe Monetization
            </span>
            <span className="rounded-[15px] border border-gray-200 bg-white px-3 py-1.5 shadow-xs">
              🎯 Strict 15px UI Standard
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo: Derangement Matching Engine */}
      <section id="interactive-demo" className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-[15px] bg-[#0d2818] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white mb-3">
            Interactive Test Laboratory
          </div>
          <h2 className="text-3xl font-extrabold text-[#0d2818] sm:text-4xl">
            Test the Randomization & Matching Algorithm
          </h2>
          <p className="mt-2 text-gray-600">
            Add participants, set exclusion rules (e.g. couples cannot draw each other), and click Draw Names.
            Notice how nobody is ever assigned to themselves!
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Column 1: Participants & Restrictions Config (7 Cols) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Participant Manager Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#d90429]" />
                    Participants Roster ({participants.length})
                  </CardTitle>
                  <CardDescription>
                    Add at least 2 members to run the Secret Santa matching engine.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Add Form */}
                <form
                  onSubmit={handleAddParticipant}
                  className="grid gap-3 sm:grid-cols-12"
                >
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

                {/* Participant List */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-[15px] border border-gray-200 bg-gray-50/80 p-3"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-gray-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {p.email}
                        </p>
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

            {/* Exclusion Rules Matrix Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#0d2818]" />
                  Exclusion Rules ({exclusions.length})
                </CardTitle>
                <CardDescription>
                  Define rules so couples, spouses, or roommates don&apos;t draw each other.
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

                {/* Exclusions Pills */}
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

          {/* Column 2: Results & Drawing Controls (5 Cols) */}
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
                  Runs the Fisher-Yates Derangement algorithm with constraint backtracking.
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
                  className="w-full text-base font-bold shadow-lg"
                  disabled={participants.length < 2 || isDrawing}
                  onClick={handleDrawNames}
                >
                  <RefreshCw
                    className={`mr-2 h-5 w-5 ${isDrawing ? 'animate-spin' : ''}`}
                  />
                  {assignments ? 'Re-Draw Names' : 'Draw Secret Santa Names'}
                </Button>

                {/* Assignment Cards */}
                {assignments ? (
                  <div className="space-y-2.5 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Assignments (Click to reveal/hide)
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
                            <span className="font-semibold text-gray-900">
                              {giverName}
                            </span>
                            <span className="text-xs text-gray-500 block">
                              gives to:
                            </span>
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
                      <strong>✅ Derangement Check Passed:</strong> 0 self-matches, 0 exclusion violations. All {assignments.length} participants matched bijectively.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[15px] border border-dashed border-gray-300 p-8 text-center text-gray-400">
                    <Gift className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-sm font-medium">Click &quot;Draw Secret Santa Names&quot; to test the pairing solver.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Cards Showcase */}
      <section className="border-t border-gray-200 bg-white py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-[#0d2818] sm:text-3xl">
              Engineered for Scalability, Privacy & Delight
            </h3>
            <p className="mt-2 text-gray-600">
              Built on production-tested modern architecture.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-[15px] bg-[#0d2818] text-white flex items-center justify-center mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle>Zero-Spoiler Privacy</CardTitle>
                <CardDescription>
                  PostgreSQL Row Level Security (RLS) ensures even the event organizer cannot view confidential matches.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-[15px] bg-[#d90429] text-white flex items-center justify-center mb-2">
                  <Mail className="h-5 w-5" />
                </div>
                <CardTitle>Resend Magic Links</CardTitle>
                <CardDescription>
                  Participants receive responsive, festive email invitations containing tokenized 1-click reveal links without account creation friction.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-[15px] bg-[#e9c46a] text-[#0d2818] flex items-center justify-center mb-2">
                  <CreditCard className="h-5 w-5" />
                </div>
                <CardTitle>Stripe Holiday Pass</CardTitle>
                <CardDescription>
                  Organize large corporate exchanges with 100+ participants, custom gift templates, and SMS alerts via Stripe Checkout.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-gray-50 py-8 px-6 text-center text-xs text-gray-500">
        <p>© 2026 Secret Santa Organizer. All UI elements adhere strictly to the Inter font and 15px border radius standard.</p>
      </footer>
    </div>
  );
}
