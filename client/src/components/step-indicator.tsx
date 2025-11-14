import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isUpcoming = currentStep < step.id;

        return (
          <div key={step.id} className="relative flex items-start gap-4" data-testid={`step-${step.id}`}>
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-5 top-11 h-full w-0.5 -translate-x-1/2",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}

            {/* Step Circle */}
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2" data-testid={`step-indicator-${step.id}`}>
              {isCompleted ? (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary">
                  <Check className="h-5 w-5 text-primary-foreground" />
                </div>
              ) : (
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center rounded-full font-semibold text-sm",
                    isCurrent && "bg-primary text-primary-foreground border-primary",
                    isUpcoming && "bg-background text-muted-foreground border-border"
                  )}
                >
                  {step.id}
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pb-8 pt-1">
              <h3
                className={cn(
                  "font-semibold tracking-tight",
                  isCurrent && "text-foreground",
                  (isCompleted || isUpcoming) && "text-muted-foreground"
                )}
                data-testid={`text-step-title-${step.id}`}
              >
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1" data-testid={`text-step-description-${step.id}`}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
