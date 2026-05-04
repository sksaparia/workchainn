import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateWorker, useListCategories } from "@workspace/api-client-react";
import { CreateWorkerBodyRateCurrency, CreateWorkerBodyRateType } from "@workspace/api-client-react/src/generated/api.schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { Wallet, Info, MapPin, Percent, AlertCircle, User, CheckCircle2 } from "lucide-react";
import { CRYPTO_COUNTRY_NAMES, getStates, getCities } from "@/lib/crypto-countries";

const ADVANCE_PERCENT_OPTIONS = [5, 8, 10, 12, 15, 18, 20];
const NATIVE_ADDRESS_CURRENCIES = ["BTC", "SOL"];
const CURRENCY_META: Record<string, { label: string; hint: string; placeholder: string }> = {
  ETH:  { label: "ETH — Ethereum",  hint: "Paid via MetaMask on Ethereum mainnet.", placeholder: "" },
  MATIC:{ label: "MATIC — Polygon", hint: "Paid via MetaMask on Polygon network.", placeholder: "" },
  BNB:  { label: "BNB — BNB Chain", hint: "Paid via MetaMask on BNB Smart Chain.", placeholder: "" },
  USDC: { label: "USDC — USD Coin", hint: "ERC-20 stablecoin, paid via MetaMask.", placeholder: "" },
  USDT: { label: "USDT — Tether",   hint: "ERC-20 stablecoin, paid via MetaMask.", placeholder: "" },
  BTC:  { label: "BTC — Bitcoin",   hint: "Client pays directly to your Bitcoin address.", placeholder: "bc1q... or 1... or 3..." },
  SOL:  { label: "SOL — Solana",    hint: "Client pays directly to your Solana address.", placeholder: "e.g. Bkf8as2HL1hER6..." },
};

