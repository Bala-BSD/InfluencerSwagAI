import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles } from "lucide-react";
import { ContentIdea } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ContentIdeasGridProps {
  ideas: ContentIdea[];
  onSelectIdea: (idea: ContentIdea) => void;
  selectedIdeaId?: string;
}

const funnelStageColors = {
  awareness: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  engagement: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  conversion: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  retention: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  trending: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
};

const funnelStageLabels = {
  awareness: "Awareness",
  engagement: "Engagement",
  conversion: "Conversion",
  retention: "Retention",
  trending: "Trending",
};

export function ContentIdeasGrid({ ideas, onSelectIdea, selectedIdeaId }: ContentIdeasGridProps) {
  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No ideas yet</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Complete the form above to generate AI-powered content ideas
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ideas.map((idea) => {
        const isSelected = selectedIdeaId === idea.id;
        
        return (
          <Card
            key={idea.id}
            className={cn(
              "flex flex-col gap-4 p-6 transition-all hover-elevate cursor-pointer",
              isSelected && "border-primary bg-accent"
            )}
            onClick={() => onSelectIdea(idea)}
            data-testid={`card-idea-${idea.id}`}
          >
            <div className="flex items-start justify-between gap-2">
              <Badge
                variant="outline"
                className={cn("border", funnelStageColors[idea.funnelStage])}
                data-testid={`badge-funnel-${idea.id}`}
              >
                {funnelStageLabels[idea.funnelStage]}
              </Badge>
              {idea.funnelStage === 'trending' && (
                <Sparkles className="h-4 w-4 text-pink-500" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="font-semibold tracking-tight line-clamp-2" data-testid={`text-idea-title-${idea.id}`}>
                {idea.title}
              </h3>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Hook:</p>
                <p className="text-sm text-foreground line-clamp-2">{idea.hook}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Angle:</p>
                <p className="text-sm text-foreground line-clamp-2">{idea.angle}</p>
              </div>
            </div>

            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="w-full"
              data-testid={`button-select-idea-${idea.id}`}
            >
              {isSelected ? "Selected" : "Select Idea"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
