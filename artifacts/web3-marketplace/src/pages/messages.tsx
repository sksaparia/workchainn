import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useWeb3 } from "@/lib/web3";
import { useGetInbox, useGetConversation, useSendMessage } from "@workspace/api-client-react";
import { MessageSquare, Send, Wallet, ArrowLeft, Circle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export default function Messages() {
  const { address, connect, isConnecting } = useWeb3();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: inbox, refetch: refetchInbox } = useGetInbox(address ?? "", {
    query: { enabled: !!address, refetchInterval: 5000 }
  });

  const { data: conversation, refetch: refetchConversation } = useGetConversation(
    { walletA: address ?? "", walletB: selectedWallet ?? "" },
    { query: { enabled: !!address && !!selectedWallet, refetchInterval: 3000 } }
  );

  const sendMessage = useSendMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSend = async () => {
    if (!address || !selectedWallet || !newMessage.trim()) return;
    setIsSending(true);
    try {
      await sendMessage.mutateAsync({
        data: { fromWallet: address, toWallet: selectedWallet, content: newMessage.trim() }
      });
      setNewMessage("");
      refetchConversation();
      refetchInbox();
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatWallet = (w: string) => `${w.substring(0, 8)}...${w.substring(w.length - 6)}`;

  if (!address) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold uppercase mb-3">Private Messaging</h2>
            <p className="text-muted-foreground max-w-md">Connect your wallet to access your inbox and send messages to workers or clients.</p>
          </div>
          <Button size="lg" className="rounded-none uppercase tracking-wider font-bold h-14 px-8" onClick={connect} disabled={isConnecting}>
            <Wallet className="w-5 h-5 mr-2" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold uppercase tracking-tight">Messages</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">{formatWallet(address)}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-0">
        <div className="flex h-[calc(100vh-220px)] border border-border bg-card/20">
          {/* Sidebar — conversation list */}
          <div className={`w-full md:w-72 border-r border-border flex-shrink-0 overflow-y-auto ${selectedWallet ? "hidden md:flex flex-col" : "flex flex-col"}`}>
            <div className="p-4 border-b border-border bg-card/50">
              <h2 className="font-bold uppercase text-xs tracking-widest text-muted-foreground">Conversations</h2>
            </div>

            {!inbox || inbox.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Send a message from a worker's profile.</p>
              </div>
            ) : (
              <div className="flex-1">
                {inbox.map((conv) => (
                  <button
                    key={conv.otherWallet}
                    onClick={() => setSelectedWallet(conv.otherWallet)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-muted/40 transition-colors text-left border-b border-border/50 ${selectedWallet === conv.otherWallet ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
                  >
                    <Avatar className="w-10 h-10 rounded-none shrink-0">
                      <AvatarFallback className="rounded-none bg-primary/10 text-primary font-mono text-xs">
                        {conv.otherWallet.substring(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-foreground font-bold truncate">{formatWallet(conv.otherWallet)}</span>
                        {conv.unreadCount > 0 && (
                          <Badge className="rounded-none text-xs h-5 min-w-5 px-1 bg-primary text-primary-foreground">{conv.unreadCount}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5 font-mono">
                        {format(new Date(conv.lastMessageAt), "MMM d, HH:mm")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main chat area */}
          <div className={`flex-1 flex flex-col ${!selectedWallet ? "hidden md:flex" : "flex"}`}>
            {!selectedWallet ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-wider">Select a conversation</p>
                <p className="text-sm mt-1 opacity-60">Or message a worker from their profile page</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-border bg-card/50 flex items-center gap-3">
                  <button className="md:hidden mr-1" onClick={() => setSelectedWallet(null)}>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar className="w-9 h-9 rounded-none">
                    <AvatarFallback className="rounded-none bg-primary/10 text-primary font-mono text-xs">
                      {selectedWallet.substring(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-mono text-sm font-bold">{formatWallet(selectedWallet)}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Circle className="w-2 h-2 text-primary fill-primary" />
                      <span className="text-xs text-muted-foreground">Wallet verified</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {!conversation || conversation.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                      <p className="text-sm">No messages yet. Say hello!</p>
                    </div>
                  ) : (
                    conversation.map((msg) => {
                      const isMe = msg.fromWallet.toLowerCase() === address.toLowerCase();
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 text-sm leading-relaxed ${
                            isMe
                              ? "bg-primary/20 border border-primary/40 text-foreground rounded-tl-lg rounded-tr-none rounded-bl-lg rounded-br-lg"
                              : "bg-card border border-border text-foreground rounded-tl-none rounded-tr-lg rounded-bl-lg rounded-br-lg"
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <p className={`text-xs mt-1.5 font-mono ${isMe ? "text-primary/60 text-right" : "text-muted-foreground"}`}>
                              {format(new Date(msg.createdAt), "HH:mm")}
                              {isMe && !msg.isRead && <span className="ml-1">·</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border bg-card/50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      className="flex-1 rounded-none bg-background h-11 focus-visible:ring-1 focus-visible:ring-primary"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button
                      className="rounded-none h-11 px-5 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleSend}
                      disabled={!newMessage.trim() || isSending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-mono">Press Enter to send · Shift+Enter for newline</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
