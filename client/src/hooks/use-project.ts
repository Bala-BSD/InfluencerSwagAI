import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ContentProject } from "@shared/schema";

export function useProject() {
  const [match, params] = useRoute("/projects/:projectId");
  const projectId = match && params?.projectId ? params.projectId : null;

  const query = useQuery<ContentProject>({
    queryKey: ["/api/projects", projectId],
    queryFn: async () => {
      if (!projectId) throw new Error("No project ID");
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Project not found");
        throw new Error("Failed to load project");
      }
      return response.json();
    },
    enabled: !!projectId,
  });

  return {
    projectId,
    project: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
