import { ReactNode } from "react";
import { Navbar } from "./navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-8 border-t border-border mt-auto bg-card">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground tracking-tight uppercase">WorkChain</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-4">
            <span>Decentralized</span>
            <span className="text-border">|</span>
            <span>Trustless</span>
            <span className="text-border">|</span>
            <span>Unstoppable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
