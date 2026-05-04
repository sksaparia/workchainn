import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Wallet, Menu, X, Hexagon, MessageSquare, LayoutDashboard, LogOut, LogIn, User } from "lucide-react";
import { useState } from "react";
import { useGetInbox } from "@workspace/api-client-react";

export function Navbar() {
  const { user, isAuthenticated, walletAddress, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: inbox } = useGetInbox(walletAddress ?? user?.id ?? "", {
    query: { enabled: !!(walletAddress || user?.id), refetchInterval: 10000 }
  });

  const totalUnread = inbox?.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const navLinks = [
    { href: "/explore",  label: "Explore" },
    { href: "/register", label: "Become a Worker" },
    { href: "/bookings", label: "My Bookings" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-none bg-primary/10 border border-primary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <Hexagon className="w-5 h-5 absolute" />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">WorkChain</span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm uppercase tracking-wider font-medium transition-colors ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/messages"
              className={`text-sm uppercase tracking-wider font-medium transition-colors flex items-center gap-1.5 ${
                isActive("/messages") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Messages
              {totalUnread > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`text-sm uppercase tracking-wider font-medium transition-colors flex items-center gap-1.5 ${
                  isActive("/dashboard") ? "text-secondary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Wallet indicator */}
              {walletAddress && (
                <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-card/50 text-xs font-mono text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {formatAddress(walletAddress)}
                </div>
              )}
              {/* User identity */}
              <div className="flex items-center gap-2 px-3 py-1.5 border border-border bg-card/50 text-xs text-muted-foreground max-w-[140px]">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{user?.name ?? user?.email ?? user?.phone}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="uppercase text-xs tracking-wider rounded-none gap-1.5">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button className="uppercase tracking-wider rounded-none gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        <button className="md:hidden text-foreground p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border/50 p-4 flex flex-col gap-3 z-50">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block p-2 text-sm uppercase tracking-wider font-medium border-l-2 ${
                isActive(link.href) ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/messages"
            className={`block p-2 text-sm uppercase tracking-wider font-medium border-l-2 flex items-center gap-2 ${
              isActive("/messages") ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <MessageSquare className="w-4 h-4" />
            Messages
            {totalUnread > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full ml-auto">
                {totalUnread}
              </span>
            )}
          </Link>
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={`block p-2 text-sm uppercase tracking-wider font-medium border-l-2 flex items-center gap-2 ${
                isActive("/dashboard") ? "border-secondary text-secondary bg-secondary/5" : "border-transparent text-muted-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          <div className="pt-4 border-t border-border mt-2">
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-3 py-2 border border-border bg-card/50 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="truncate">{user?.name ?? user?.email ?? user?.phone}</span>
                </div>
                {walletAddress && (
                  <div className="flex items-center gap-2 px-3 py-2 border border-border bg-card/50 text-xs font-mono text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {formatAddress(walletAddress)}
                  </div>
                )}
                <Button variant="outline" className="w-full uppercase text-xs tracking-wider rounded-none gap-2" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full uppercase tracking-wider rounded-none gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In / Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
