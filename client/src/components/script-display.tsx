import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Clock } from "lucide-react";
import { Script } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ScriptDisplayProps {
  script: Script;
  ideaTitle: string;
}

export function ScriptDisplay({ script, ideaTitle }: ScriptDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({
      title: "Copied to clipboard",
      description: `${section} copied successfully`,
    });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  const fullScript = script.scenes
    .map((scene) => {
      let text = `[${formatTime(scene.timeStart)}-${formatTime(scene.timeEnd)}]\n`;
      text += `VISUAL: ${scene.visual}\n`;
      text += `VOICE-OVER: ${scene.voiceOver}\n`;
      if (scene.onScreenText) text += `ON-SCREEN TEXT: ${scene.onScreenText}\n`;
      if (scene.audioCue) text += `AUDIO: ${scene.audioCue}\n`;
      if (scene.transition) text += `TRANSITION: ${scene.transition}\n`;
      return text;
    })
    .join('\n');

  return (
    <Card className="p-6 space-y-6" data-testid="card-script-display">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight" data-testid="text-script-title">
            {ideaTitle}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{script.duration}s Script</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => copyToClipboard(fullScript, "Full script")}
          data-testid="button-copy-full-script"
        >
          {copiedSection === "Full script" ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy All
            </>
          )}
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        {script.scenes.map((scene, index) => (
          <div key={index} className="relative pl-16 space-y-3" data-testid={`scene-${index}`}>
            {/* Time Code */}
            <div className="absolute left-0 top-0">
              <Badge variant="secondary" className="font-mono text-xs">
                {formatTime(scene.timeStart)}-{formatTime(scene.timeEnd)}
              </Badge>
            </div>

            {/* Scene Content */}
            <div className="space-y-2 rounded-lg border bg-card p-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary">VISUAL</p>
                <p className="text-sm">{scene.visual}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary">VOICE-OVER</p>
                <p className="text-sm font-medium">{scene.voiceOver}</p>
              </div>

              {scene.onScreenText && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary">ON-SCREEN TEXT</p>
                  <p className="text-sm italic">{scene.onScreenText}</p>
                </div>
              )}

              {scene.audioCue && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary">AUDIO CUE</p>
                  <p className="text-sm">{scene.audioCue}</p>
                </div>
              )}

              {scene.transition && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary">TRANSITION</p>
                  <p className="text-sm">{scene.transition}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
