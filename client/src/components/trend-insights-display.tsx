import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Music, Calendar } from "lucide-react";
import { TrendInsights } from "@shared/schema";

interface TrendInsightsDisplayProps {
  insights: TrendInsights;
}

export function TrendInsightsDisplay({ insights }: TrendInsightsDisplayProps) {
  return (
    <Card className="p-6 space-y-6" data-testid="card-trend-insights">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight">Trend Insights</h3>
          <p className="text-sm text-muted-foreground">AI-predicted trends for your niche</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <h4 className="text-sm font-semibold">Emerging Formats</h4>
          </div>
          <div className="space-y-2">
            {insights.emergingFormats.map((format, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-3 text-sm"
                data-testid={`trend-format-${index}`}
              >
                {format}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <h4 className="text-sm font-semibold">Viral Narratives</h4>
          </div>
          <div className="space-y-2">
            {insights.viralNarratives.map((narrative, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-3 text-sm"
                data-testid={`trend-narrative-${index}`}
              >
                {narrative}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-purple-500" />
            <h4 className="text-sm font-semibold">Audio Styles</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.audioStyles.map((style, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
                data-testid={`trend-audio-${index}`}
              >
                {style}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-semibold">Seasonal Relevance</h4>
          </div>
          <div className="rounded-lg border bg-card p-3 text-sm" data-testid="trend-seasonal">
            {insights.seasonalRelevance}
          </div>
        </div>
      </div>
    </Card>
  );
}
