'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Gift,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  Heart,
  Plus,
  Loader2,
  Eye,
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
  getParticipantAssignmentAction,
  submitWishlistAction,
  type RevealAssignmentResult,
} from '@/app/actions/event-actions';

function ParticipantRevealContent() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<RevealAssignmentResult | null>(null);
  const [revealed, setRevealed] = React.useState(false);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = React.useState<string[]>([]);
  const [newWish, setNewWish] = React.useState('');
  const [wishlistSubmitted, setWishlistSubmitted] = React.useState(false);
  const [savingWishlist, setSavingWishlist] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;

    let isMounted = true;
    getParticipantAssignmentAction(token)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setData({ success: false, message: 'Could not load your assignment.' });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.trim()) return;
    setWishlistItems((prev) => [...prev, newWish.trim()]);
    setNewWish('');
  };

  const handleRemoveWish = (idx: number) => {
    setWishlistItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveWishlist = async () => {
    if (!token || wishlistItems.length === 0) return;
    setSavingWishlist(true);
    await submitWishlistAction(token, wishlistItems);
    setSavingWishlist(false);
    setWishlistSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#d90429] mx-auto" />
          <p className="text-sm font-semibold text-gray-600">
            Unwrapping Secret Santa vault...
          </p>
        </div>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-[15px] bg-red-100 text-red-600">
              <Gift className="h-6 w-6" />
            </div>
            <CardTitle>Invite Link Not Found</CardTitle>
            <CardDescription>
              {data?.message || 'This reveal link is invalid or may have expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="festive" className="w-full">
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf2f4] via-[#f8f9fa] to-white text-[#181924] flex flex-col font-sans">
      <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-md py-4 px-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[15px] bg-[#d90429] text-white">
              <Gift className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-[#0d2818] text-lg">
              SecretSanta<span className="text-[#d90429]">.io</span>
            </span>
          </div>
          <span className="text-xs font-semibold rounded-[15px] bg-green-100 text-green-800 px-3 py-1">
            Private Assignment
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 md:py-12 flex-1">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-[15px] bg-[#0d2818] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white mb-3">
            🎄 {data.eventTitle}
          </span>
          <h1 className="text-3xl font-black text-[#0d2818] sm:text-4xl">
            Hello, {data.giverName}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your Secret Santa match has been drawn! Tap below to open your confidential gift assignment.
          </p>
        </div>

        {/* Reveal Card */}
        <Card className="border-2 border-red-200 bg-white shadow-xl overflow-hidden mb-8">
          <div className="h-3 bg-gradient-to-r from-[#d90429] via-[#e9c46a] to-[#2d6a4f]" />
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-gray-500 font-semibold uppercase tracking-wider">
              You are the Secret Santa for:
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-6 pt-4">
            {!revealed ? (
              <div className="rounded-[15px] border-2 border-dashed border-red-200 bg-red-50/50 p-8 space-y-4">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-[15px] bg-[#d90429] text-white shadow-lg animate-bounce">
                  <Gift className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0d2818]">
                    Ready to unwrap your match?
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Make sure no one is looking over your shoulder!
                  </p>
                </div>
                <Button
                  variant="festive"
                  size="lg"
                  className="font-bold shadow-md cursor-pointer text-base"
                  onClick={() => setRevealed(true)}
                >
                  <Eye className="mr-2 h-5 w-5" /> Tap to Reveal Assignment
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="rounded-[15px] bg-gradient-to-r from-[#0d2818] to-[#164228] p-6 text-white shadow-lg">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                    Your Assigned Giftee
                  </span>
                  <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
                    🎁 {data.receiverName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  {data.budgetAmount && (
                    <div className="rounded-[15px] bg-gray-50 border border-gray-200 p-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
                        <DollarSign className="h-4 w-4 text-[#0d2818]" /> Budget
                      </div>
                      <p className="font-bold text-[#0d2818]">
                        {data.budgetAmount} {data.budgetCurrency}
                      </p>
                    </div>
                  )}

                  {data.exchangeDate && (
                    <div className="rounded-[15px] bg-gray-50 border border-gray-200 p-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
                        <Calendar className="h-4 w-4 text-[#d90429]" /> Date
                      </div>
                      <p className="font-bold text-[#0d2818]">
                        {new Date(data.exchangeDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {data.location && (
                  <div className="rounded-[15px] bg-gray-50 border border-gray-200 p-3 text-left flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700">
                      <strong>Location:</strong> {data.location}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wishlist Submission Card */}
        <Card className="border border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-[#0d2818]">
              <Heart className="h-5 w-5 text-[#d90429]" />
              Help Your Secret Santa!
            </CardTitle>
            <CardDescription>
              Add gift ideas or notes for the person who drew YOUR name.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddWish} className="flex gap-2">
              <Input
                placeholder="e.g. Warm knit beanie, coffee beans, book..."
                value={newWish}
                onChange={(e) => setNewWish(e.target.value)}
              />
              <Button type="submit" variant="primary" className="shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </form>

            {wishlistItems.length > 0 ? (
              <div className="space-y-2">
                {wishlistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-[15px] bg-gray-50 border border-gray-200 px-3.5 py-2 text-sm"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWish(idx)}
                      className="text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="festive"
                  className="w-full mt-2"
                  disabled={savingWishlist || wishlistSubmitted}
                  onClick={handleSaveWishlist}
                >
                  {wishlistSubmitted ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Wishlist Saved!
                    </span>
                  ) : savingWishlist ? (
                    'Saving...'
                  ) : (
                    'Save Wishlist for My Secret Santa'
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                No items added yet. Enter a few gift ideas above so your Secret Santa knows what you like!
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ParticipantRevealPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#d90429] mx-auto" />
            <p className="text-sm font-semibold text-gray-600">
              Unwrapping Secret Santa vault...
            </p>
          </div>
        </div>
      }
    >
      <ParticipantRevealContent />
    </React.Suspense>
  );
}