export default function Register() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, walletAddress, connectWallet, isConnectingWallet } = useAuth();
  const createWorker = useCreateWorker();

  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [rateAmount, setRateAmount] = useState("");
  const [rateCurrency, setRateCurrency] = useState<CreateWorkerBodyRateCurrency>("USDC");
  const [rateType, setRateType] = useState<CreateWorkerBodyRateType>("hourly");
  const [advanceDepositPercent, setAdvanceDepositPercent] = useState<number | null>(null);
  const [paymentAddress, setPaymentAddress] = useState("");
  const [country, setCountry] = useState("");
  const [state, setStateName] = useState("");
  const [city, setCity] = useState("");

  const { data: categories } = useListCategories();
  const selectedCategory = categories?.find(c => c.id.toString() === categoryId);
  const isManual = selectedCategory?.type === "manual";
  const needsNativeAddress = NATIVE_ADDRESS_CURRENCIES.includes(rateCurrency);
  const states = country ? getStates(country) : [];
  const cities = country && state ? getCities(country, state) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({ title: "Sign In Required", description: "Please sign in to create a worker profile.", variant: "destructive" });
      setLocation("/auth");
      return;
    }
    if (!categoryId || !displayName || !rateAmount) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (!walletAddress && !needsNativeAddress && !paymentAddress.trim()) {
      toast({ title: "Payment Address Needed", description: "Please enter a payment address or connect your MetaMask wallet.", variant: "destructive" });
      return;
    }
    if (needsNativeAddress && !paymentAddress.trim()) {
      toast({ title: "Payment Address Required", description: `Please enter your ${rateCurrency} wallet address.`, variant: "destructive" });
      return;
    }
    try {
      const worker = await createWorker.mutateAsync({
        data: {
          walletAddress: walletAddress ?? paymentAddress.trim() ?? (user?.id ?? "no-wallet"),
          displayName,
          bio: bio || null,
          categoryId: parseInt(categoryId),
          rateAmount,
          rateCurrency,
          rateType,
          country: isManual ? country || null : null,
          state: isManual ? state || null : null,
          city: isManual ? city || null : null,
          paymentAddress: paymentAddress.trim() || walletAddress || null,
          advanceDepositPercent: advanceDepositPercent ?? null,
        } as any
      });
      toast({ title: "Profile Created!", description: "Welcome to WorkChain. You are now listed." });
      setLocation(`/worker/${worker.id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create profile.", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">Become a Worker</h1>
            <p className="text-muted-foreground text-lg">List your services, set your own crypto rates, and get hired instantly.</p>
          </div>
          <Card className="rounded-none border-dashed border-2 border-border bg-card/30">
            <CardContent className="p-12 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold uppercase mb-2">Sign In Required</h2>
                <p className="text-muted-foreground">Create an account or sign in to list your services. Wallet connection is optional — you can sign up with email, Facebook, or WhatsApp.</p>
              </div>
              <Button size="lg" className="rounded-none uppercase tracking-wider font-bold h-14 px-8" onClick={() => setLocation("/auth")}>
                Sign In / Create Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">Become a Worker</h1>
          <p className="text-muted-foreground text-lg">List your services, set your own crypto rates, and get hired instantly.</p>
        </div>
        <Card className="rounded-none border-border shadow-2xl">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary" />
          <CardContent className="p-8">
            <div className="mb-6 p-4 bg-muted/50 border border-border flex items-start gap-4">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold uppercase text-sm mb-1">Signed In · {user?.authMethod}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email ?? user?.phone ?? user?.name}</p>
              </div>
            </div>

            {/* Optional Wallet */}
            <div className="mb-8 p-4 border border-dashed border-border bg-card/30 space-y-3">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase text-sm">Crypto Wallet <span className="font-normal text-muted-foreground normal-case text-xs"> — Optional</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">Connect MetaMask for seamless EVM payments, or manually enter a payment address below.</p>
                </div>
              </div>
              {walletAddress ? (
                <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono text-xs text-muted-foreground">{walletAddress}</span>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={connectWallet} disabled={isConnectingWallet} className="rounded-none uppercase text-xs tracking-wider">
                  <Wallet className="w-3.5 h-3.5 mr-2" />
                  {isConnectingWallet ? "Connecting..." : "Connect MetaMask (Optional)"}
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-border pb-2">Basic Info</h3>
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wider text-muted-foreground">Display Name *</Label>
                  <Input placeholder="e.g. John Doe or Web3Dev" className="rounded-none h-12 bg-background" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wider text-muted-foreground">Bio / Experience</Label>
                  <Textarea placeholder="Describe your skills, experience, and what you offer..." className="rounded-none bg-background min-h-[120px]" value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-border pb-2">Job Category</h3>
                <div className="space-y-2">
                  <Label className="uppercase text-xs tracking-wider text-muted-foreground">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger className="rounded-none h-12 bg-background"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent className="rounded-none max-h-[300px]">
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name} <span className="text-muted-foreground ml-2">({cat.type})</span></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isManual && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <h3 className="text-lg font-bold uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Location Details
                  </h3>
                  <p className="text-sm text-muted-foreground -mt-2">Only countries where crypto is legally accepted are listed.</p>
                  <Select value={country || "none"} onValueChange={(v) => { setCountry(v === "none" ? "" : v); setStateName(""); setCity(""); }}>
                    <SelectTrigger className="rounded-none h-12 bg-background"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent className="rounded-none max-h-[260px]">
                      <SelectItem value="none">Select a country</SelectItem>
                      {CRYPTO_COUNTRY_NAMES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select value={state || "none"} onValueChange={(v) => { setStateName(v === "none" ? "" : v); setCity(""); }} disabled={!country}>
                      <SelectTrigger className="rounded-none h-12 bg-background"><SelectValue placeholder={country ? "Select state" : "Select country first"} /></SelectTrigger>
                      <SelectContent className="rounded-none max-h-[260px]">
                        <SelectItem value="none">Select a state</SelectItem>
                        {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div>
                      <Select value={city || "none"} onValueChange={(v) => setCity(v === "none" ? "" : v)} disabled={!state}>
                        <SelectTrigger className="rounded-none h-12 bg-background"><SelectValue placeholder={state ? "Select city" : "Select state first"} /></SelectTrigger>
                        <SelectContent className="rounded-none max-h-[260px]">
                          <SelectItem value="none">Select a city</SelectItem>
                          {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {state && cities.length === 0 && (
                        <Input className="rounded-none bg-background mt-2" placeholder="Enter city name" value={city} onChange={(e) => setCity(e.target.value)} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-border pb-2">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">Amount *</Label>
                    <Input type="number" step="0.000001" placeholder="e.g. 50" className="rounded-none h-12 bg-background font-mono" value={rateAmount} onChange={(e) => setRateAmount(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">Currency *</Label>
                    <Select value={rateCurrency} onValueChange={(v) => { setRateCurrency(v as CreateWorkerBodyRateCurrency); setPaymentAddress(""); }}>
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
                    <Select value={rateType} onValueChange={(v) => setRateType(v as CreateWorkerBodyRateType)}>
                      <SelectTrigger className="rounded-none h-12 bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="hourly">Per Hour</SelectItem>
                        <SelectItem value="task">Per Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 p-3 border border-border bg-muted/20 text-xs text-muted-foreground font-mono">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  <span>{CURRENCY_META[rateCurrency]?.hint}</span>
                </div>
                {needsNativeAddress && (
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">Your {rateCurrency} Payment Address *</Label>
                    <Input className="rounded-none h-12 bg-background font-mono text-sm" placeholder={CURRENCY_META[rateCurrency]?.placeholder} value={paymentAddress} onChange={(e) => setPaymentAddress(e.target.value)} />
                    <div className="flex gap-2 p-3 border border-yellow-500/30 bg-yellow-500/5 text-xs text-yellow-400 font-mono">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Clients will send {rateCurrency} directly to this address. Crypto payments are irreversible.</span>
                    </div>
                  </div>
                )}
                {!needsNativeAddress && !walletAddress && (
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">EVM Payment Address <span className="normal-case font-normal opacity-60">(required if no wallet)</span></Label>
                    <Input className="rounded-none h-12 bg-background font-mono text-sm" placeholder="0x... your Ethereum/Polygon/BNB address" value={paymentAddress} onChange={(e) => setPaymentAddress(e.target.value)} />
                  </div>
                )}
                {!needsNativeAddress && walletAddress && (
                  <div className="space-y-2">
                    <Label className="uppercase text-xs tracking-wider text-muted-foreground">Alternative Payment Address <span className="normal-case font-normal opacity-60">(optional)</span></Label>
                    <Input className="rounded-none h-12 bg-background font-mono text-sm" placeholder="Leave blank to use your connected wallet" value={paymentAddress} onChange={(e) => setPaymentAddress(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-secondary" /> Advance Deposit (Optional)
                </h3>
                <p className="text-sm text-muted-foreground -mt-2">Require clients to pay an upfront USDT deposit. A 1% platform fee is included.</p>
                <Select value={advanceDepositPercent?.toString() ?? "none"} onValueChange={(v) => setAdvanceDepositPercent(v === "none" ? null : parseInt(v))}>
                  <SelectTrigger className="rounded-none h-12 bg-background font-mono"><SelectValue placeholder="No advance required" /></SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="none">No advance deposit required</SelectItem>
                    {ADVANCE_PERCENT_OPTIONS.map(p => (<SelectItem key={p} value={p.toString()}>{p}% advance deposit</SelectItem>))}
                  </SelectContent>
                </Select>
                {advanceDepositPercent && rateAmount && (
                  <div className="p-4 border border-secondary/30 bg-secondary/5 font-mono text-sm space-y-2">
                    <p className="text-xs uppercase tracking-wider text-secondary font-bold mb-3">Client Will Pay (Advance Booking)</p>
                    <div className="flex justify-between text-muted-foreground"><span>Total Rate:</span><span>{parseFloat(rateAmount).toFixed(2)} USDT</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Advance ({advanceDepositPercent}%) → You:</span><span className="text-foreground">{(parseFloat(rateAmount) * advanceDepositPercent / 100).toFixed(2)} USDT</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Platform Fee (1%):</span><span>{(parseFloat(rateAmount) * 0.01).toFixed(2)} USDT</span></div>
                    <div className="w-full h-px bg-border" />
                    <div className="flex justify-between font-bold text-secondary"><span>Client Pays Upfront:</span><span>{(parseFloat(rateAmount) * (advanceDepositPercent / 100 + 0.01)).toFixed(2)} USDT</span></div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-border">
                <Button type="submit" className="w-full h-14 rounded-none uppercase tracking-widest font-bold text-lg" disabled={createWorker.isPending}>
                  {createWorker.isPending ? "Creating Profile..." : "Create Worker Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
