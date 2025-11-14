import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ContentProject } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";

export default function Projects() {
  const { data: projects, isLoading } = useQuery<ContentProject[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-projects-title">
              Your Projects
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-projects-description">
              Manage your content creation projects
            </p>
          </div>
          <Link href="/projects/new">
            <Button data-testid="button-create-project" className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        )}

        {projects && projects.length === 0 && (
          <Card className="p-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2" data-testid="text-no-projects">
              No projects yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first project to start generating AI-powered content
            </p>
            <Link href="/projects/new">
              <Button data-testid="button-create-first-project">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </Card>
        )}

        {projects && projects.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card
                  className="p-6 hover-elevate active-elevate-2 cursor-pointer h-full"
                  data-testid={`card-project-${project.id}`}
                >
                  <h3 className="font-semibold text-lg mb-2 truncate" data-testid={`text-project-name-${project.id}`}>
                    {project.productName}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.productDescription}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{project.campaignObjective}</span>
                    <span>•</span>
                    <span className="capitalize">{project.contentStyle}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
