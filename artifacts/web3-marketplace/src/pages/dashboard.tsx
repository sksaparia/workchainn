import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWeb3 } from "@/lib/web3";
import {
  useGetWorkerByWallet,
  useListBookings,
  useUpdateBookingStatus,
} from "@workspace/api-client-react";
import {
  Wallet, LayoutDashboard, CheckCircle2, Clock, XCircle,
  TrendingUp, Star, Briefcase, ArrowRight, AlertCircle,
  ChevronRight, Edit, Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",  icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500/10 text-blue-400 border-blue-500/30",        icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-400 border-green-500/30",     icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400 border-red-500/30",           icon: XCircle },
} as const;

type BookingStatus = keyof typeof STATUS_CONFIG;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { address, isConnecting, connect } = useWeb3();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");

  const { data: worker, isLoading: workerLoading } = useGetWorkerByWallet(
    address ?? "",
    { query: { enabled: !!address, retry: false, queryKey: ["/api/workers/by-wallet", address] } }
  );

  const { data: bookings = [], isLoading: bookingsLoading, refetch } = useListBookings(
    { workerId: worker?.id },
    { query: { enabled: !!worker?.id, refetchInterval: 10000, queryKey: ["/api/bookings/worker", worker?.id] } }
  );

  const updateBooking = useUpdateBookingStatus();

  const handleMarkComplete = async (bookingId: number) => {
    try {
      await updateBooking.mutateAsync({ id: bookingId, data: { status: "completed" } });
      toast({ title: "Job marked complete!", description: "The booking has been marked as completed." });
      refetch();
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleConfirm = async (bookingId: number) => {
    try {
      await updateBooking.mutateAsync({ id: bookingId, data: { status: "confirmed" } });
      toast({ title: "Booking confirmed!", description: "You've accepted this booking." });
      refetch();
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleCancel = async (bookingId: number) => {
    try {
      await updateBooking.mutateAsync({ id: bookingId, data: { status: "cancelled" } });
      toast({ title: "Booking cancelled.", variant: "destructive" });
      refetch();
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  // Stats
  const total     = bookings.length;
  const pending   = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const completed = bookings.filter(b => b.status === "completed").length;

  // Earnings: sum rateAmount for completed bookings
  const earnings = bookings
    .filter(b => b.status === "completed")
    .reduce((acc, b) => acc + parseFloat(b.rateAmount), 0);

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  // ── Not connected ──────────────────────────────────────────────────────────
  if (!address) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center gap-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-3">Worker Dashboard</h1>
            <p className="text-muted-foreground">Connect your wallet to view your jobs, earnings, and manage bookings.</p>
          </div>
          <Button size="lg" className="rounded-none uppercase tracking-wider font-bold h-14 px-10" onClick={connect} disabled={isConnecting}>
            <Wallet className="w-5 h-5 mr-2" />{isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      </Layout>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (workerLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  // ── No worker profile ──────────────────────────────────────────────────────
  if (!worker) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center gap-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-3">No Worker Profile</h1>
            <p className="text-muted-foreground mb-1">You haven't registered as a worker yet.</p>
            <p className="font-mono text-xs text-muted-foreground">{address.substring(0, 8)}...{address.substring(36)}</p>
          </div>
          <div className="flex gap-3">
            <Button className="rounded-none uppercase tracking-wider font-bold h-12 px-8 bg-primary" onClick={() => setLocation("/register")}>
              Become a Worker <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="rounded-none uppercase tracking-wider h-12 px-6" onClick={() => setLocation("/bookings")}>
              My Bookings
            </Button>
          </div>
          <div className="flex items-center gap-2 p-3 border border-yellow-500/30 bg-yellow-500/5 text-xs text-yellow-400 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Dashboard is for workers only. Connect the wallet you registered with.</span>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <Layout>
      {/* Header */}
      <div className="bg-card border-b border-border py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-mono mb-2">Worker Dashboard</p>
              <h1 className="text-4xl font-bold uppercase tracking-tight">{worker.displayName}</h1>
              <p className="text-muted-foreground mt-2 font-mono text-sm">{worker.categoryName} · {worker.rateAmount} {worker.rateCurrency}/{worker.rateType}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-none uppercase tracking-wider text-xs h-10 px-4 border-primary/40 text-primary hover:bg-primary/10" onClick={() => setLocation(`/worker/${worker.id}`)}>
                <Eye className="w-4 h-4 mr-2" /> Public Profile
              </Button>
              <Button variant="outline" className="rounded-none uppercase tracking-wider text-xs h-10 px-4" onClick={() => setLocation("/edit-profile")}>
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-10">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: total,     icon: Briefcase,    color: "text-primary",   bg: "bg-primary/10" },
            { label: "Pending",        value: pending,   icon: Clock,        color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Confirmed",      value: confirmed, icon: CheckCircle2, color: "text-blue-400",   bg: "bg-blue-500/10" },
            { label: "Completed",      value: completed, icon: Star,         color: "text-green-400",  bg: "bg-green-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="rounded-none border-border bg-card/80">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">{value}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Earnings summary */}
        {completed > 0 && (
          <Card className="rounded-none border-secondary/30 bg-secondary/5">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 flex items-center justify-center bg-secondary/20">
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs uppercase tracking-widest text-secondary font-mono mb-1">Estimated Earnings (completed jobs)</p>
                <p className="text-4xl font-bold font-mono">{earnings.toFixed(4)} <span className="text-secondary text-2xl">{worker.rateCurrency}</span></p>
                <p className="text-xs text-muted-foreground mt-1">Based on {completed} completed {completed === 1 ? "job" : "jobs"} · paid directly to your wallet</p>
              </div>
              <div className="flex flex-col gap-2 text-right font-mono text-sm">
                <div className="text-muted-foreground">Completed Jobs: <span className="text-foreground font-bold">{completed}</span></div>
                <div className="text-muted-foreground">Rating: <span className="text-primary font-bold">{worker.rating ? Number(worker.rating).toFixed(1) : "N/A"} ★</span></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookings list */}
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-wider">Incoming Jobs</h2>
            {/* Filter tabs */}
            <div className="flex border border-border">
              {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border-r border-border last:border-0 transition-colors
                    ${filter === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                >
                  {s === "all" ? `All (${total})` : `${s} (${bookings.filter(b => b.status === s).length})`}
                </button>
              ))}
            </div>
          </div>

          {bookingsLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-border bg-card/20 py-16 flex flex-col items-center text-center gap-4">
              <Briefcase className="w-12 h-12 text-muted-foreground/40" />
              <div>
                <p className="font-bold uppercase text-muted-foreground">No {filter === "all" ? "" : filter} bookings yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Jobs booked through your profile will appear here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((booking) => {
                const StatusIcon = STATUS_CONFIG[booking.status as BookingStatus]?.icon ?? Clock;
                const statusCfg = STATUS_CONFIG[booking.status as BookingStatus];
                return (
                  <Card key={booking.id} className="rounded-none border-border bg-card/60 hover:bg-card/90 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        {/* Client + date */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${statusCfg?.color ?? ""}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusCfg?.label ?? booking.status}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">#{booking.id}</span>
                          </div>
                          <p className="font-mono text-sm text-muted-foreground truncate">
                            Client: <span className="text-foreground">{booking.clientWallet.substring(0, 8)}...{booking.clientWallet.substring(36)}</span>
                          </p>
                          {booking.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{booking.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>

                        {/* Rate */}
                        <div className="text-right shrink-0">
                          <p className="font-mono font-bold text-lg">{booking.rateAmount} <span className="text-primary text-sm">{booking.rateCurrency}</span></p>
                          <p className="text-xs text-muted-foreground">per {worker.rateType}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 shrink-0">
                          {booking.status === "pending" && (
                            <>
                              <Button size="sm" className="rounded-none uppercase text-xs tracking-wider bg-blue-600 hover:bg-blue-700 text-white h-9 px-3"
                                onClick={() => handleConfirm(booking.id)} disabled={updateBooking.isPending}>
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accept
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-none uppercase text-xs tracking-wider border-red-500/40 text-red-400 hover:bg-red-500/10 h-9 px-3"
                                onClick={() => handleCancel(booking.id)} disabled={updateBooking.isPending}>
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                              </Button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <Button size="sm" className="rounded-none uppercase text-xs tracking-wider bg-green-600 hover:bg-green-700 text-white h-9 px-4"
                              onClick={() => handleMarkComplete(booking.id)} disabled={updateBooking.isPending}>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Complete
                            </Button>
                          )}
                          {(booking.status === "completed" || booking.status === "cancelled") && (
                            <Button size="sm" variant="ghost" className="rounded-none uppercase text-xs tracking-wider text-muted-foreground h-9 px-3"
                              onClick={() => setLocation(`/messages`)}>
                              <ChevronRight className="w-3.5 h-3.5 mr-1" /> Message
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
