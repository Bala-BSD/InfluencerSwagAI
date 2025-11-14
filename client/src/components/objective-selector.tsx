import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Target, Users, TrendingUp, Heart, ArrowRight } from "lucide-react";

const objectives = [
  {
    id: 'awareness' as const,
    title: 'Awareness',
    description: 'Introduce your brand to new audiences and build recognition',
    icon: Target,
  },
  {
    id: 'engagement' as const,
    title: 'Engagement',
    description: 'Foster community interaction and deepen audience relationships',
    icon: Users,
  },
  {
    id: 'conversion' as const,
    title: 'Conversion',
    description: 'Drive sales, sign-ups, and direct action from your audience',
    icon: TrendingUp,
  },
  {
    id: 'retention' as const,
    title: 'Retention',
    description: 'Build loyalty and turn customers into repeat buyers',
    icon: Heart,
  },
];

interface ObjectiveSelectorProps {
  value: string;
  onChange: (value: 'awareness' | 'engagement' | 'conversion' | 'retention') => void;
  onContinue: () => void;
}

export function ObjectiveSelector({ value, onChange, onContinue }: ObjectiveSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {objectives.map((objective) => {
          const Icon = objective.icon;
          const isSelected = value === objective.id;

          return (
            <Card
              key={objective.id}
              className={cn(
                "cursor-pointer p-6 transition-all hover-elevate active-elevate-2",
                isSelected && "border-primary bg-accent"
              )}
              onClick={() => onChange(objective.id)}
              data-testid={`card-objective-${objective.id}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold tracking-tight">{objective.title}</h3>
                  <p className="text-sm text-muted-foreground">{objective.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          className="gap-2"
          onClick={onContinue}
          disabled={!value}
          data-testid="button-continue-objective"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
