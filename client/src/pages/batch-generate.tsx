import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ContentProject } from "@shared/schema";
import { StudioHeader } from "@/components/studio-header";
import { ScriptDisplay } from "@/components/script-display";
import { HashtagStrategyDisplay } from "@/components/hashtag-strategy-display";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ContentIdea, Script, HashtagStrategy } from "@shared/schema";
import { ArrowLeft, Sparkles, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BatchGenerate() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/projects/:projectId/generate");
  const projectId = params?.projectId || null;
  const { toast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState<"15" | "30" | "60">("30");
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<Set<string>>(new Set());
  const [selectedIdeas, setSelectedIdeas] = useState<ContentIdea[]>([]);
  const [generatedScripts, setGeneratedScripts] = useState<Map<string, Script>>(new Map());
  const [generatedHashtags, setGeneratedHashtags] = useState<Map<string, HashtagStrategy>>(new Map());
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  // Fetch project data
  const { data: project } = useQuery<ContentProject>({
    queryKey: ["/api/projects", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("No project ID");
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error("Failed to load project");
      return response.json();
    },
    enabled: !!projectId,
  });

  // Fetch content package
  const { data: contentPackage, isLoading: isLoadingPackage } = useQuery({
    queryKey: ["/api/content/package", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("No project ID");
      const response = await fetch(`/api/content/package?projectId=${projectId}`);
      if (!response.ok) throw new Error("Failed to load content package");
      return response.json();
    },
    enabled: !!projectId,
  });

  // Load selected ideas from session storage and filter content package
  useEffect(() => {
    const storedIds = sessionStorage.getItem('selectedIdeaIds');
    const storedProjectId = sessionStorage.getItem('selectedProjectId');
    
    // Validate that selected ideas belong to current project
    if (storedProjectId && storedProjectId !== projectId) {
      // Clear stale selection from different project
      sessionStorage.removeItem('selectedIdeaIds');
      sessionStorage.removeItem('selectedProjectId');
      setSelectedIdeas([]);
      return;
    }
    
    if (storedIds && contentPackage?.ideas) {
      const ids = JSON.parse(storedIds) as string[];
      setSelectedIdeaIds(new Set(ids));
      const ideas = contentPackage.ideas.filter((idea: ContentIdea) => ids.includes(idea.id));
      setSelectedIdeas(ideas);
      
      // If no matching ideas found, clear sessionStorage
      if (ideas.length === 0) {
        sessionStorage.removeItem('selectedIdeaIds');
        sessionStorage.removeItem('selectedProjectId');
      }
    }
  }, [contentPackage, projectId]);

  const generateScriptMutation = useMutation({
    mutationFn: async ({ idea, duration }: { idea: ContentIdea; duration: string }) => {
      if (!projectId || !project) throw new Error("No project data");
      const response = await apiRequest("POST", "/api/content/script", {
        projectId,
        ideaId: idea.id,
        ideaTitle: idea.title,
        ideaHook: idea.hook,
        ideaAngle: idea.angle,
        productName: project.productName,
        contentStyle: project.contentStyle,
        duration: duration, // Send as string "15", "30", or "60"
      });
      const scriptData = await response.json();
      return scriptData;
    },
    onSuccess: (data, variables) => {
      setGeneratedScripts(prev => new Map(prev).set(`${variables.idea.id}-${variables.duration}`, data));
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.idea.id);
        return newSet;
      });
    },
    onError: (error, variables) => {
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.idea.id);
        return newSet;
      });
      toast({
        title: "Script generation failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const generateHashtagsMutation = useMutation({
    mutationFn: async (idea: ContentIdea) => {
      if (!projectId || !project) throw new Error("No project data");
      const response = await apiRequest("POST", "/api/content/hashtags", {
        projectId,
        ideaId: idea.id,
        ideaTitle: idea.title,
        productName: project.productName,
        funnelStage: idea.funnelStage,
      });
      return await response.json();
    },
    onSuccess: (data, idea) => {
      setGeneratedHashtags(prev => new Map(prev).set(idea.id, data));
    },
  });

  const handleGenerateForIdea = async (idea: ContentIdea) => {
    setGeneratingIds(prev => new Set(prev).add(idea.id));
    
    try {
      await generateScriptMutation.mutateAsync({ idea, duration: selectedDuration });
      await generateHashtagsMutation.mutateAsync(idea);
    } catch (error) {
      console.error("Error generating content:", error);
    }
  };

  const handleGenerateAll = async () => {
    for (const idea of selectedIdeas) {
      if (!generatedScripts.has(`${idea.id}-${selectedDuration}`)) {
        await handleGenerateForIdea(idea);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <StudioHeader projectName={project?.productName || "Content SwaG"} />
      
      <main className="flex-1 overflow-auto">
        {(!project || isLoadingPackage) ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" data-testid="spinner-loading" />
          </div>
        ) : selectedIdeas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <p className="text-muted-foreground" data-testid="text-no-ideas">No ideas selected</p>
            <Button
              onClick={() => setLocation(`/projects/${projectId}`)}
              data-testid="button-back-to-project"
            >
              Back to Project
            </Button>
          </div>
        ) : (
          <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation(`/projects/${projectId}`)}
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
                  Generate Scripts
                </h1>
                <p className="text-muted-foreground" data-testid="text-page-description">
                  Create production-ready scripts for {selectedIdeas.length} selected {selectedIdeas.length === 1 ? 'idea' : 'ideas'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2" data-testid="tabs-duration">
                <span className="text-sm text-muted-foreground mr-1">Duration:</span>
                <Button
                  variant={selectedDuration === "15" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDuration("15")}
                  data-testid="tab-15s"
                >
                  15s
                </Button>
                <Button
                  variant={selectedDuration === "30" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDuration("30")}
                  data-testid="tab-30s"
                >
                  30s
                </Button>
                <Button
                  variant={selectedDuration === "60" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDuration("60")}
                  data-testid="tab-60s"
                >
                  60s
                </Button>
              </div>
              <Button
                onClick={handleGenerateAll}
                disabled={generatingIds.size > 0}
                className="gap-2"
                data-testid="button-generate-all"
              >
                {generatingIds.size > 0 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate All Scripts
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Selected Ideas Grid */}
          <div className="space-y-6">
            {selectedIdeas.map((idea) => {
              const scriptKey = `${idea.id}-${selectedDuration}`;
              const script = generatedScripts.get(scriptKey);
              const hashtags = generatedHashtags.get(idea.id);
              const isGenerating = generatingIds.has(idea.id);
              const isGenerated = !!script;

              return (
                <Card key={idea.id} data-testid={`card-content-${idea.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" data-testid={`badge-funnel-${idea.id}`}>
                            {idea.funnelStage}
                          </Badge>
                          {isGenerated && (
                            <Badge variant="default" className="gap-1 bg-green-500" data-testid={`badge-generated-${idea.id}`}>
                              <Check className="h-3 w-3" />
                              Generated
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl" data-testid={`text-idea-title-${idea.id}`}>
                          {idea.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          <span className="font-medium">Hook:</span> {idea.hook}
                        </CardDescription>
                      </div>
                      {!isGenerated && (
                        <Button
                          onClick={() => handleGenerateForIdea(idea)}
                          disabled={isGenerating}
                          size="sm"
                          className="gap-2"
                          data-testid={`button-generate-${idea.id}`}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Generate Script
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  {script && (
                    <CardContent className="space-y-6">
                      <ScriptDisplay script={script} ideaTitle={idea.title} />
                      {hashtags && <HashtagStrategyDisplay strategy={hashtags} />}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
          </div>
        )}
      </main>
    </div>
  );
}
