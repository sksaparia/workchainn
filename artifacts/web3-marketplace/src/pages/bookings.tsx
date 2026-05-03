import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListBookings, useUpdateBookingStatus, getListBookingsQueryKey } from "@workspace/api-client-react";
import { useWeb3 } from "@/lib/web3";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { format } from "date-fns";
import { Wallet, ExternalLink, ArrowRight, Activity, CheckCircle, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="transition-transform hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? "fill-primary text-primary"
                : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= value ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Bookings() {
  const { address, connect, isConnecting } = useWeb3();
  const queryClient = useQueryClient();

  const [ratingDraft, setRatingDraft] = useState<Record<number, { stars: number; review: string }>>({});
  const [ratingOpen, setRatingOpen] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});

  const { data: bookings, isLoading } = useListBookings(
    { clientWallet: address || undefined },
    { query: { enabled: !!address, queryKey: getListBookingsQueryKey({ clientWallet: address || undefined }) } }
  );

  const updateBooking = useUpdateBookingStatus();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey({ clientWallet: address || undefined }) });

  const handleMarkCompleted = async (id: number) => {
    try {
      await updateBooking.mutateAsync({ id, data: { status: "completed" } });
      toast({ title: "Job Completed", description: "Marked as completed. You can now leave a rating." });
      invalidate();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSubmitRating = async (bookingId: number) => {
    const draft = ratingDraft[bookingId];
    if (!draft?.stars) {
      toast({ title: "Pick a star rating first", variant: "destructive" });
      return;
    }
    setSubmitting((s) => ({ ...s, [bookingId]: true }));
    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        data: { clientRating: draft.stars, clientReview: draft.review || null },
      });
      toast({ title: "Rating submitted!", description: "Your review has been saved and the worker's score updated." });
      setRatingOpen((o) => ({ ...o, [bookingId]: false }));
      invalidate();
    } catch (err: any) {
      toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting((s) => ({ ...s, [bookingId]: false }));
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-10 flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">My Bookings</h1>
            <p className="text-muted-foreground font-mono text-sm">TRANSACTION HISTORY & ACTIVE JOBS</p>
          </div>
        </div>

        {!address ? (
          <div className="text-center py-20 border border-dashed border-border bg-card/30">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-wider mb-2">Connect to view bookings</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Connect your Web3 wallet to see your past transactions and current job status.
            </p>
            <Button className="rounded-none uppercase tracking-wider" onClick={connect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 border border-border bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const isRatingOpen = ratingOpen[booking.id] ?? false;
              const draft = ratingDraft[booking.id] ?? { stars: 0, review: "" };
              const canRate = booking.status === "completed" && !booking.clientRating;

              return (
                <Card key={booking.id} className="rounded-none bg-card border-border overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Main content */}
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-bold border ${STATUS_COLOR[booking.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                            {booking.status}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {format(new Date(booking.createdAt), "MMM d, yyyy HH:mm")}
                          </span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-lg font-bold">{booking.rateAmount}</span>
                          <span className="text-sm text-primary ml-1">{booking.rateCurrency}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold mb-0.5">
                          <Link href={`/worker/${booking.workerId}`} className="hover:text-primary transition-colors">
                            {booking.workerName}
                          </Link>
                        </h3>
                        <p className="text-sm text-primary uppercase tracking-wider">{booking.categoryName}</p>
                        {booking.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{booking.description}</p>
                        )}
                      </div>

                      {/* Already rated */}
                      {booking.clientRating && (
                        <div className="flex items-center gap-3 p-3 border border-primary/20 bg-primary/5">
                          <StarDisplay value={booking.clientRating} />
                          <span className="text-xs text-muted-foreground font-mono">Your rating</span>
                          {booking.clientReview && (
                            <span className="text-xs text-muted-foreground italic">"{booking.clientReview}"</span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        {(booking.status === "pending" || booking.status === "confirmed") && (
                          <Button variant="outline" size="sm" className="rounded-none uppercase tracking-wider text-xs"
                            onClick={() => handleMarkCompleted(booking.id)} disabled={updateBooking.isPending}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Mark as Completed
                          </Button>
                        )}

                        {canRate && !isRatingOpen && (
                          <Button size="sm" className="rounded-none uppercase tracking-wider text-xs bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20"
                            onClick={() => setRatingOpen((o) => ({ ...o, [booking.id]: true }))}>
                            <Star className="w-3.5 h-3.5 mr-1.5" /> Leave a Rating
                          </Button>
                        )}
                      </div>

                      {/* Rating panel */}
                      {isRatingOpen && canRate && (
                        <div className="border border-primary/30 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-2 space-y-4">
                          <p className="text-sm font-bold uppercase tracking-wider">Rate {booking.workerName}</p>
                          <StarPicker
                            value={draft.stars}
                            onChange={(stars) => setRatingDraft((d) => ({ ...d, [booking.id]: { ...draft, stars } }))}
                          />
                          <Textarea
                            placeholder="Share your experience (optional)..."
                            className="rounded-none bg-background resize-none h-20 text-sm"
                            value={draft.review}
                            onChange={(e) => setRatingDraft((d) => ({ ...d, [booking.id]: { ...draft, review: e.target.value } }))}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="rounded-none uppercase tracking-wider text-xs bg-primary hover:bg-primary/90"
                              onClick={() => handleSubmitRating(booking.id)} disabled={submitting[booking.id] || !draft.stars}>
                              {submitting[booking.id] ? "Submitting..." : "Submit Rating"}
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-none text-xs"
                              onClick={() => setRatingOpen((o) => ({ ...o, [booking.id]: false }))}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="bg-muted/30 p-6 md:w-60 border-t md:border-t-0 md:border-l border-border flex flex-col justify-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Worker</span>
                        <p className="font-mono text-xs truncate" title={booking.workerWallet}>{booking.workerWallet}</p>
                      </div>
                      {booking.txHash && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Transaction</span>
                          <a href={`https://etherscan.io/tx/${booking.txHash}`} target="_blank" rel="noopener noreferrer"
                            className="font-mono text-xs text-primary flex items-center hover:underline truncate">
                            {booking.txHash.substring(0, 12)}... <ExternalLink className="w-3 h-3 ml-1 shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border bg-card/30">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-wider mb-2">No bookings found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You haven't hired any workers yet. Explore the marketplace to find talent.
            </p>
            <Button className="rounded-none uppercase tracking-wider" onClick={() => window.location.href = "/explore"}>
              Explore Workers <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
