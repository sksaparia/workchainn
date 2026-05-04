import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

export type AuthMethod = "email" | "facebook" | "whatsapp" | "wallet" | null;

export interface User {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  authMethod: AuthMethod;
  walletAddress?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
  loginWithFacebook: () => Promise<boolean>;
  loginWithWhatsApp: (phone: string, otp: string) => Promise<boolean>;
  sendWhatsAppOTP: (phone: string) => Promise<boolean>;
  logout: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  walletAddress: string | null;
  isConnectingWallet: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  loginWithEmail: async () => false,
  signupWithEmail: async () => false,
  loginWithFacebook: async () => false,
  loginWithWhatsApp: async () => false,
  sendWhatsAppOTP: async () => false,
  logout: () => {},
  connectWallet: async () => {},
  disconnectWallet: () => {},
  walletAddress: null,
  isConnectingWallet: false,
});

const STORAGE_KEY = "workchain_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  // Load persisted user on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.walletAddress) setWalletAddress(parsed.walletAddress);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  // Auto-detect MetaMask wallet if already connected
  useEffect(() => {
    const checkWallet = async () => {
      if ((window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) setWalletAddress(accounts[0]);
        } catch {}
      }
    };
    checkWallet();
    if ((window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        const addr = accounts.length > 0 ? accounts[0] : null;
        setWalletAddress(addr);
        if (user) {
          const updated = { ...user, walletAddress: addr ?? undefined };
          setUser(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      });
    }
  }, [user]);

  const persistUser = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  // ── Email login (simulated — replace with real API call) ──
  const loginWithEmail = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call: POST /auth/login
      await new Promise(r => setTimeout(r, 800));
      if (!email || !password) throw new Error("Invalid credentials");
      const u: User = {
        id: `email_${Date.now()}`,
        email,
        name: email.split("@")[0],
        authMethod: "email",
        walletAddress: walletAddress ?? undefined,
      };
      persistUser(u);
      toast({ title: "Welcome back!", description: `Logged in as ${email}` });
      return true;
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // ── Email signup ──
  const signupWithEmail = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call: POST /auth/signup
      await new Promise(r => setTimeout(r, 800));
      if (!email || !password || !name) throw new Error("All fields are required");
      const u: User = {
        id: `email_${Date.now()}`,
        email,
        name,
        authMethod: "email",
        walletAddress: walletAddress ?? undefined,
      };
      persistUser(u);
      toast({ title: "Account Created!", description: `Welcome to WorkChain, ${name}!` });
      return true;
    } catch (err: any) {
      toast({ title: "Signup Failed", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // ── Facebook OAuth (simulated — replace with real Facebook SDK) ──
  const loginWithFacebook = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: Integrate Facebook JS SDK
      // FB.login(response => { ... }, { scope: 'public_profile,email' })
      await new Promise(r => setTimeout(r, 1000));
      const u: User = {
        id: `fb_${Date.now()}`,
        name: "Facebook User",
        email: "user@facebook.com",
        authMethod: "facebook",
        avatar: "https://ui-avatars.com/api/?name=Facebook+User&background=1877F2&color=fff",
        walletAddress: walletAddress ?? undefined,
      };
      persistUser(u);
      toast({ title: "Connected via Facebook!", description: `Welcome, ${u.name}!` });
      return true;
    } catch (err: any) {
      toast({ title: "Facebook Login Failed", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // ── WhatsApp OTP send ──
  const sendWhatsAppOTP = useCallback(async (phone: string): Promise<boolean> => {
    try {
      // TODO: Call your OTP service: POST /auth/whatsapp/send-otp { phone }
      await new Promise(r => setTimeout(r, 700));
      toast({ title: "OTP Sent!", description: `A verification code was sent to ${phone} via WhatsApp.` });
      return true;
    } catch (err: any) {
      toast({ title: "Failed to Send OTP", description: err.message, variant: "destructive" });
      return false;
    }
  }, []);

  // ── WhatsApp OTP verify ──
  const loginWithWhatsApp = useCallback(async (phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: Call your OTP service: POST /auth/whatsapp/verify { phone, otp }
      await new Promise(r => setTimeout(r, 800));
      if (otp !== "123456") throw new Error("Invalid OTP. (Use 123456 for demo)");
      const u: User = {
        id: `wa_${Date.now()}`,
        phone,
        name: `WA User ${phone.slice(-4)}`,
        authMethod: "whatsapp",
        walletAddress: walletAddress ?? undefined,
      };
      persistUser(u);
      toast({ title: "Verified via WhatsApp!", description: `Welcome to WorkChain!` });
      return true;
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // ── Wallet connect (optional) ──
  const connectWallet = useCallback(async () => {
    if (!(window as any).ethereum) {
      toast({ title: "MetaMask not found", description: "Install MetaMask to connect a wallet.", variant: "destructive" });
      return;
    }
    setIsConnectingWallet(true);
    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        const addr = accounts[0];
        setWalletAddress(addr);
        if (user) {
          const updated = { ...user, walletAddress: addr };
          persistUser(updated);
        }
        toast({ title: "Wallet Connected", description: `${addr.substring(0, 6)}...${addr.substring(38)}` });
      }
    } catch (err: any) {
      toast({ title: "Connection Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsConnectingWallet(false);
    }
  }, [user]);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    if (user) {
      const updated = { ...user, walletAddress: undefined };
      persistUser(updated);
    }
    toast({ title: "Wallet Disconnected" });
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setWalletAddress(null);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: "Signed out", description: "You have been logged out of WorkChain." });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      loginWithEmail,
      signupWithEmail,
      loginWithFacebook,
      loginWithWhatsApp,
      sendWhatsAppOTP,
      logout,
      connectWallet,
      disconnectWallet,
      walletAddress,
      isConnectingWallet,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
