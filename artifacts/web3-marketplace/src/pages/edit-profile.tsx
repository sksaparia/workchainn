import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetWorkerByWallet, useUpdateWorker } from "@workspace/api-client-react";
import { useWeb3 } from "@/lib/web3";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Save, AlertCircle, Info, Wallet,
  ToggleLeft, ToggleRight, Percent, DollarSign
} from "lucide-react";

const ADVANCE_PERCENT_OPTIONS = [5, 8, 10, 12, 15, 18, 20];

const NATIVE_ADDRESS_CURRENCIES = ["BTC", "SOL"];

const CURRENCY_META: Record<string, { label: string; hint: string; placeholder: string }> = {
  ETH:  { label: "ETH — Ethereum",    hint: "Paid via MetaMask on Ethereum mainnet.",        placeholder: "" },
  MATIC:{ label: "MATIC — Polygon",   hint: "Paid via MetaMask on Polygon network.",         placeholder: "" },
  BNB:  { label: "BNB — BNB Chain",   hint: "Paid via MetaMask on BNB Smart Chain.",         placeholder: "" },
  USDC: { label: "USDC — USD Coin",   hint: "ERC-20 stablecoin, paid via MetaMask.",         placeholder: "" },
  USDT: { label: "USDT — Tether",     hint: "ERC-20 stablecoin, paid via MetaMask.",         placeholder: "" },
  BTC:  { label: "BTC — Bitcoin",     hint: "Client pays directly to your Bitcoin address.", placeholder: "bc1q... or 1... or 3..." },
  SOL:  { label: "SOL — Solana",      hint: "Client pays directly to your Solana address.",  placeholder: "e.g. Bkf8as2HL1hER6..." },
};

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { address } = useWeb3();
  const updateWorker = useUpdateWorker();

  const { data: worker, isLoading } = useGetWorkerByWallet(
    address ?? "",
    { query: { enabled: !!address, retry: false, queryKey: ["/api/workers/by-wallet/edit", address] } }
  );

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [rateAmount, setRateAmount] = useState("");
  const [rateCurrency, setRateCurrency] = useState("USDC");
  const [rateType, setRateType] = useState("hourly");
  const [paymentAddress, setPaymentAddress] = useState("");
  const [advanceDepositPercent, setAdvanceDepositPercent] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Pre-fill once worker data loads
  useEffect(() => {
    if (worker && !hydrated) {
      setDisplayName(worker.displayName ?? "");
      setBio(worker.bio ?? "");
      setRateAmount(worker.rateAmount ?? "");
      setRateCurrency(worker.rateCurrency ?? "USDC");
      setRateType(worker.rateType ?? "hourly");
      setPaymentAddress((worker as any).paymentAddress ?? "");
      setAdvanceDepositPercent((worker as any).advanceDepositPercent ?? null);
      setIsAvailable(worker.isAvailable ?? true);
      setHydrated(true);
    }
  }, [worker, hydrated]);

  const needsNativeAddress = NATIVE_ADDRESS_CURRENCIES.includes(rateCurrency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;

    if (needsNativeAddress && !paymentAddress.trim()) {
      toast({ title: "Payment Address Required", description: `Enter your ${rateCurrency} wallet address so clients know where to pay.`, variant: "destructive" });
      return;
    }

    try {
      await updateWorker.mutateAsync({
        id: worker.id,
        data: {
          displayName,
          bio: bio || null,
          rateAmount,
          rateCurrency: rateCurrency as any,
          rateType: rateType as any,
          paymentAddress: paymentAddress.trim() || null,
          advanceDepositPercent: advanceDepositPercent ?? null,
          isAvailable,
        } as any,
      });
      toast({ title: "Profile Updated!", description: "Your changes are live on your public profile." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message || "Something went wrong.", variant: "destructive" });
    }
  };

  // ── Not connected ──────────────────────────────────────
  if (!address) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center gap-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-3">Connect Wallet</h1>
            <p className="text-muted-foreground">You need to connect the wallet you registered with to edit your profile.</p>
          </div>
          <Button className="rounded-none uppercase tracking-wider font-bold h-12 px-8" onClick={() => setLocation("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  // ── Loading ────────────────────────────────────────────
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  // ── No profile ────────────────────────────────────────
  if (!worker) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center gap-6 max-w-md">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-3">No Worker Profile Found</h1>
            <p className="text-muted-foreground">You haven't registered as a worker with this wallet.</p>
          </div>
          <Button className="rounded-none uppercase tracking-wider font-bold h-12 px-8 bg-primary" onClick={() => setLocation("/register")}>
            Become a Worker
          </Button>
        </div>
      </Layout>
    );
  }

  const rate = parseFloat(rateAmount || "0");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-8 rounded-none uppercase text-xs tracking-wider text-muted-foreground hover:text-foreground"
          onClick={() => setLocation("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your rate, availability, payment address, and more. Changes go live instantly.</p>
        </div>

        <Card className="rounded-none border-border shadow-2xl">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary" />
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Identity (read-only) */}
              <div className="p-4 bg-muted/30 border border-border flex items-start gap-4">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase text-sm mb-1">Wallet (Identity)</p>
                  <p className="font-mono text-xs text-muted-foreground">{address}</p>
                  <p className="text-xs text-muted-foreground mt-1 opacity-60">Your wallet address is permanent and cannot be changed.</p>
                </div>
              </div>

              {/* Availability toggle */}
              <div className="flex items-center justify-between p-5 border border-border bg-card/50">
                <div>
                  <p className="font-bold uppercase tracking-wider text-sm">Availability</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isAvailable ? "You are visible to clients and can receive bookings." : "You are hidden from search results. No new bookings."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(v => !v)}
                  className={`flex items-center gap-2 px-4 py-2 border font-bold uppercase text-xs tracking-wider transition-colors ${
                    isAvailable
                      ? "border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {isAvailable
                    ? <><ToggleRight className="w-4 h-4" /> Available</>
                    : <><ToggleLeft className="w-4 h-4" /> Unavailable</>
                  }
                </button>
              </div>

              {/* Basic info */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-border pb-2">Basic Info</h3>
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wider text-muted-foreground">Display Name *</Label>
                  <Input
                    className="rounded-none h-12 bg-background"
                    placeholder="Your name or handle"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wider text-muted-foreground">Bio / Experience</Label>
                  <Textarea
                    className="rounded-none bg-background min-h-[120px]"
                    placeholder="Describe your skills and what you offer..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" /> Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">Amount *</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      className="rounded-none h-12 bg-background font-mono"
                      placeholder="e.g. 50"
                      value={rateAmount}
                      onChange={(e) => setRateAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">Currency *</Label>
                    <Select value={rateCurrency} onValueChange={(v) => { setRateCurrency(v); setPaymentAddress(""); }}>
                      <SelectTrigger className="rounded-none h-12 bg-background font-mono"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-none">
                        {Object.entries(CURRENCY_META).map(([key, meta]) => (
                          <SelectItem key={key} value={key} className="font-mono">{meta.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">Type *</Label>
                    <Select value={rateType} onValueChange={setRateType}>
                      <SelectTrigger className="rounded-none h-12 bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="hourly">Per Hour</SelectItem>
                        <SelectItem value="task">Per Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Currency hint */}
                <div className="flex gap-2 p-3 border border-border bg-muted/20 text-xs text-muted-foreground font-mono">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  <span>{CURRENCY_META[rateCurrency]?.hint}</span>
                </div>

                {/* BTC / SOL — required native address */}
                {needsNativeAddress && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">
                      Your {rateCurrency} Payment Address *
                    </Label>
                    <Input
                      className="rounded-none h-12 bg-background font-mono text-sm"
                      placeholder={CURRENCY_META[rateCurrency]?.placeholder}
                      value={paymentAddress}
                      onChange={(e) => setPaymentAddress(e.target.value)}
                    />
                    <div className="flex gap-2 p-3 border border-yellow-500/30 bg-yellow-500/5 text-xs text-yellow-400 font-mono">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Clients send {rateCurrency} directly here. Double-check — crypto payments are irreversible.</span>
                    </div>
                  </div>
                )}

                {/* EVM — optional alternative address */}
                {!needsNativeAddress && (
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">
                      Alternative Payment Address <span className="normal-case font-normal opacity-60">(optional)</span>
                    </Label>
                    <Input
                      className="rounded-none h-12 bg-background font-mono text-sm"
                      placeholder="Leave blank to use your connected wallet"
                      value={paymentAddress}
                      onChange={(e) => setPaymentAddress(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Advance Deposit */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-secondary" /> Advance Deposit (Optional)
                </h3>
                <p className="text-sm text-muted-foreground -mt-2">
                  Require clients to pay a USDT deposit upfront. A 1% platform fee is added automatically.
                </p>
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wider text-muted-foreground">Advance Deposit %</Label>
                  <Select
                    value={advanceDepositPercent?.toString() ?? "none"}
                    onValueChange={(v) => setAdvanceDepositPercent(v === "none" ? null : parseInt(v))}
                  >
                    <SelectTrigger className="rounded-none h-12 bg-background font-mono">
                      <SelectValue placeholder="No advance required" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="none">No advance deposit</SelectItem>
                      {ADVANCE_PERCENT_OPTIONS.map(p => (
                        <SelectItem key={p} value={p.toString()}>{p}% advance deposit</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {advanceDepositPercent && rate > 0 && (
                  <div className="p-4 border border-secondary/30 bg-secondary/5 font-mono text-sm space-y-2">
                    <p className="text-xs uppercase tracking-wider text-secondary font-bold mb-3">Client Will Pay Now (Advance)</p>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Full rate:</span><span>{rate.toFixed(4)} USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advance ({advanceDepositPercent}%) → You:</span>
                      <span>{(rate * advanceDepositPercent / 100).toFixed(4)} USDT</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Platform fee (1%):</span>
                      <span>{(rate * 0.01).toFixed(4)} USDT</span>
                    </div>
                    <div className="w-full h-px bg-border" />
                    <div className="flex justify-between font-bold text-secondary">
                      <span>Client pays upfront:</span>
                      <span>{(rate * (advanceDepositPercent / 100 + 0.01)).toFixed(4)} USDT</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Remaining on completion:</span>
                      <span>{(rate * (1 - advanceDepositPercent / 100)).toFixed(4)} USDT</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  className="flex-1 h-14 rounded-none uppercase tracking-widest font-bold text-base bg-primary hover:bg-primary/90"
                  disabled={updateWorker.isPending}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {updateWorker.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none uppercase tracking-wider font-bold h-14 px-8"
                  onClick={() => setLocation("/dashboard")}
                >
                  Cancel
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
