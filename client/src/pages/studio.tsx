import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProject } from "@/hooks/use-project";
import { StudioHeader } from "@/components/studio-header";
import { ContentIdeasGrid } from "@/components/content-ideas-grid";
import { ScriptDisplay } from "@/components/script-display";
import { HashtagStrategyDisplay } from "@/components/hashtag-strategy-display";
import { TrendInsightsDisplay } from "@/components/trend-insights-display";
import { GeneratingContent, ContentIdeasSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ContentIdea, ContentPackage, Script, HashtagStrategy, insertContentProjectSchema } from "@shared/schema";
import { Download, Edit, Sparkles, Heart, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const updateProjectSchema = insertContentProjectSchema.partial();

export default function Studio() {
  const { projectId, project, isLoading, error } = useProject();
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<Set<string>>(new Set());
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<"15" | "30" | "60">("30");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      productName: "",
      productDescription: "",
      targetAudience: "",
      brandVoice: "",
      campaignObjective: "" as "awareness" | "engagement" | "conversion" | "retention",
      contentStyle: "" as "relatable_peer" | "expert_authority" | "aspirational_leader" | "problem_solver" | "entertainer" | "educator",
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        productName: project.productName,
        productDescription: project.productDescription,
        targetAudience: project.targetAudience,
        brandVoice: project.brandVoice,
        campaignObjective: project.campaignObjective,
        contentStyle: project.contentStyle,
      });
    }
  }, [project, form]);

  const updateProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateProjectSchema>) => {
      if (!projectId) throw new Error("No project ID");
      return await apiRequest("PATCH", `/api/projects/${projectId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      setEditDialogOpen(false);
      toast({
        title: "Project updated",
        description: "Your project details have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update project details",
        variant: "destructive",
      });
    },
  });

  const generateContentMutation = useMutation({
    mutationFn: async () => {
      if (!project || !projectId) throw new Error("No project loaded");
      const response = await apiRequest("POST", "/api/content/generate", {
        projectId: projectId, // Pass projectId to generate content for existing project
        productName: project.productName,
        productDescription: project.productDescription,
        targetAudience: project.targetAudience,
        brandVoice: project.brandVoice,
        campaignObjective: project.campaignObjective,
        contentStyle: project.contentStyle,
      });
      // CRITICAL: apiRequest returns Response, must parse JSON to get ContentPackage
      return (await response.json()) as ContentPackage;
    },
    onSuccess: (data) => {
      if (projectId) {
        // Directly set the query data instead of invalidating
        queryClient.setQueryData(["/api/content/package", projectId], data);
      }
      toast({
        title: "Content generated!",
        description: "Your AI-powered content package is ready",
      });
    },
    onError: (error: any) => {
      console.error("Content generation error:", error);
      toast({
        title: "Generation failed",
        description: "Please try again or adjust your inputs",
        variant: "destructive",
      });
    },
  });

  const { data: contentPackage, isLoading: isLoadingPackage } = useQuery<ContentPackage>({
    queryKey: ["/api/content/package", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("No project ID");
      const response = await fetch(`/api/content/package?projectId=${projectId}`);
      if (!response.ok) {
        if (response.status === 404) return null; // No content package yet - show empty state
        throw new Error("Failed to fetch content package");
      }
      return response.json();
    },
    enabled: !!projectId,
    retry: false, // Don't retry on 404
  });

  const generateScriptMutation = useMutation({
    mutationFn: async ({ idea, duration }: { idea: ContentIdea; duration: string }) => {
      if (!project) throw new Error("No project loaded");
      const response = await apiRequest("POST", "/api/content/script", {
        ideaId: idea.id,
        projectId: idea.projectId,
        ideaTitle: idea.title,
        ideaHook: idea.hook,
        ideaAngle: idea.angle,
        productName: project.productName,
        duration,
        contentStyle: project.contentStyle,
      });
      const script = (await response.json()) as Script;
      return { script, ideaId: idea.id, duration };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/content/script", data.ideaId, data.duration], data.script);
    },
  });

  const { data: script } = useQuery<Script>({
    queryKey: ["/api/content/script", selectedIdea?.id, selectedDuration],
    queryFn: async () => {
      const response = await fetch(`/api/content/script/${selectedIdea?.id}/${selectedDuration}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch script");
      }
      return response.json();
    },
    enabled: false,
  });

  const generateHashtagsMutation = useMutation({
    mutationFn: async ({ idea }: { idea: ContentIdea }) => {
      if (!project) throw new Error("No project loaded");
      const response = await apiRequest("POST", "/api/content/hashtags", {
        ideaId: idea.id,
        projectId: idea.projectId,
        ideaTitle: idea.title,
        productName: project.productName,
        funnelStage: idea.funnelStage,
      });
      const hashtags = (await response.json()) as HashtagStrategy;
      return { hashtags, ideaId: idea.id };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/content/hashtags", data.ideaId], data.hashtags);
    },
  });

  const { data: hashtags } = useQuery<HashtagStrategy>({
    queryKey: ["/api/content/hashtags", selectedIdea?.id],
    queryFn: async () => {
      const response = await fetch(`/api/content/hashtags/${selectedIdea?.id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch hashtags");
      }
      return response.json();
    },
    enabled: false,
  });

  const handleToggleIdeaSelection = (idea: ContentIdea) => {
    setSelectedIdeaIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idea.id)) {
        newSet.delete(idea.id);
      } else {
        newSet.add(idea.id);
      }
      return newSet;
    });
  };

  const handleSelectIdea = async (idea: ContentIdea) => {
    setSelectedIdea(idea);

    try {
      const cachedScript = queryClient.getQueryData(["/api/content/script", idea.id, selectedDuration]);
      if (!cachedScript) {
        await generateScriptMutation.mutateAsync({ idea, duration: selectedDuration });
      }
    } catch (error) {
      console.error("Error generating script:", error);
    }

    try {
      const cachedHashtags = queryClient.getQueryData(["/api/content/hashtags", idea.id]);
      if (!cachedHashtags) {
        await generateHashtagsMutation.mutateAsync({ idea });
      }
    } catch (error) {
      console.error("Error generating hashtags:", error);
    }
  };

  useEffect(() => {
    if (selectedIdea) {
      const generateIfMissing = async () => {
        try {
          const cachedScript = queryClient.getQueryData(["/api/content/script", selectedIdea.id, selectedDuration]);
          if (!cachedScript) {
            await generateScriptMutation.mutateAsync({ idea: selectedIdea, duration: selectedDuration });
          }
        } catch (error) {
          console.error("Error generating script on duration change:", error);
        }
      };

      generateIfMissing();
    }
  }, [selectedDuration, selectedIdea]);

  const handleExportPackage = () => {
    if (!contentPackage || !project) return;

    const exportData = {
      product: contentPackage.project,
      ideas: contentPackage.ideas,
      trendInsights: contentPackage.trendInsights,
      selectedIdea: selectedIdea,
      script: script,
      hashtags: hashtags,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-package-${project.productName.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Package exported",
      description: "Your content package has been downloaded",
    });
  };

  const handleUpdateProject = (data: z.infer<typeof updateProjectSchema>) => {
    updateProjectMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StudioHeader />
        <main className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground" data-testid="text-loading">Loading project...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <StudioHeader />
        <main className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold tracking-tight" data-testid="text-error-title">Project Not Found</h2>
              <p className="text-muted-foreground" data-testid="text-error-message">
                The project you're looking for doesn't exist or has been deleted.
              </p>
              <Button asChild data-testid="button-back-projects">
                <a href="/projects">Back to Projects</a>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StudioHeader projectName={project.productName} />

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        <div className="space-y-6">
          {/* Project Summary Card */}
          <Card data-testid="card-project-summary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle data-testid="text-project-name">{project.productName}</CardTitle>
                  <CardDescription data-testid="text-project-objective">
                    {project.campaignObjective} • {project.contentStyle.replace(/_/g, " ")}
                  </CardDescription>
                </div>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" data-testid="button-edit-project">
                      <Edit className="h-4 w-4" />
                      Edit Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" data-testid="dialog-edit-project">
                    <DialogHeader>
                      <DialogTitle>Edit Project Details</DialogTitle>
                      <DialogDescription>Update your project information and brand settings</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleUpdateProject)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="productName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-product-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="campaignObjective"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Campaign Objective</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-campaign-objective">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="awareness">Brand Awareness</SelectItem>
                                    <SelectItem value="engagement">Engagement</SelectItem>
                                    <SelectItem value="conversion">Conversion</SelectItem>
                                    <SelectItem value="retention">Retention</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="productDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} data-testid="input-product-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="targetAudience"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Audience</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={3} data-testid="input-target-audience" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="brandVoice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Brand Voice</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={3} data-testid="input-brand-voice" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="contentStyle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content Style</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-content-style">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="relatable_peer">Relatable Peer</SelectItem>
                                  <SelectItem value="expert_authority">Expert Authority</SelectItem>
                                  <SelectItem value="aspirational_leader">Aspirational Leader</SelectItem>
                                  <SelectItem value="problem_solver">Problem Solver</SelectItem>
                                  <SelectItem value="entertainer">Entertainer</SelectItem>
                                  <SelectItem value="educator">Educator</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            data-testid="button-cancel-edit"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateProjectMutation.isPending}
                            data-testid="button-save-project"
                          >
                            {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm mt-1" data-testid="text-project-description">{project.productDescription}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Target Audience</p>
                  <p className="text-sm mt-1" data-testid="text-target-audience">{project.targetAudience}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Brand Voice</p>
                  <p className="text-sm mt-1" data-testid="text-brand-voice">{project.brandVoice}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Generation Section */}
          <div className="space-y-6" data-testid="section-content-workspace">
            {!contentPackage && !generateContentMutation.isPending && (
              <Card className="p-8">
                <div className="text-center space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary mx-auto">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight" data-testid="text-generate-prompt">
                      Ready to Generate Content
                    </h3>
                    <p className="text-muted-foreground mt-2" data-testid="text-generate-description">
                      Generate AI-powered content ideas, scripts, and strategies for {project.productName}
                    </p>
                  </div>
                  <Button
                    onClick={() => generateContentMutation.mutate()}
                    size="lg"
                    className="gap-2"
                    data-testid="button-generate-content"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Content Package
                  </Button>
                </div>
              </Card>
            )}

            {generateContentMutation.isPending && <GeneratingContent />}

            {contentPackage && contentPackage.ideas && (
              <div className="space-y-6" data-testid="section-generated-content">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight" data-testid="text-package-title">Content Package</h2>
                  <Button
                    size="sm"
                    onClick={handleExportPackage}
                    className="gap-2"
                    data-testid="button-export-package"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>

                <TrendInsightsDisplay insights={contentPackage.trendInsights} />

                <div className="space-y-4">
                  <h3 className="text-xl font-bold tracking-tight" data-testid="text-ideas-count">
                    Content Ideas ({contentPackage.ideas.length})
                  </h3>
                  {isLoadingPackage ? (
                    <ContentIdeasSkeleton />
                  ) : (
                    <ContentIdeasGrid
                      ideas={contentPackage.ideas}
                      onSelectIdea={handleToggleIdeaSelection}
                      selectedIdeaIds={selectedIdeaIds}
                    />
                  )}
                </div>

                {selectedIdea && (
                  <div className="space-y-6" data-testid="section-production-assets">
                    <Tabs value={selectedDuration} onValueChange={(v) => setSelectedDuration(v as any)}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold tracking-tight" data-testid="text-assets-title">
                          Production Ready Assets
                        </h3>
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
        </div>

        {/* Floating Action Bar for Selected Ideas */}
        {selectedIdeaIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Card className="border-primary shadow-lg">
              <CardContent className="flex items-center gap-6 p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold" data-testid="text-selected-count">
                    {selectedIdeaIds.size} {selectedIdeaIds.size === 1 ? 'idea' : 'ideas'} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIdeaIds(new Set())}
                    data-testid="button-clear-selection"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      // Save selected IDs to session storage and navigate
                      sessionStorage.setItem('selectedIdeaIds', JSON.stringify(Array.from(selectedIdeaIds)));
                      window.location.href = `/projects/${projectId}/generate`;
                    }}
                    data-testid="button-generate-scripts"
                  >
                    Generate Scripts
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
