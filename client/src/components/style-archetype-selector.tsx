import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User, Award, TrendingUp, Lightbulb, Smile, GraduationCap, ArrowRight } from "lucide-react";

const archetypes = [
  {
    id: 'relatable_peer' as const,
    title: 'Relatable Peer',
    description: 'Friendly, authentic, like talking to a close friend',
    icon: User,
  },
  {
    id: 'expert_authority' as const,
    title: 'Expert Authority',
    description: 'Professional, credible, data-driven expertise',
    icon: Award,
  },
  {
    id: 'aspirational_leader' as const,
    title: 'Aspirational Leader',
    description: 'Motivating, inspiring, success-oriented',
    icon: TrendingUp,
  },
  {
    id: 'problem_solver' as const,
    title: 'Problem Solver',
    description: 'Practical, helpful, solution-focused',
    icon: Lightbulb,
  },
  {
    id: 'entertainer' as const,
    title: 'Entertainer',
    description: 'Fun, engaging, humor-driven content',
    icon: Smile,
  },
  {
    id: 'educator' as const,
    title: 'Educator',
    description: 'Informative, clear, teaching-focused',
    icon: GraduationCap,
  },
];

interface StyleArchetypeSelectorProps {
  value: string;
  onChange: (value: typeof archetypes[number]['id']) => void;
  onContinue: () => void;
}

export function StyleArchetypeSelector({ value, onChange, onContinue }: StyleArchetypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {archetypes.map((archetype) => {
          const Icon = archetype.icon;
          const isSelected = value === archetype.id;

          return (
            <Card
              key={archetype.id}
              className={cn(
                "cursor-pointer p-6 transition-all hover-elevate active-elevate-2",
                isSelected && "border-primary bg-accent"
              )}
              onClick={() => onChange(archetype.id)}
              data-testid={`card-style-${archetype.id}`}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold tracking-tight">{archetype.title}</h3>
                  <p className="text-sm text-muted-foreground">{archetype.description}</p>
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
          data-testid="button-generate-content"
        >
          Generate Content
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
