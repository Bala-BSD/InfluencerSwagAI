import { Sparkles } from "lucide-react";

interface StudioHeaderProps {
  projectName?: string;
}

export function StudioHeader({ projectName }: StudioHeaderProps) {
  return (
    <header className="border-b bg-card" data-testid="header-studio">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" data-testid="text-app-title">
                {projectName || "Content SwaG"}
              </h1>
              <p className="text-xs text-muted-foreground" data-testid="text-app-subtitle">AI Content Studio</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
