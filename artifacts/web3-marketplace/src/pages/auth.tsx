import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Hexagon, Mail, Phone, Eye, EyeOff, ArrowRight, MessageCircle, ChevronLeft } from "lucide-react";

type Tab = "login" | "signup";
type Method = "choose" | "email" | "whatsapp";

// Facebook icon SVG
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12.073h2.54V9.845c0-2.522 1.492-3.917 3.77-3.917 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12.073h2.773l-.443 2.891h-2.33V21.951C20.343 21.201 24 17.064 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { loginWithEmail, signupWithEmail, loginWithFacebook, loginWithWhatsApp, sendWhatsAppOTP } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [method, setMethod] = useState<Method>("choose");

  // Email form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);

  // WhatsApp form
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async () => {
    setLoading(true);
    let ok = false;
    if (tab === "login") {
      ok = await loginWithEmail(email, password);
    } else {
      ok = await signupWithEmail(email, password, name);
    }
    setLoading(false);
    if (ok) setLocation("/");
  };

  const handleFacebook = async () => {
    setLoading(true);
    const ok = await loginWithFacebook();
    setLoading(false);
    if (ok) setLocation("/");
  };

  const handleSendOTP = async () => {
    if (!phone.trim()) return;
    setSendingOtp(true);
    const ok = await sendWhatsAppOTP(phone);
    setSendingOtp(false);
    if (ok) setOtpSent(true);
  };

  const handleWhatsAppSubmit = async () => {
    setLoading(true);
    const ok = await loginWithWhatsApp(phone, otp);
    setLoading(false);
    if (ok) setLocation("/");
  };

  const reset = () => { setMethod("choose"); setOtp(""); setOtpSent(false); setPhone(""); };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-none bg-primary/10 border-2 border-primary flex items-center justify-center mb-4">
              <Hexagon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">WorkChain</h1>
            <p className="text-muted-foreground text-sm mt-1">Decentralized Work Marketplace</p>
          </div>

          <Card className="rounded-none border-border shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary" />
            <CardContent className="p-0">
              {/* Tabs */}
              <div className="flex border-b border-border">
                {(["login", "signup"] as Tab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); reset(); }}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                      tab === t
                        ? "bg-primary/5 text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-4">
                {/* Method chooser */}
                {method === "choose" && (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground text-center pb-1">
                      {tab === "login" ? "Sign in with" : "Sign up with"}
                    </p>

                    {/* Email */}
                    <button
                      onClick={() => setMethod("email")}
                      className="w-full flex items-center gap-3 px-4 py-3.5 border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      <span className="font-medium text-sm uppercase tracking-wider">Email & Password</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-primary" />
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={handleFacebook}
                      disabled={loading}
                      className="w-full flex items-center gap-3 px-4 py-3.5 border border-border hover:border-[#1877F2] hover:bg-[#1877F2]/5 transition-all group"
                    >
                      <span className="text-[#1877F2]"><FacebookIcon /></span>
                      <span className="font-medium text-sm uppercase tracking-wider">Continue with Facebook</span>
                      {loading ? (
                        <span className="ml-auto text-xs text-muted-foreground">Connecting...</span>
                      ) : (
                        <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-[#1877F2]" />
                      )}
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={() => setMethod("whatsapp")}
                      className="w-full flex items-center gap-3 px-4 py-3.5 border border-border hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group"
                    >
                      <span className="text-[#25D366]"><WhatsAppIcon /></span>
                      <span className="font-medium text-sm uppercase tracking-wider">Continue with WhatsApp</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-[#25D366]" />
                    </button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">or</span>
                      </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                      {tab === "login" ? (
                        <>Don't have an account?{" "}
                          <button onClick={() => setTab("signup")} className="text-primary font-semibold hover:underline">Sign Up</button>
                        </>
                      ) : (
                        <>Already have an account?{" "}
                          <button onClick={() => setTab("login")} className="text-primary font-semibold hover:underline">Sign In</button>
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Email form */}
                {method === "email" && (
                  <div className="space-y-4">
                    <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronLeft className="w-3 h-3" /> Back to options
                    </button>
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold uppercase tracking-wider">
                        {tab === "login" ? "Sign in with Email" : "Create Account with Email"}
                      </span>
                    </div>

                    {tab === "signup" && (
                      <div className="space-y-1.5">
                        <Label className="uppercase text-xs tracking-wider text-muted-foreground">Full Name *</Label>
                        <Input
                          className="rounded-none h-11 bg-background"
                          placeholder="Your name"
                          value={name}
                          onChange={e => setName(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label className="uppercase text-xs tracking-wider text-muted-foreground">Email *</Label>
                      <Input
                        type="email"
                        className="rounded-none h-11 bg-background"
                        placeholder="you@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="uppercase text-xs tracking-wider text-muted-foreground">Password *</Label>
                      <div className="relative">
                        <Input
                          type={showPass ? "text" : "password"}
                          className="rounded-none h-11 bg-background pr-11"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleEmailSubmit()}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      onClick={handleEmailSubmit}
                      disabled={loading}
                      className="w-full h-11 rounded-none uppercase tracking-widest font-bold"
                    >
                      {loading ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
                    </Button>
                  </div>
                )}

                {/* WhatsApp form */}
                {method === "whatsapp" && (
                  <div className="space-y-4">
                    <button onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronLeft className="w-3 h-3" /> Back to options
                    </button>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#25D366]"><WhatsAppIcon /></span>
                      <span className="text-sm font-bold uppercase tracking-wider">Verify via WhatsApp</span>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="uppercase text-xs tracking-wider text-muted-foreground">WhatsApp Number *</Label>
                      <div className="flex gap-2">
                        <Input
                          type="tel"
                          className="rounded-none h-11 bg-background"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          disabled={otpSent}
                        />
                        {!otpSent && (
                          <Button
                            onClick={handleSendOTP}
                            disabled={sendingOtp || !phone.trim()}
                            variant="outline"
                            className="rounded-none h-11 px-4 uppercase text-xs tracking-wider shrink-0"
                          >
                            {sendingOtp ? "Sending..." : "Send OTP"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {otpSent && (
                      <>
                        <div className="p-3 bg-[#25D366]/10 border border-[#25D366]/30 text-xs text-[#25D366] flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 shrink-0" />
                          OTP sent to {phone} via WhatsApp. <span className="text-muted-foreground">(Demo: use 123456)</span>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="uppercase text-xs tracking-wider text-muted-foreground">Enter OTP *</Label>
                          <Input
                            type="text"
                            maxLength={6}
                            className="rounded-none h-11 bg-background font-mono tracking-[0.5em] text-center text-lg"
                            placeholder="······"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                            onKeyDown={e => e.key === "Enter" && handleWhatsAppSubmit()}
                          />
                        </div>
                        <Button
                          onClick={handleWhatsAppSubmit}
                          disabled={loading || otp.length < 4}
                          className="w-full h-11 rounded-none uppercase tracking-widest font-bold bg-[#25D366] hover:bg-[#20b858] text-white"
                        >
                          {loading ? "Verifying..." : "Verify & Continue"}
                        </Button>
                        <button
                          onClick={() => { setOtpSent(false); setOtp(""); }}
                          className="w-full text-xs text-muted-foreground hover:text-foreground text-center"
                        >
                          Resend OTP / Change number
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to WorkChain's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </Layout>
  );
}
