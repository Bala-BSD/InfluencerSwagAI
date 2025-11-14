import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StudioHeader } from "@/components/studio-header";
import { StepIndicator } from "@/components/step-indicator";
import { ProductDefinitionForm } from "@/components/product-definition-form";
import { ObjectiveSelector } from "@/components/objective-selector";
import { StyleArchetypeSelector } from "@/components/style-archetype-selector";
import { ContentIdeasGrid } from "@/components/content-ideas-grid";
import { ScriptDisplay } from "@/components/script-display";
import { HashtagStrategyDisplay } from "@/components/hashtag-strategy-display";
import { TrendInsightsDisplay } from "@/components/trend-insights-display";
import { GeneratingContent, ContentIdeasSkeleton } from "@/components/loading-skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ContentIdea, ContentPackage, Script, HashtagStrategy } from "@shared/schema";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Product Definition", description: "Define your product and brand" },
  { id: 2, title: "Campaign Objective", description: "Choose your content goal" },
  { id: 3, title: "Content Style", description: "Select your creator archetype" },
  { id: 4, title: "Review & Generate", description: "Generate content package" },
];

export default function Studio() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    targetAudience: "",
    brandVoice: "",
    campaignObjective: "" as "awareness" | "engagement" | "conversion" | "retention",
    contentStyle: "" as "relatable_peer" | "expert_authority" | "aspirational_leader" | "problem_solver" | "entertainer" | "educator",
  });
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<"15" | "30" | "60">("30");
  const { toast } = useToast();

  const generateContentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/content/generate", data);
      return response as ContentPackage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/package'] });
      toast({
        title: "Content generated!",
        description: "Your AI-powered content package is ready",
      });
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Please try again or adjust your inputs",
        variant: "destructive",
      });
    },
  });

  const { data: contentPackage, isLoading: isLoadingPackage } = useQuery<ContentPackage>({
    queryKey: ['/api/content/package'],
    enabled: generateContentMutation.isSuccess,
  });

  const generateScriptMutation = useMutation({
    mutationFn: async () => {
      if (!selectedIdea) return;
      const response = await apiRequest("POST", "/api/content/script", {
        ideaId: selectedIdea.id,
        ideaTitle: selectedIdea.title,
        ideaHook: selectedIdea.hook,
        ideaAngle: selectedIdea.angle,
        productName: formData.productName,
        duration: selectedDuration,
        contentStyle: formData.contentStyle,
      });
      return response as Script;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/script', selectedIdea?.id, selectedDuration] });
    },
  });

  const { data: script } = useQuery<Script>({
    queryKey: ['/api/content/script', selectedIdea?.id, selectedDuration],
    enabled: !!selectedIdea,
  });

  const generateHashtagsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedIdea) return;
      const response = await apiRequest("POST", "/api/content/hashtags", {
        ideaTitle: selectedIdea.title,
        productName: formData.productName,
        funnelStage: selectedIdea.funnelStage,
      });
      return response as HashtagStrategy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content/hashtags', selectedIdea?.id] });
    },
  });

  const { data: hashtags } = useQuery<HashtagStrategy>({
    queryKey: ['/api/content/hashtags', selectedIdea?.id],
    enabled: !!selectedIdea,
  });

  const handleProductSubmit = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleObjectiveContinue = () => {
    setCurrentStep(3);
  };

  const handleStyleContinue = () => {
    setCurrentStep(4);
    generateContentMutation.mutate(formData);
  };

  const handleSelectIdea = (idea: ContentIdea) => {
    setSelectedIdea(idea);
    if (!script) {
      generateScriptMutation.mutate();
    }
    if (!hashtags) {
      generateHashtagsMutation.mutate();
    }
  };

  const handleExportPackage = () => {
    if (!contentPackage) return;
    
    const exportData = {
      product: contentPackage.project,
      ideas: contentPackage.ideas,
      trendInsights: contentPackage.trendInsights,
      selectedIdea: selectedIdea,
      script: script,
      hashtags: hashtags,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-package-${formData.productName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Package exported",
      description: "Your content package has been downloaded",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <StudioHeader />

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Step Indicator Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <StepIndicator steps={steps} currentStep={currentStep} />
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {currentStep < 4 && (
              <Card className="p-8" data-testid="card-step-form">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight" data-testid="text-step-1-title">Product Definition</h2>
                      <p className="text-muted-foreground mt-2" data-testid="text-step-1-description">
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
                        <h2 className="text-2xl font-bold tracking-tight" data-testid="text-step-2-title">Campaign Objective</h2>
                        <p className="text-muted-foreground mt-2" data-testid="text-step-2-description">
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
                      value={formData.campaignObjective}
                      onChange={(value) => setFormData((prev) => ({ ...prev, campaignObjective: value }))}
                      onContinue={handleObjectiveContinue}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight" data-testid="text-step-3-title">Content Style</h2>
                        <p className="text-muted-foreground mt-2" data-testid="text-step-3-description">
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
                      value={formData.contentStyle}
                      onChange={(value) => setFormData((prev) => ({ ...prev, contentStyle: value }))}
                      onContinue={handleStyleContinue}
                    />
                  </div>
                )}
              </Card>
            )}

            {currentStep === 4 && (
              <div className="space-y-6" data-testid="section-content-package">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight" data-testid="text-package-title">Content Package</h2>
                    <p className="text-muted-foreground mt-1" data-testid="text-package-subtitle">
                      {formData.productName} • {formData.campaignObjective}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="gap-2"
                      data-testid="button-start-over"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Start Over
                    </Button>
                    {contentPackage && (
                      <Button
                        size="sm"
                        onClick={handleExportPackage}
                        className="gap-2"
                        data-testid="button-export-package"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                {generateContentMutation.isPending && <GeneratingContent />}

                {/* Content Display */}
                {contentPackage && (
                  <div className="space-y-6" data-testid="section-generated-content">
                    {/* Trend Insights */}
                    <TrendInsightsDisplay insights={contentPackage.trendInsights} />

                    {/* Content Ideas */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold tracking-tight" data-testid="text-ideas-count">
                        Content Ideas ({contentPackage.ideas.length})
                      </h3>
                      {isLoadingPackage ? (
                        <ContentIdeasSkeleton />
                      ) : (
                        <ContentIdeasGrid
                          ideas={contentPackage.ideas}
                          onSelectIdea={handleSelectIdea}
                          selectedIdeaId={selectedIdea?.id}
                        />
                      )}
                    </div>

                    {/* Selected Idea Details */}
                    {selectedIdea && (
                      <div className="space-y-6" data-testid="section-production-assets">
                        <Tabs value={selectedDuration} onValueChange={(v) => setSelectedDuration(v as any)}>
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold tracking-tight" data-testid="text-assets-title">Production Ready Assets</h3>
                            <TabsList data-testid="tabs-duration">
                              <TabsTrigger value="15" data-testid="tab-15s">15s</TabsTrigger>
                              <TabsTrigger value="30" data-testid="tab-30s">30s</TabsTrigger>
                              <TabsTrigger value="60" data-testid="tab-60s">60s</TabsTrigger>
                            </TabsList>
                          </div>

                          <TabsContent value={selectedDuration} className="mt-6 space-y-6">
                            {script && (
                              <ScriptDisplay
                                script={script}
                                ideaTitle={selectedIdea.title}
                              />
                            )}
                            {hashtags && (
                              <HashtagStrategyDisplay strategy={hashtags} />
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
