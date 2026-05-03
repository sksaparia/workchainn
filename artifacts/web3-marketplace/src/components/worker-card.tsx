import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Worker } from "@workspace/api-client-react/src/generated/api.schemas";
import { MapPin, Globe, Star, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface WorkerCardProps {
  worker: Worker;
}

export function WorkerCard({ worker }: WorkerCardProps) {
  const initials = worker.displayName.substring(0, 2).toUpperCase();
  
  return (
    <Link href={`/worker/${worker.id}`}>
      <Card className="h-full flex flex-col hover:border-primary/50 transition-colors duration-300 cursor-pointer bg-card/50 backdrop-blur group relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardContent className="p-6 flex-1 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <Avatar className="w-16 h-16 border-2 border-border group-hover:border-primary/50 transition-colors rounded-none">
              <AvatarImage src={worker.avatarUrl || ""} alt={worker.displayName} className="object-cover" />
              <AvatarFallback className="rounded-none bg-muted font-mono">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={worker.isAvailable ? "default" : "secondary"} className="uppercase text-[10px] tracking-wider rounded-none">
                {worker.isAvailable ? "Available" : "Busy"}
              </Badge>
              {worker.rating ? (
                <div className="flex items-center gap-1 text-sm font-mono text-muted-foreground">
                  <Star className="w-3 h-3 text-secondary fill-secondary" />
                  {Number(worker.rating).toFixed(1)}
                </div>
              ) : null}
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{worker.displayName}</h3>
            <p className="text-sm text-primary uppercase tracking-wider">{worker.categoryName}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {worker.categoryType === "manual" ? (
              <>
                <MapPin className="w-4 h-4" />
                <span className="truncate">{worker.city ? `${worker.city}, ${worker.state || worker.country}` : "Location not set"}</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Remote (Online)</span>
              </>
            )}
          </div>
          
          {worker.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{worker.bio}</p>
          )}
        </CardContent>
        
        <CardFooter className="p-6 pt-0 border-t border-border/50 mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Rate</span>
            <div className="font-mono flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">{worker.rateAmount}</span>
              <span className="text-sm text-primary">{worker.rateCurrency}</span>
              <span className="text-xs text-muted-foreground">/{worker.rateType === "hourly" ? "hr" : "task"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 text-secondary" />
            <span>{worker.completedJobs} jobs</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
