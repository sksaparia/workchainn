import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useGetWorker, useCreateBooking, useSendMessage, useListBookings } from "@workspace/api-client-react";
import { useWeb3 } from "@/lib/web3";
import { getPlatformWallet, PLATFORM_FEE_PERCENT } from "@/lib/web3";
import {
  MapPin, Globe, Star, CheckCircle2, Calendar, Clock,
  ArrowLeft, ShieldCheck, MessageSquare, Send, X,
  AlertCircle, TrendingDown, Info, Copy, Check
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function WorkerProfile() {
  const { id } = useParams<{ id: string }>();
  const workerId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { address, isConnecting, connect, sendTransaction, sendUsdtTransaction } = useWeb3();

  const [description, setDescription] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isAdvanceBooking, setIsAdvanceBooking] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [bookingTab, setBookingTab] = useState<"full" | "advance">("full");
  const [copiedWorker, setCopiedWorker] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState(false);

  const copyToClipboard = (text: string, which: "worker" | "platform") => {
    navigator.clipboard.writeText(text);
    if (which === "worker") { setCopiedWorker(true); setTimeout(() => setCopiedWorker(false), 2000); }
    else { setCopiedPlatform(true); setTimeout(() => setCopiedPlatform(false), 2000); }
  };

  const { data: worker, isLoading, error } = useGetWorker(workerId, {
    query: { enabled: !!workerId, queryKey: ["/api/workers", workerId] }
  });

  const { data: allBookings } = useListBookings(
    { workerId },
    { query: { enabled: !!workerId, queryKey: ["/api/bookings/worker-reviews", workerId] } }
  );
  const reviews = (allBookings ?? []).filter(b => b.status === "completed" && b.clientRating);

  const createBooking = useCreateBooking();
  const sendMessage = useSendMessage();

  // ── Currency helpers ─────────────────────────────────────
  const NATIVE_CURRENCIES = ["BTC", "SOL"];
  const isNativeCurrency = (c: string) => NATIVE_CURRENCIES.includes(c.toUpperCase());

  // ── Derived amounts ──────────────────────────────────────
  const rate            = parseFloat(worker?.rateAmount ?? "0");
  const advancePct      = worker?.advanceDepositPercent ?? 0;
  const hasAdvance      = !!advancePct && advancePct >= 5;

  // Full payment split: 99% to worker, 1% to platform
  const platformFeeOnFull  = parseFloat((rate * PLATFORM_FEE_PERCENT / 100).toFixed(6));
  const workerReceivesFull = parseFloat((rate - platformFeeOnFull).toFixed(6));

  // Advance booking amounts
  const advanceAmount      = parseFloat((rate * advancePct / 100).toFixed(4));
  const platformFeeAdvance = parseFloat((rate * PLATFORM_FEE_PERCENT / 100).toFixed(4));
  const clientUpfront      = parseFloat((advanceAmount + platformFeeAdvance).toFixed(4));
  const remainingOnDone    = parseFloat((rate - advanceAmount).toFixed(4));

  // ── Full booking (2 steps: worker 99% + platform 1%) ─────
  const handleBook = async () => {
    if (!address) {
      toast({ title: "Connect your wallet", description: "You need a Web3 wallet to book a worker.", variant: "destructive" });
      return;
    }
    if (!worker) return;
    setIsBooking(true);
    const platformWallet = getPlatformWallet(worker.rateCurrency);
    try {
      // Step 1 — pay worker (99% of rate)
      toast({ title: "Step 1 of 2 — Pay Worker", description: `Sending ${workerReceivesFull} ${worker.rateCurrency} to ${worker.displayName}...` });
      const txWorker = await sendTransaction(worker.walletAddress, String(workerReceivesFull));
      if (!txWorker) throw new Error("Worker payment rejected or failed.");

      // Step 2 — pay platform fee (1%) to the correct currency wallet
      toast({ title: "Step 2 of 2 — Platform Fee", description: `Sending ${platformFeeOnFull} ${worker.rateCurrency} platform fee (1%)...` });
      const txPlatform = await sendTransaction(platformWallet, String(platformFeeOnFull));
      if (!txPlatform) throw new Error("Platform fee payment rejected or failed.");

      await createBooking.mutateAsync({
        data: { workerId: worker.id, clientWallet: address, description: description || null }
      });
      toast({ title: "Booking Confirmed!", description: `Worker paid · 1% platform fee applied.` });
      setLocation("/bookings");
    } catch (err: any) {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };

  // ── Advance booking (optional, USDT) ─────────────────────
  const handleAdvanceBook = async () => {
    if (!address) {
      toast({ title: "Connect your wallet", variant: "destructive" });
      return;
    }
    if (!worker || !advancePct) return;
    setIsAdvanceBooking(true);
    // Advance booking is always in USDT — use the USDT platform wallet
    const platformWallet = getPlatformWallet("USDT");
    try {
      toast({ title: "Step 1 of 2 — Advance Deposit", description: `Sending ${advanceAmount} USDT to ${worker.displayName}...` });
      const txWorker = await sendUsdtTransaction(worker.walletAddress, advanceAmount);
      if (!txWorker) throw new Error("Advance payment rejected or failed.");

      toast({ title: "Step 2 of 2 — Platform Fee", description: `Sending ${platformFeeAdvance} USDT platform fee (1%)...` });
      const txPlatform = await sendUsdtTransaction(platformWallet, platformFeeAdvance);
      if (!txPlatform) throw new Error("Platform fee payment rejected or failed.");

      await createBooking.mutateAsync({
        data: {
          workerId: worker.id,
          clientWallet: address,
          description: description ? `[ADVANCE ${advancePct}%] ${description}` : `[ADVANCE ${advancePct}%]`,
        }
      });
      toast({
        title: "Advance Booking Confirmed!",
        description: `${advanceAmount} USDT sent · ${platformFeeAdvance} USDT platform fee · ${remainingOnDone} USDT due on completion.`,
      });
      setLocation("/bookings");
    } catch (err: any) {
      toast({ title: "Advance Booking Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAdvanceBooking(false);
    }
  };

  // ── Message ──────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!address) { connect(); return; }
    if (!worker || !messageText.trim()) return;
    if (address.toLowerCase() === worker.walletAddress.toLowerCase()) {
      toast({ title: "Can't message yourself", variant: "destructive" });
      return;
    }
    setIsSendingMsg(true);
    try {
      await sendMessage.mutateAsync({ data: { fromWallet: address, toWallet: worker.walletAddress, content: messageText.trim() } });
      toast({ title: "Message sent!" });
      setMessageText(""); setShowMessageBox(false);
      setLocation("/messages");
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally {
      setIsSendingMsg(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }
  if (error || !worker) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold uppercase mb-4 text-destructive">Worker Not Found</h2>
          <Button variant="outline" className="rounded-none uppercase" onClick={() => setLocation("/explore")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Explore
          </Button>
        </div>
      </Layout>
    );
  }

  const initials = worker.displayName.substring(0, 2).toUpperCase();

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-card border-b border-border pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container mx-auto px-4 relative z-10">
          <Button variant="ghost" className="mb-8 rounded-none uppercase text-xs tracking-wider text-muted-foreground hover:text-foreground" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="w-32 h-32 md:w-48 md:h-48 border-4 border-background shadow-xl rounded-none">
              <AvatarImage src={worker.avatarUrl || ""} alt={worker.displayName} className="object-cover" />
              <AvatarFallback className="rounded-none bg-muted text-4xl font-mono">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">{worker.displayName}</h1>
                  <p className="text-xl text-primary mt-2 font-mono uppercase tracking-widest">{worker.categoryName}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-background border border-border p-4 flex flex-col items-end">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Rate</span>
                    <div className="font-mono flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{worker.rateAmount}</span>
                      <span className="text-lg text-primary">{worker.rateCurrency}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">per {worker.rateType}</span>
                  </div>
                  {hasAdvance && (
                    <div className="bg-secondary/10 border border-secondary/40 px-3 py-2 text-center">
                      <span className="text-xs font-mono text-secondary uppercase tracking-wider">
                        ⚡ Optional {advancePct}% Advance in USDT
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-mono mt-2">
                <Badge variant={worker.isAvailable ? "default" : "secondary"} className="rounded-none uppercase tracking-wider">
                  {worker.isAvailable ? "Available Now" : "Busy"}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground bg-card/50 px-3 py-1 border border-border">
                  {worker.categoryType === "manual"
                    ? <><MapPin className="w-4 h-4 text-primary" />{worker.city ? `${worker.city}, ${worker.state || worker.country}` : "Location not set"}</>
                    : <><Globe className="w-4 h-4 text-secondary" />Remote (Online)</>}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground bg-card/50 px-3 py-1 border border-border">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />{worker.completedJobs} Jobs Completed
                </div>
                {worker.rating && (
                  <div className="flex items-center gap-2 text-muted-foreground bg-card/50 px-3 py-1 border border-border">
                    <Star className="w-4 h-4 text-primary fill-primary" />{Number(worker.rating).toFixed(1)} Rating
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground bg-card/50 px-3 py-1 border border-border">
                  <Calendar className="w-4 h-4" />Joined {format(new Date(worker.createdAt), "MMM yyyy")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary" /> About
              </h3>
              {worker.bio
                ? <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">{worker.bio}</p>
                : <p className="text-muted-foreground italic">This worker hasn't provided a bio yet.</p>}
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-secondary" /> Contact
              </h3>
              {!showMessageBox ? (
                <Button variant="outline" className="rounded-none uppercase tracking-wider border-secondary/50 text-secondary hover:bg-secondary/10 hover:border-secondary" onClick={() => { if (!address) { connect(); } else { setShowMessageBox(true); } }}>
                  <MessageSquare className="w-4 h-4 mr-2" /> Send Private Message
                </Button>
              ) : (
                <div className="border border-border bg-card/50 p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold uppercase tracking-wider">New Message</p>
                    <button onClick={() => setShowMessageBox(false)}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
                  </div>
                  <Textarea
                    placeholder={`Message ${worker.displayName}...`}
                    className="rounded-none bg-background resize-none h-24 mb-3"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  />
                  <div className="flex gap-2">
                    <Button className="rounded-none uppercase tracking-wider bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={handleSendMessage} disabled={!messageText.trim() || isSendingMsg}>
                      <Send className="w-4 h-4 mr-2" />{isSendingMsg ? "Sending..." : "Send Message"}
                    </Button>
                    <Button variant="ghost" className="rounded-none" onClick={() => setShowMessageBox(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </section>

            {/* Verification */}
            <section>
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary" /> Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-none bg-background border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold uppercase text-sm">Wallet Verified</p>
                      <p className="font-mono text-xs text-muted-foreground truncate w-48">{worker.walletAddress}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-none bg-background border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-bold uppercase text-sm">History</p>
                      <p className="font-mono text-xs text-muted-foreground">{worker.completedJobs} successful transactions</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-primary" /> Client Reviews
                {reviews.length > 0 && <span className="ml-2 text-sm font-mono text-muted-foreground">({reviews.length})</span>}
              </h3>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground italic text-sm">No reviews yet. Be the first to leave one after your job is complete.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-border bg-card/40 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${s <= (review.clientRating ?? 0) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                          ))}
                          <span className="ml-2 font-mono font-bold text-sm text-primary">{review.clientRating}.0</span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.clientReview && (
                        <p className="text-sm text-muted-foreground leading-relaxed">"{review.clientReview}"</p>
                      )}
                      <p className="text-xs font-mono text-muted-foreground/50 mt-2">
                        {review.clientWallet.substring(0, 8)}...{review.clientWallet.substring(36)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right — booking card */}
          <div>
            <Card className="rounded-none border-primary/30 bg-card/80 backdrop-blur sticky top-24 shadow-2xl shadow-primary/5">
              <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary" />
              <CardContent className="p-6 space-y-5">

                {/* Tab switcher — advance is optional */}
                <div className={`grid border border-border ${hasAdvance ? "grid-cols-2" : "grid-cols-1"}`}>
                  <button
                    onClick={() => setBookingTab("full")}
                    className={`py-2.5 text-xs uppercase tracking-wider font-bold transition-colors ${bookingTab === "full" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Full Payment
                  </button>
                  {hasAdvance && (
                    <button
                      onClick={() => setBookingTab("advance")}
                      className={`py-2.5 text-xs uppercase tracking-wider font-bold transition-colors border-l border-border ${bookingTab === "advance" ? "bg-secondary/20 text-secondary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      ⚡ Advance ({advancePct}%) <span className="opacity-60 normal-case font-normal">optional</span>
                    </button>
                  )}
                </div>

                {/* ── FULL PAYMENT ── */}
                {bookingTab === "full" && (
                  <>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-wider mb-1">Book Worker</h3>
                      <p className="text-xs text-muted-foreground">
                        {isNativeCurrency(worker.rateCurrency)
                          ? `Pay directly in ${worker.rateCurrency} — send 99% to the worker, 1% to the platform.`
                          : "Pay now — worker receives 99%, 1% goes to the platform."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Description</label>
                      <Textarea
                        placeholder="Briefly describe what you need done..."
                        className="rounded-none bg-background resize-none h-20"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {/* Payment breakdown */}
                    <div className="p-4 bg-background border border-border font-mono text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Worker receives (99%):</span>
                        <span className="text-foreground">{workerReceivesFull} {worker.rateCurrency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform fee (1%):</span>
                        <span className="text-muted-foreground">{platformFeeOnFull} {worker.rateCurrency}</span>
                      </div>
                      {!isNativeCurrency(worker.rateCurrency) && (
                        <div className="flex justify-between text-xs text-muted-foreground/60">
                          <span>Gas / Network fee:</span>
                          <span>~0.001 ETH</span>
                        </div>
                      )}
                      <div className="w-full h-px bg-border" />
                      <div className="flex justify-between font-bold text-primary">
                        <span>Total:</span>
                        <span>{worker.rateAmount} {worker.rateCurrency}</span>
                      </div>
                    </div>

                    {/* BTC / SOL — manual send instructions */}
                    {isNativeCurrency(worker.rateCurrency) ? (
                      <>
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Addresses</p>

                          {/* Worker address */}
                          <div className="p-3 border border-border bg-background space-y-1">
                            <p className="text-xs text-muted-foreground font-mono">Worker ({workerReceivesFull} {worker.rateCurrency})</p>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-xs text-foreground break-all flex-1">
                                {(worker as any).paymentAddress || worker.walletAddress}
                              </p>
                              <button
                                onClick={() => copyToClipboard((worker as any).paymentAddress || worker.walletAddress, "worker")}
                                className="shrink-0 p-1.5 border border-border hover:bg-muted/50 transition-colors"
                              >
                                {copiedWorker ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                              </button>
                            </div>
                          </div>

                          {/* Platform fee address */}
                          <div className="p-3 border border-border bg-background space-y-1">
                            <p className="text-xs text-muted-foreground font-mono">Platform fee ({platformFeeOnFull} {worker.rateCurrency})</p>
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-xs text-foreground break-all flex-1">
                                {getPlatformWallet(worker.rateCurrency)}
                              </p>
                              <button
                                onClick={() => copyToClipboard(getPlatformWallet(worker.rateCurrency), "platform")}
                                className="shrink-0 p-1.5 border border-border hover:bg-muted/50 transition-colors"
                              >
                                {copiedPlatform ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 p-3 border border-yellow-500/30 bg-yellow-500/5 text-xs text-yellow-400 font-mono">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>Send <strong>{workerReceivesFull} {worker.rateCurrency}</strong> to the worker and <strong>{platformFeeOnFull} {worker.rateCurrency}</strong> to the platform fee address. Then message the worker to confirm.</span>
                        </div>

                        <Button
                          className="w-full h-12 rounded-none uppercase tracking-wider font-bold bg-primary hover:bg-primary/90"
                          onClick={async () => {
                            if (!address && !worker.isAvailable) return;
                            await createBooking.mutateAsync({ data: { workerId: worker.id, clientWallet: address || "manual", description: description || null } });
                            toast({ title: "Booking Recorded", description: `Send ${worker.rateAmount} ${worker.rateCurrency} to the addresses above, then message the worker.` });
                            setLocation("/bookings");
                          }}
                          disabled={!worker.isAvailable}
                        >
                          {worker.isAvailable ? "Confirm Booking (Manual Pay)" : "Worker Unavailable"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground font-mono">
                          Send {worker.rateCurrency} manually · 1% platform fee · irreversible
                        </p>
                      </>
                    ) : (
                      <>
                        {/* EVM — MetaMask flow */}
                        <div className="flex gap-2 p-3 border border-primary/20 bg-primary/5 text-xs text-primary/80 font-mono">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>This opens <strong>2 MetaMask prompts</strong>: first pays the worker (99%), then the 1% platform fee. Both must be approved.</span>
                        </div>

                        {!address
                          ? <Button className="w-full h-12 rounded-none uppercase tracking-wider font-bold" onClick={connect} disabled={isConnecting}>Connect Wallet to Book</Button>
                          : <Button className="w-full h-12 rounded-none uppercase tracking-wider font-bold bg-primary hover:bg-primary/90" onClick={handleBook} disabled={isBooking || !worker.isAvailable}>
                              {isBooking ? "Processing..." : worker.isAvailable ? "Book & Pay" : "Worker Unavailable"}
                            </Button>
                        }
                        <p className="text-xs text-center text-muted-foreground font-mono">
                          Trustless · wallet-to-wallet · 1% platform fee
                        </p>
                      </>
                    )}
                  </>
                )}

                {/* ── ADVANCE BOOKING (optional) ── */}
                {bookingTab === "advance" && hasAdvance && (
                  <>
                    <div>
                      <h3 className="text-xl font-bold uppercase tracking-wider mb-1 text-secondary">Advance Booking</h3>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-secondary font-bold">Optional.</span> Reserve this worker now with a {advancePct}% USDT deposit. Pay the remainder on completion.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Job Description</label>
                      <Textarea
                        placeholder="Briefly describe what you need done..."
                        className="rounded-none bg-background resize-none h-20"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {/* Advance breakdown */}
                    <div className="p-4 bg-background border border-secondary/30 font-mono text-sm space-y-2">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Full rate:</span><span>{rate.toFixed(4)} USDT</span>
                      </div>
                      <div className="w-full h-px bg-border" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Advance ({advancePct}%) → Worker</span>
                        <span className="text-secondary font-bold">{advanceAmount.toFixed(4)} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Platform fee (1%)</span>
                        <span className="text-muted-foreground">{platformFeeAdvance.toFixed(4)} USDT</span>
                      </div>
                      <div className="w-full h-px bg-border" />
                      <div className="flex justify-between font-bold text-secondary">
                        <span>Pay now:</span><span>{clientUpfront.toFixed(4)} USDT</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Remaining on completion:</span><span>{remainingOnDone.toFixed(4)} USDT</span>
                      </div>
                    </div>

                    {/* 2-tx notice */}
                    <div className="flex gap-2 p-3 border border-yellow-500/30 bg-yellow-500/5 text-xs text-yellow-400 font-mono">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>This opens <strong>2 MetaMask prompts</strong>: advance deposit to worker, then 1% platform fee. Both must be approved.</span>
                    </div>

                    <div className="flex gap-2 p-3 border border-border bg-muted/20 text-xs text-muted-foreground font-mono">
                      <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Prefer to pay the full rate now? Switch to the <strong>Full Payment</strong> tab above.</span>
                    </div>

                    {!address
                      ? <Button className="w-full h-12 rounded-none uppercase tracking-wider font-bold" onClick={connect} disabled={isConnecting}>Connect Wallet</Button>
                      : <Button className="w-full h-12 rounded-none uppercase tracking-wider font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={handleAdvanceBook} disabled={isAdvanceBooking || !worker.isAvailable}>
                          {isAdvanceBooking ? "Processing..." : worker.isAvailable ? `Pay ${clientUpfront.toFixed(4)} USDT Now` : "Worker Unavailable"}
                        </Button>
                    }
                    <p className="text-xs text-center text-muted-foreground font-mono">
                      Optional advance · 1% platform fee · USDT on Ethereum
                    </p>
                  </>
                )}

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}
