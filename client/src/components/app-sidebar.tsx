import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, FolderOpen, Settings, Trash2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ContentProject } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<ContentProject | null>(null);

  const { data: projects, isLoading } = useQuery<ContentProject[]>({
    queryKey: ["/api/projects"],
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "The project and all its content have been removed.",
      });
      setProjectToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            <span className="font-semibold text-base">Content SwaG</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <Link href="/projects/new">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  data-testid="button-new-project"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading && (
                  <div className="px-2 py-4 text-sm text-muted-foreground">
                    Loading projects...
                  </div>
                )}
                {projects && projects.length === 0 && (
                  <div className="px-2 py-4 text-sm text-muted-foreground">
                    No projects yet. Create one to get started.
                  </div>
                )}
                {projects?.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <div className="flex items-center gap-1 w-full group">
                      <SidebarMenuButton
                        asChild
                        isActive={location === `/projects/${project.id}`}
                        className="flex-1"
                      >
                        <Link href={`/projects/${project.id}`} data-testid={`link-project-${project.id}`}>
                          <span className="truncate">{project.productName}</span>
                        </Link>
                      </SidebarMenuButton>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          setProjectToDelete(project);
                        }}
                        data-testid={`button-delete-project-${project.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t">
          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              data-testid="link-settings"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.productName}"? This will
              permanently remove the project and all associated content (ideas, scripts,
              hashtags). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && deleteProjectMutation.mutate(Number(projectToDelete.id))}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
