'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Gift,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Mail,
  Loader2,
  Check,
} from '@/components/ui/icons';

interface GroupData {
  id: string;
  title: string;
  description?: string | null;
  budgetAmount?: string | number | null;
  budgetCurrency?: string;
  exchangeDate?: string | null;
  location?: string | null;
  status: string;
  isPremium: boolean;
  participants: {
    id: string;
    name: string;
    email: string;
    inviteToken?: string;
    hasViewedAssignment: boolean;
    viewedAt?: string | null;
    createdAt: string;
  }[];
}

function EventDashboardContent() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = React.useState(true);
  const [group, setGroup] = React.useState<GroupData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
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

  React.useEffect(() => {
    if (!id) return;

    fetch(`/api/groups/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setGroup(data.data);
        } else {
          setError(data.message || 'Event not found.');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load event details. Please verify your connection.');
        setLoading(false);
      });
  }, [id]);

  const handleCopyLink = (token: string, participantId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const revealUrl = `${origin}/reveal/${token}`;
    navigator.clipboard.writeText(revealUrl);
    setCopiedId(participantId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-rose-500 mx-auto" />
          <p className="text-sm font-semibold text-neutral-400">
            Loading event dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-neutral-800 border border-neutral-700 rounded-[15px] p-8 text-center shadow-2xl">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-[15px] flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h1 className="text-xl font-bold mb-2">Event Not Found</h1>
          <p className="text-sm text-neutral-400 mb-6">{error || 'This event does not exist or has been removed.'}</p>
          <a
            href={homeUrl}
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-[15px] transition"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  const viewedCount = group.participants.filter((p) => p.hasViewedAssignment).length;
  const totalCount = group.participants.length;

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-rose-500 selection:text-white">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-900/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-rose-900/20 rounded-full blur-[128px]" />
      </div>

      <header className="relative z-10 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a
            href={homeUrl}
            className="flex items-center gap-2 text-white hover:text-rose-400 transition"
          >
            <div className="w-9 h-9 rounded-[15px] bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-900/30">
              <Gift size={20} />
            </div>
            <span className="font-bold tracking-tight text-lg">SecretSanta</span>
          </a>

          <div className="flex items-center gap-3">
            <Link
              href="/events/new"
              className="text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-[15px] transition flex items-center gap-2"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Create New Event</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <a
            href={homeUrl}
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </a>
        </div>

        {/* Event Header Banner */}
        <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-[15px] p-6 sm:p-8 mb-8 backdrop-blur shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-[15px] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  {group.status}
                </span>
                {group.isPremium && (
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-[15px] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} />
                    Premium Pass
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {group.title}
              </h1>
              {group.description && (
                <p className="text-neutral-400 text-sm mt-1 max-w-2xl">
                  {group.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap md:flex-col gap-3 text-sm text-neutral-300">
              <div className="flex items-center gap-2 bg-neutral-900/60 px-3 py-1.5 rounded-[15px] border border-neutral-700/50">
                <DollarSign size={16} className="text-emerald-400" />
                <span>
                  Budget:{' '}
                  <strong>
                    {group.budgetAmount ? `${group.budgetAmount} ${group.budgetCurrency || 'USD'}` : 'No limit'}
                  </strong>
                </span>
              </div>
              {group.exchangeDate && (
                <div className="flex items-center gap-2 bg-neutral-900/60 px-3 py-1.5 rounded-[15px] border border-neutral-700/50">
                  <Calendar size={16} className="text-rose-400" />
                  <span>
                    Exchange:{' '}
                    <strong>{new Date(group.exchangeDate).toLocaleDateString()}</strong>
                  </span>
                </div>
              )}
              {group.location && (
                <div className="flex items-center gap-2 bg-neutral-900/60 px-3 py-1.5 rounded-[15px] border border-neutral-700/50">
                  <MapPin size={16} className="text-amber-400" />
                  <span>{group.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar: Reveals Opened */}
          <div className="mt-8 pt-6 border-t border-neutral-700/60">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-medium">
                Participant Reveal Progress ({viewedCount} of {totalCount} opened)
              </span>
              <span className="font-semibold text-white">
                {totalCount > 0 ? Math.round((viewedCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-700 rounded-[15px] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 transition-all duration-500"
                style={{
                  width: `${totalCount > 0 ? (viewedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Anti-Spoiler Notice */}
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-[15px] p-4 mb-8 flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200/90 leading-relaxed">
            <strong className="text-emerald-300 font-semibold">Anti-Spoiler Privacy Guarantee:</strong> Pairings are sealed cryptographically. To preserve the magic of Secret Santa, organizers cannot view who is assigned to whom. You can monitor whether invitations have been opened below.
          </div>
        </div>

        {/* Participant Roster Table */}
        <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-[15px] overflow-hidden shadow-xl">
          <div className="p-6 border-b border-neutral-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[15px] bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Users size={18} />
              </div>
              <h2 className="text-lg font-bold text-white">
                Participant Roster ({totalCount})
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-neutral-900/50 text-xs uppercase text-neutral-400 border-b border-neutral-700/60">
                <tr>
                  <th className="py-3.5 px-6">Participant</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Assignment Status</th>
                  <th className="py-3.5 px-6 text-right">Magic Reveal Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/40">
                {group.participants.map((participant) => (
                  <tr
                    key={participant.id}
                    className="hover:bg-neutral-700/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-white">
                      {participant.name}
                    </td>
                    <td className="py-4 px-6 text-neutral-400">
                      {participant.email}
                    </td>
                    <td className="py-4 px-6">
                      {participant.hasViewedAssignment ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[15px] text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 size={12} />
                          Viewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[15px] text-xs font-semibold bg-neutral-700/40 text-neutral-400 border border-neutral-600/40">
                          <AlertCircle size={12} />
                          Unopened
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {participant.inviteToken ? (
                        <button
                          type="button"
                          onClick={() => handleCopyLink(participant.inviteToken!, participant.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[15px] bg-neutral-700 hover:bg-neutral-600 text-white transition"
                        >
                          {copiedId === participant.id ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-500">Sealed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EventDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 text-white font-sans">
          <div className="text-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-neutral-400">
              Loading event...
            </p>
          </div>
        </div>
      }
    >
      <EventDashboardContent />
    </React.Suspense>
  );
}
