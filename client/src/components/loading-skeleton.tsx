import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContentIdeasSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-6 space-y-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-9 w-full mt-4" />
        </Card>
      ))}
    </div>
  );
}

export function ScriptSkeleton() {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="pl-16 space-y-3">
            <Skeleton className="absolute left-0 h-6 w-16" />
            <Card className="p-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function GeneratingContent() {
  return (
    <div className="flex flex-col items-center justify-center py-16" data-testid="loading-generating-content">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-primary/10" />
        </div>
      </div>
      <h3 className="mt-6 text-lg font-semibold" data-testid="text-loading-title">Generating Content Ideas</h3>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm" data-testid="text-loading-message">
        Our AI is crafting personalized content strategies for your brand...
      </p>
    </div>
  );
}
