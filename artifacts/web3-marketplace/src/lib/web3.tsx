import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

declare global {
  interface Window {
    ethereum?: any;
  }
}

// USDT / USDC ERC-20 contract addresses
export const USDT_CONTRACT_ETHEREUM = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const USDT_CONTRACT_POLYGON  = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

// ── Platform fee wallets (1%) per currency ────────────────
export const PLATFORM_WALLETS: Record<string, string> = {
  ETH:  "0x73573df6a572fd3a1d348e4860f4ebe569018d96",
  MATIC:"0x73573df6a572fd3a1d348e4860f4ebe569018d96",
  BNB:  "0x73573df6a572fd3a1d348e4860f4ebe569018d96",
  USDT: "0xB8c7B3930d497197FF74A750151B81f744629D18",
  USDC: "0xB8c7B3930d497197FF74A750151B81f744629D18",
  BTC:  "bc1qlm0u5kjgvkgauq902ye279se9368zj3p4j7hrp",
  SOL:  "Bkf8as2HL1hER6wuvcsg3GhCb1S53DBsiwCZeQWCHmZD",
};

/** Returns the platform fee wallet for a given currency (falls back to ETH wallet). */
export function getPlatformWallet(currency: string): string {
  return PLATFORM_WALLETS[currency.toUpperCase()] ?? PLATFORM_WALLETS["ETH"];
}

// Keep legacy export for any existing imports
export const PLATFORM_FEE_WALLET = PLATFORM_WALLETS["USDT"];
export const PLATFORM_FEE_PERCENT = 1; // 1% of total rate

// USDT has 6 decimal places
const USDT_DECIMALS = 6;

function encodeUsdtTransfer(to: string, amountUsdt: number): string {
  const selector = "a9059cbb";
  const paddedTo = to.replace("0x", "").toLowerCase().padStart(64, "0");
  const rawAmount = BigInt(Math.round(amountUsdt * 10 ** USDT_DECIMALS));
  const paddedAmount = rawAmount.toString(16).padStart(64, "0");
  return "0x" + selector + paddedTo + paddedAmount;
}

interface Web3ContextType {
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendTransaction: (to: string, amountEth: string) => Promise<string | null>;
  sendUsdtTransaction: (to: string, amountUsdt: number) => Promise<string | null>;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  sendTransaction: async () => null,
  sendUsdtTransaction: async () => null,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) setAddress(accounts[0]);
        } catch {}
      }
    };
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAddress(accounts.length > 0 ? accounts[0] : null);
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast({ title: "MetaMask not found", description: "Please install MetaMask or another Web3 wallet to connect.", variant: "destructive" });
      return;
    }
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        toast({ title: "Wallet Connected", description: `Connected as ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}` });
      }
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message || "Failed to connect wallet.", variant: "destructive" });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    toast({ title: "Wallet Disconnected", description: "You have disconnected your wallet from WorkChain." });
  }, []);

  const sendTransaction = useCallback(async (to: string, amountEth: string) => {
    if (!window.ethereum || !address) {
      toast({ title: "Not Connected", description: "Please connect your wallet first.", variant: "destructive" });
      return null;
    }
    try {
      const amountWei = BigInt(Math.floor(parseFloat(amountEth) * 1e18)).toString(16);
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{ from: address, to, value: `0x${amountWei}` }],
      });
      return txHash;
    } catch (error: any) {
      toast({ title: "Transaction Failed", description: error.message || "The transaction was cancelled or failed.", variant: "destructive" });
      return null;
    }
  }, [address]);

  const sendUsdtTransaction = useCallback(async (to: string, amountUsdt: number) => {
    if (!window.ethereum || !address) {
      toast({ title: "Not Connected", description: "Please connect your wallet first.", variant: "destructive" });
      return null;
    }
    try {
      const data = encodeUsdtTransfer(to, amountUsdt);
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{
          from: address,
          to: USDT_CONTRACT_ETHEREUM,
          value: "0x0",
          data,
        }],
      });
      return txHash;
    } catch (error: any) {
      toast({ title: "USDT Transfer Failed", description: error.message || "The transaction was cancelled or failed.", variant: "destructive" });
      return null;
    }
  }, [address]);

  return (
    <Web3Context.Provider value={{ address, isConnecting, connect, disconnect, sendTransaction, sendUsdtTransaction }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
