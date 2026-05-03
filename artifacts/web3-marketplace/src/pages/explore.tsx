import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WorkerCard } from "@/components/worker-card";
import { useListWorkers, useListCategories } from "@workspace/api-client-react";
import { Search, Filter, SlidersHorizontal, Star, ArrowUpDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListWorkersType } from "@workspace/api-client-react/src/generated/api.schemas";
import { CRYPTO_COUNTRY_NAMES, getStates, getCities } from "@/lib/crypto-countries";

const STAR_FILTER_OPTIONS = [
  { value: "0",   label: "Any Rating" },
  { value: "3",   label: "3+ Stars" },
  { value: "4",   label: "4+ Stars" },
  { value: "4.5", label: "4.5+ Stars" },
  { value: "5",   label: "5 Stars Only" },
];

type SortOption = "newest" | "rating" | "completedJobs" | "rateAsc" | "rateDesc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",       label: "Newest First" },
  { value: "rating",       label: "Highest Rated" },
  { value: "completedJobs",label: "Most Jobs Done" },
  { value: "rateAsc",      label: "Lowest Rate" },
  { value: "rateDesc",     label: "Highest Rate" },
];

function StarBadge({ min }: { min: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono text-primary bg-primary/10 px-2 py-1 border border-primary/30">
      <Star className="w-3 h-3 fill-primary" /> {min}+ stars
    </span>
  );
}

export default function Explore() {
  const searchParams = new URLSearchParams(window.location.search);

  const [search, setSearch]         = useState(searchParams.get("search") || "");
  const [type, setType]             = useState<ListWorkersType>((searchParams.get("type") as ListWorkersType) || "manual");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("category") ? parseInt(searchParams.get("category")!) : undefined
  );
  const [country, setCountry]       = useState("");
  const [state, setState]           = useState("");
  const [city, setCity]             = useState("");
  const [minRating, setMinRating]   = useState<number | undefined>(undefined);
  const [sortBy, setSortBy]         = useState<SortOption>("newest");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  const states = country ? getStates(country) : [];
  const cities = country && state ? getCities(country, state) : [];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories } = useListCategories({ type });

  const { data: workers, isLoading } = useListWorkers({
    type,
    search: debouncedSearch || undefined,
    categoryId,
    country:   country   || undefined,
    state:     state     || undefined,
    city:      city      || undefined,
    minRating,
    sortBy,
  } as any);

  const clearFilters = () => {
    setSearch("");
    setCategoryId(undefined);
    setCountry("");
    setState("");
    setCity("");
    setMinRating(undefined);
    setSortBy("newest");
  };

  const activeFilterCount = [categoryId, country, minRating].filter(Boolean).length;
  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy)!;

  return (
    <Layout>
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-6">Explore Workers</h1>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Type tabs */}
            <Tabs
              value={type}
              onValueChange={(v) => {
                setType(v as ListWorkersType);
                setCategoryId(undefined);
                setCountry(""); setState(""); setCity("");
              }}
              className="lg:w-[300px]"
            >
              <TabsList className="w-full h-12 grid grid-cols-2 rounded-none bg-background border border-border p-1">
                <TabsTrigger value="manual"  className="rounded-none uppercase text-xs tracking-wider data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Local Manual</TabsTrigger>
                <TabsTrigger value="online"  className="rounded-none uppercase text-xs tracking-wider data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary">Remote Online</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex-1 flex gap-2">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, skill, or keyword..."
                  className="h-12 pl-10 rounded-none bg-background focus-visible:ring-1 focus-visible:ring-primary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="h-12 w-[180px] rounded-none border-border bg-background gap-2 shrink-0">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter toggle */}
              <Button
                variant={showFilters ? "secondary" : "outline"}
                className="h-12 px-4 rounded-none relative"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 p-4 border border-border bg-background animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Category</label>
                  <Select
                    value={categoryId?.toString() || "all"}
                    onValueChange={(v) => setCategoryId(v === "all" ? undefined : parseInt(v))}
                  >
                    <SelectTrigger className="rounded-none"><SelectValue placeholder="All Categories" /></SelectTrigger>
                    <SelectContent className="rounded-none max-h-[240px]">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Rating */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" /> Min Rating
                  </label>
                  <Select
                    value={minRating?.toString() ?? "0"}
                    onValueChange={(v) => setMinRating(v === "0" ? undefined : parseFloat(v))}
                  >
                    <SelectTrigger className="rounded-none"><SelectValue placeholder="Any Rating" /></SelectTrigger>
                    <SelectContent className="rounded-none">
                      {STAR_FILTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            {opt.value !== "0" && <Star className="w-3.5 h-3.5 fill-primary text-primary" />}
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {type === "manual" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Country</label>
                      <Select
                        value={country || "all"}
                        onValueChange={(v) => { setCountry(v === "all" ? "" : v); setState(""); setCity(""); }}
                      >
                        <SelectTrigger className="rounded-none"><SelectValue placeholder="All Countries" /></SelectTrigger>
                        <SelectContent className="rounded-none max-h-[240px]">
                          <SelectItem value="all">All Countries</SelectItem>
                          {CRYPTO_COUNTRY_NAMES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">State / Region</label>
                      <Select
                        value={state || "all"}
                        onValueChange={(v) => { setState(v === "all" ? "" : v); setCity(""); }}
                        disabled={!country}
                      >
                        <SelectTrigger className="rounded-none">
                          <SelectValue placeholder={country ? "All States" : "Select country first"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-none max-h-[240px]">
                          <SelectItem value="all">All States</SelectItem>
                          {states.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">City</label>
                      <Select
                        value={city || "all"}
                        onValueChange={(v) => setCity(v === "all" ? "" : v)}
                        disabled={!state || cities.length === 0}
                      >
                        <SelectTrigger className="rounded-none">
                          <SelectValue placeholder={state ? (cities.length > 0 ? "All Cities" : "No cities listed") : "Select state first"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-none max-h-[240px]">
                          <SelectItem value="all">All Cities</SelectItem>
                          {cities.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              {/* Active chips */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                {country && (
                  <div className="flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-2 py-1 border border-primary/30">
                    📍 {[country, state, city].filter(Boolean).join(" › ")}
                  </div>
                )}
                {minRating && <StarBadge min={minRating} />}
                <Button
                  variant="ghost"
                  className="rounded-none uppercase text-xs tracking-wider ml-auto"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <h2 className="text-xl font-mono text-muted-foreground">
            {isLoading ? "Loading..." : `${workers?.length || 0} RESULTS`}
          </h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
            {minRating && <StarBadge min={minRating} />}
            <span className="flex items-center gap-1.5 border border-border px-2 py-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5" />
              {currentSort.label}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[300px] border border-border bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : workers && workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-border bg-card/30">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-wider mb-2">No workers found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {minRating
                ? `No workers found with ${minRating}+ star rating and your current filters. Try lowering the star minimum.`
                : "We couldn't find any workers matching your current filters. Try adjusting your search."}
            </p>
            <Button variant="outline" className="mt-6 rounded-none uppercase tracking-wider" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
