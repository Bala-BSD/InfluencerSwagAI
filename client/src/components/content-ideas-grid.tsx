import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Heart, Plus } from "lucide-react";
import { ContentIdea } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ContentIdeasGridProps {
  ideas: ContentIdea[];
  onSelectIdea: (idea: ContentIdea) => void;
  selectedIdeaIds?: Set<string>;
  onGenerateMore?: (funnelStage: string) => void;
  generatingStage?: string | null;
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

export function ContentIdeasGrid({ ideas, onSelectIdea, selectedIdeaIds = new Set(), onGenerateMore, generatingStage = null }: ContentIdeasGridProps) {
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

  // Group ideas by funnel stage
  const groupedIdeas = ideas.reduce((acc, idea) => {
    const stage = idea.funnelStage;
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(idea);
    return acc;
  }, {} as Record<string, ContentIdea[]>);

  // Define the order of funnel stages for display
  const stageOrder: Array<keyof typeof funnelStageLabels> = ['awareness', 'engagement', 'conversion', 'retention', 'trending'];
  
  // Filter to only include stages that have ideas
  const availableStages = stageOrder.filter(stage => groupedIdeas[stage]?.length > 0);

  const renderIdeaCard = (idea: ContentIdea) => {
    const isSelected = selectedIdeaIds?.has(idea.id) || false;
    
    return (
      <Card
        key={idea.id}
        className={cn(
          "relative flex flex-col gap-4 p-6 transition-all hover-elevate cursor-pointer",
          isSelected && "border-primary bg-accent"
        )}
        onClick={() => onSelectIdea(idea)}
        data-testid={`card-idea-${idea.id}`}
      >
        {/* Heart icon in top right corner */}
        <div className="absolute top-4 right-4">
          <Heart
            className={cn(
              "h-5 w-5 transition-all",
              isSelected
                ? "fill-primary text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            data-testid={`icon-heart-${idea.id}`}
          />
        </div>

        <div className="flex items-start justify-between gap-2 pr-8">
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
            <p className="text-sm text-foreground line-clamp-2" data-testid={`text-idea-hook-${idea.id}`}>{idea.hook}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Angle:</p>
            <p className="text-sm text-foreground line-clamp-2" data-testid={`text-idea-angle-${idea.id}`}>{idea.angle}</p>
          </div>
        </div>

        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="w-full gap-2"
          data-testid={`button-select-idea-${idea.id}`}
        >
          <Heart className={cn("h-4 w-4", isSelected && "fill-current")} />
          {isSelected ? "Selected" : "Select Idea"}
        </Button>
      </Card>
    );
  };

  return (
    <Accordion type="multiple" defaultValue={availableStages} className="space-y-4">
      {availableStages.map((stage) => {
        const stageIdeas = groupedIdeas[stage] || [];
        const stageCount = stageIdeas.length;
        
        return (
          <AccordionItem key={stage} value={stage} className="border rounded-lg px-6" data-testid={`accordion-${stage}`}>
            <AccordionTrigger className="hover:no-underline py-4" data-testid={`accordion-trigger-${stage}`}>
              <div className="flex items-center gap-3 flex-1">
                <Badge
                  variant="outline"
                  className={cn("border", funnelStageColors[stage])}
                >
                  {funnelStageLabels[stage]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {stageCount} {stageCount === 1 ? 'idea' : 'ideas'}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6 pt-2">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stageIdeas.map(renderIdeaCard)}
              </div>
              
              {/* Generate More Ideas Button */}
              {onGenerateMore && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateMore(stage);
                    }}
                    disabled={generatingStage === stage}
                    className="gap-2"
                    data-testid={`button-generate-more-${stage}`}
                  >
                    <Plus className="h-4 w-4" />
                    {generatingStage === stage ? 'Generating...' : 'Generate More Ideas'}
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
