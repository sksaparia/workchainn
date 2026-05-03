import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkerCard } from "@/components/worker-card";
import { useGetMarketplaceStats, useGetTopCategories, useListWorkers } from "@workspace/api-client-react";
import { Search, MapPin, Globe, ArrowRight, Activity, Users, CheckCircle, Boxes } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"manual" | "online">("manual");

  const { data: stats } = useGetMarketplaceStats();
  const { data: topCategories } = useGetTopCategories();
  
  const { data: featuredWorkers, isLoading: loadingWorkers } = useListWorkers({
    available: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    params.set("type", searchType);
    setLocation(`/explore?${params.toString()}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 mx-auto px-3 py-1 border border-primary/30 bg-primary/5 text-primary text-xs uppercase tracking-widest font-mono">
              <Activity className="w-3 h-3" />
              <span>Decentralized Job Network</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight uppercase leading-tight">
              The Future Of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Work & Pay</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find skilled workers for local tasks and online projects. Book instantly. Pay securely in crypto. Trustless and borderless.
            </p>

            <div className="mt-8 bg-card/80 backdrop-blur border border-border p-2 max-w-3xl mx-auto w-full">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
                <Tabs value={searchType} onValueChange={(v) => setSearchType(v as "manual" | "online")} className="md:w-[200px]">
                  <TabsList className="w-full h-12 grid grid-cols-2 rounded-none p-1 bg-background">
                    <TabsTrigger value="manual" className="rounded-none uppercase text-xs tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Local</TabsTrigger>
                    <TabsTrigger value="online" className="rounded-none uppercase text-xs tracking-wider data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">Remote</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder={searchType === "manual" ? "Search for plumbers, electricians, cleaners..." : "Search for developers, designers, writers..."}
                    className="h-12 pl-10 rounded-none border-none bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 rounded-none uppercase tracking-wider font-bold">
                  Explore
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center gap-2">
              <Users className="w-8 h-8 text-primary mb-2" />
              <span className="text-3xl font-mono font-bold">{stats?.totalWorkers || "0"}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Registered Workers</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <CheckCircle className="w-8 h-8 text-secondary mb-2" />
              <span className="text-3xl font-mono font-bold">{stats?.completedBookings || "0"}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Jobs Completed</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Boxes className="w-8 h-8 text-primary mb-2" />
              <span className="text-3xl font-mono font-bold">{stats?.totalCategories || "0"}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Job Categories</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Activity className="w-8 h-8 text-secondary mb-2" />
              <span className="text-3xl font-mono font-bold">{stats?.totalBookings || "0"}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Bookings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Workers */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-tight">Available Now</h2>
              <p className="text-muted-foreground mt-2">Top-rated workers ready to take your job</p>
            </div>
            <Button variant="outline" className="hidden md:flex rounded-none uppercase tracking-wider text-xs" onClick={() => setLocation("/explore")}>
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {loadingWorkers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[300px] border border-border bg-card/50 animate-pulse" />
              ))}
            </div>
          ) : featuredWorkers && featuredWorkers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredWorkers.slice(0, 8).map(worker => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-border">
              <p className="text-muted-foreground">No workers available at the moment.</p>
            </div>
          )}
          
          <div className="mt-8 flex justify-center md:hidden">
            <Button variant="outline" className="rounded-none uppercase tracking-wider w-full" onClick={() => setLocation("/explore")}>
              View All Workers
            </Button>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="py-24 bg-card/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-tight">Popular Categories</h2>
            <p className="text-muted-foreground mt-2">Explore the most demanded skills on WorkChain</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCategories?.slice(0, 6).map(category => (
              <Card key={category.categoryId} className="rounded-none bg-background hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setLocation(`/explore?type=${category.type}&category=${category.categoryId}`)}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-lg group-hover:text-primary transition-colors">{category.categoryName}</span>
                    <span className="text-sm text-muted-foreground">{category.industry}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                      {category.type === "manual" ? <MapPin className="w-5 h-5 text-primary" /> : <Globe className="w-5 h-5 text-secondary" />}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{category.workerCount} workers</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
