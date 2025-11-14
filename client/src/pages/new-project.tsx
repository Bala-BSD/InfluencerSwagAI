import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductDefinitionForm } from "@/components/product-definition-form";
import { ObjectiveSelector } from "@/components/objective-selector";
import { StyleArchetypeSelector } from "@/components/style-archetype-selector";
import { StepIndicator } from "@/components/step-indicator";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface ProjectFormData {
  productName: string;
  productDescription: string;
  targetAudience: string;
  brandVoice: string;
  campaignObjective?: string;
  contentStyle?: string;
}

const steps = [
  { id: 1, title: "Product", description: "Define your product" },
  { id: 2, title: "Objective", description: "Set your goal" },
  { id: 3, title: "Style", description: "Choose your vibe" },
];

export default function NewProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    productName: "",
    productDescription: "",
    targetAudience: "",
    brandVoice: "",
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onSuccess: (project: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: `${project.productName} has been created successfully.`,
      });
      setLocation(`/projects/${project.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProductSubmit = (data: { productName: string; productDescription: string; targetAudience: string; brandVoice: string }) => {
    setFormData((prev: ProjectFormData) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleObjectiveContinue = () => {
    if (!formData.campaignObjective) return;
    setCurrentStep(3);
  };

  const handleStyleSubmit = async () => {
    if (!formData.contentStyle) return;
    await createProjectMutation.mutateAsync(formData);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <StepIndicator steps={steps} currentStep={currentStep} />
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-8" data-testid="card-new-project-form">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight" data-testid="text-new-project-title">
                      Create New Project
                    </h2>
                    <p className="text-muted-foreground mt-2" data-testid="text-new-project-description">
                      Tell us about your product and brand identity
                    </p>
                  </div>
                  <ProductDefinitionForm
                    onSubmit={handleProductSubmit}
                    defaultValues={formData}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight" data-testid="text-objective-title">
                        Campaign Objective
                      </h2>
                      <p className="text-muted-foreground mt-2" data-testid="text-objective-description">
                        What's your primary content goal?
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="gap-2"
                      data-testid="button-back-to-product"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>
                  <ObjectiveSelector
                    value={formData.campaignObjective || ""}
                    onChange={(value) => setFormData((prev: ProjectFormData) => ({ ...prev, campaignObjective: value }))}
                    onContinue={handleObjectiveContinue}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight" data-testid="text-style-title">
                        Content Style
                      </h2>
                      <p className="text-muted-foreground mt-2" data-testid="text-style-description">
                        Choose your creator archetype
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                      className="gap-2"
                      data-testid="button-back-to-objective"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>
                  <StyleArchetypeSelector
                    value={formData.contentStyle || ""}
                    onChange={(value) => setFormData((prev: ProjectFormData) => ({ ...prev, contentStyle: value }))}
                    onContinue={handleStyleSubmit}
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
