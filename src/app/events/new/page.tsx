'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Gift,
  Plus,
  Trash2,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Users,
  Calendar,
  AlertCircle,
  ArrowLeft,
} from '@/components/ui/icons';
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
  createEventAndDrawAction,
  type CreateEventResult,
} from '@/app/actions/event-actions';

interface FormParticipant {
  id: string;
  name: string;
  email: string;
}

interface FormExclusion {
  giverEmail: string;
  restrictedReceiverEmail: string;
}

export default function CreateEventPage() {
  // Form State
  const [title, setTitle] = React.useState('');
  const [budgetAmount, setBudgetAmount] = React.useState('25');
  const [budgetCurrency, setBudgetCurrency] = React.useState('USD');
  const [exchangeDate, setExchangeDate] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Dynamic root marketing homepage URL across subdomains
  const [homeUrl, setHomeUrl] = React.useState<string>('/');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      if (host.startsWith('app.') || host.includes('app.localhost')) {
        const rootHost = host.replace(/^app\./, '');
        setHomeUrl(`${window.location.protocol}//${rootHost}/`);
      } else {
        setHomeUrl('/');
      }
    }
  }, []);

  // Participants
  const [participants, setParticipants] = React.useState<FormParticipant[]>([
    { id: '1', name: 'Alice Smith', email: 'alice@example.com' },
    { id: '2', name: 'Bob Jones', email: 'bob@example.com' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com' },
  ]);

  const [inputName, setInputName] = React.useState('');
  const [inputEmail, setInputEmail] = React.useState('');

  // Exclusions
  const [exclusions, setExclusions] = React.useState<FormExclusion[]>([]);
  const [selectedGiverEmail, setSelectedGiverEmail] = React.useState('');
  const [selectedRestrictedEmail, setSelectedRestrictedEmail] = React.useState('');

  // Derived selections without cascading useEffect renders
  const effectiveGiverEmail = selectedGiverEmail || (participants[0]?.email ?? '');
  const effectiveRestrictedEmail = selectedRestrictedEmail || (participants[1]?.email ?? '');

  // Submission State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<CreateEventResult | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputEmail.trim()) {
      setErrorMsg('Please enter both name and email.');
      return;
    }

    if (participants.some((p) => p.email.toLowerCase() === inputEmail.toLowerCase().trim())) {
      setErrorMsg('A participant with this email address is already added.');
      return;
    }

    setErrorMsg(null);
    setParticipants((prev) => [
      ...prev,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        name: inputName.trim(),
        email: inputEmail.toLowerCase().trim(),
      },
    ]);
    setInputName('');
    setInputEmail('');
  };

  const handleRemoveParticipant = (id: string) => {
    const pToRemove = participants.find((p) => p.id === id);
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    if (pToRemove) {
      setExclusions((prev) =>
        prev.filter(
          (e) =>
            e.giverEmail !== pToRemove.email &&
            e.restrictedReceiverEmail !== pToRemove.email
        )
      );
    }
  };

  const handleAddExclusion = () => {
    if (!effectiveGiverEmail || !effectiveRestrictedEmail) return;

    if (effectiveGiverEmail === effectiveRestrictedEmail) {
      setErrorMsg('A participant cannot be excluded from drawing themselves.');
      return;
    }

    const exists = exclusions.some(
      (e) =>
        e.giverEmail === effectiveGiverEmail &&
        e.restrictedReceiverEmail === effectiveRestrictedEmail
    );
    if (exists) {
      setErrorMsg('This exclusion rule already exists.');
      return;
    }

    setErrorMsg(null);
    setExclusions((prev) => [
      ...prev,
      {
        giverEmail: effectiveGiverEmail,
        restrictedReceiverEmail: effectiveRestrictedEmail,
      },
    ]);
  };

  const handleRemoveExclusion = (index: number) => {
    setExclusions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please enter an event title (e.g. "Smith Family Christmas 2026").');
      return;
    }

    if (participants.length < 2) {
      setErrorMsg('You need at least 2 participants for a Secret Santa exchange.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createEventAndDrawAction({
        title: title.trim(),
        description: description.trim() || undefined,
        budgetAmount: budgetAmount ? parseFloat(budgetAmount) : null,
        budgetCurrency,
        exchangeDate: exchangeDate || undefined,
        location: location.trim() || undefined,
        participants: participants.map((p) => ({
          name: p.name,
          email: p.email,
        })),
        exclusions,
      });

      if (!res.success) {
        setErrorMsg(res.message || 'Failed to create exchange.');
      } else {
        setResult(res);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#181924] flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a
            href={homeUrl}
            className="flex items-center gap-2.5 text-[#0d2818] font-bold hover:text-[#d90429] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </a>

          <a
            href={homeUrl}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[15px] bg-[#d90429] text-white shadow-xs">
              <Gift className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-[#0d2818] text-lg hidden sm:inline">
              SecretSanta<span className="text-[#d90429]">.io</span>
            </span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-12">
        {!result ? (
          <div>
            {/* Header Title */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-[15px] bg-[#0d2818]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0d2818] mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Event Creation Wizard
              </span>
              <h1 className="text-3xl font-black text-[#0d2818] sm:text-4xl">
                Create a Secret Santa Group
              </h1>
              <p className="mt-2 text-sm text-gray-600 sm:text-base max-w-xl mx-auto">
                Fill out the event details, enter your participants, set any exclusion constraints, and we&apos;ll automatically draw and send secret invite emails.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 flex items-start gap-3 rounded-[15px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <p className="font-medium">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="h-5 w-5 text-[#0d2818]" />
                    1. Event Information
                  </CardTitle>
                  <CardDescription>
                    Provide the title, spending budget, and exchange date for your gift exchange.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      label="Event Name"
                      placeholder="e.g. Smith Family Christmas 2026"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Input
                        label="Suggested Budget / Spending Limit"
                        type="number"
                        placeholder="e.g. 25"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                        Currency
                      </label>
                      <select
                        value={budgetCurrency}
                        onChange={(e) => setBudgetCurrency(e.target.value)}
                        className="flex h-11 w-full rounded-[15px] border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0d2818]/20"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Input
                        label="Gift Exchange Date"
                        type="date"
                        value={exchangeDate}
                        onChange={(e) => setExchangeDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Location / Meeting Link (Optional)"
                        placeholder="e.g. Grandma's House or Zoom Link"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Holiday Note / Instructions (Optional)"
                      placeholder="e.g. Handmade gifts encouraged, festive sweaters mandatory!"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Add Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5 text-[#d90429]" />
                    2. Participant Roster ({participants.length})
                  </CardTitle>
                  <CardDescription>
                    Add each participant&apos;s name and email address. They will receive an email via Resend with their secret reveal link.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Inline Add Form */}
                  <div className="rounded-[15px] border border-gray-200 bg-gray-50/80 p-4">
                    <div className="grid gap-3 sm:grid-cols-12 items-end">
                      <div className="sm:col-span-5">
                        <Input
                          label="Full Name"
                          placeholder="e.g. Alice Smith"
                          value={inputName}
                          onChange={(e) => setInputName(e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <Input
                          label="Email Address"
                          type="email"
                          placeholder="e.g. alice@example.com"
                          value={inputEmail}
                          onChange={(e) => setInputEmail(e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Button
                          type="button"
                          variant="primary"
                          className="w-full h-11"
                          onClick={handleAddParticipant}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Participant List */}
                  <div className="space-y-2">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-[15px] border border-gray-200 bg-white px-4 py-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[15px] bg-[#0d2818]/10 font-bold text-[#0d2818]">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {p.email}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(p.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded-[15px]"
                          title="Remove participant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Pair Restrictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ShieldCheck className="h-5 w-5 text-[#0d2818]" />
                    3. Exclusion Rules (Optional)
                  </CardTitle>
                  <CardDescription>
                    Ensure spouses, siblings, or roommates do not draw each other.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
                        Giver
                      </label>
                      <select
                        value={effectiveGiverEmail}
                        onChange={(e) => setSelectedGiverEmail(e.target.value)}
                        className="h-11 w-full rounded-[15px] border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d2818]/20"
                      >
                        {participants.map((p) => (
                          <option key={p.id} value={p.email}>
                            {p.name} ({p.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-center font-bold text-xs text-red-500 self-center sm:pb-3">
                      CANNOT DRAW
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase">
                        Restricted Recipient
                      </label>
                      <select
                        value={effectiveRestrictedEmail}
                        onChange={(e) => setSelectedRestrictedEmail(e.target.value)}
                        className="h-11 w-full rounded-[15px] border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d2818]/20"
                      >
                        {participants.map((p) => (
                          <option key={p.id} value={p.email}>
                            {p.name} ({p.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-full sm:w-auto"
                        onClick={handleAddExclusion}
                      >
                        Add Rule
                      </Button>
                    </div>
                  </div>

                  {/* Active Exclusions Pills */}
                  {exclusions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {exclusions.map((ex, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-[15px] border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900"
                        >
                          <span>{ex.giverEmail} 🚫 {ex.restrictedReceiverEmail}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExclusion(idx)}
                            className="ml-1 text-amber-700 hover:text-amber-950 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Trigger */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="festive"
                  size="lg"
                  className="w-full text-lg font-bold shadow-xl cursor-pointer"
                  disabled={isSubmitting}
                >
                  <Send className={`mr-2 h-5 w-5 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  {isSubmitting
                    ? 'Drawing Names & Sending Emails...'
                    : 'Draw Names & Send Secret Emails'}
                </Button>
                <p className="mt-3 text-center text-xs text-gray-500">
                  🔒 Zero-Spoiler guarantee: Even you as the organizer will not be shown who drew whom.
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="space-y-6">
            <Card className="border-2 border-green-500/20 bg-white shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[15px] bg-green-100 text-green-700">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-black text-[#0d2818]">
                  Secret Santa Drawn Successfully!
                </CardTitle>
                <CardDescription className="text-base text-gray-600 max-w-lg mx-auto">
                  {result.message}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Metrics Stats */}
                <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
                  <div className="rounded-[15px] bg-[#0d2818]/5 p-4">
                    <p className="text-2xl font-black text-[#0d2818]">
                      {result.participantsCount}
                    </p>
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                      Participants
                    </p>
                  </div>
                  <div className="rounded-[15px] bg-red-50 p-4">
                    <p className="text-2xl font-black text-[#d90429]">
                      {result.emailsSent}
                    </p>
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                      Emails Triggered
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-[15px] bg-green-50 p-4">
                    <p className="text-2xl font-black text-green-800">100%</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                      Zero Spoilers
                    </p>
                  </div>
                </div>

                {/* Direct Reveal Links (Backup for organizer) */}
                {result.inviteLinks && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900">
                        Magic Reveal Links
                      </h4>
                      <span className="text-xs text-gray-500">
                        Share directly if any participant misses their email
                      </span>
                    </div>

                    <div className="space-y-2">
                      {result.inviteLinks.map((link) => (
                        <div
                          key={link.participantId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-[15px] border border-gray-200 bg-gray-50 p-3.5"
                        >
                          <div>
                            <span className="font-semibold text-gray-900 text-sm">
                              {link.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({link.email})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(link.revealUrl, link.participantId)
                              }
                              className="text-xs"
                            >
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              {copiedId === link.participantId ? 'Copied!' : 'Copy Link'}
                            </Button>
                            <a
                              href={link.revealUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center h-9 px-3 rounded-[15px] bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              Open
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="festive"
                    className="w-full"
                    onClick={() => {
                      setResult(null);
                      setTitle('');
                      setParticipants([
                        { id: '1', name: 'Alice Smith', email: 'alice@example.com' },
                        { id: '2', name: 'Bob Jones', email: 'bob@example.com' },
                      ]);
                    }}
                  >
                    Organize Another Event
                  </Button>
                  <a
                    href={homeUrl}
                    className="w-full inline-flex items-center justify-center rounded-[15px] border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
                  >
                    Return to Homepage
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
