import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Hash } from "lucide-react";
import { HashtagStrategy } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface HashtagStrategyDisplayProps {
  strategy: HashtagStrategy;
}

export function HashtagStrategyDisplay({ strategy }: HashtagStrategyDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (hashtags: string[], section: string) => {
    const text = hashtags.join(' ');
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast({
      title: "Copied to clipboard",
      description: `${section} hashtags copied`,
    });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const allHashtags = [
    ...strategy.branded,
    ...strategy.broadReach,
    ...strategy.nicheSpecific,
    ...strategy.formatContext,
  ];

  const categories = [
    { title: "Branded", hashtags: strategy.branded, color: "bg-primary/10 text-primary border-primary/20" },
    { title: "Broad Reach", hashtags: strategy.broadReach, color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
    { title: "Niche Specific", hashtags: strategy.nicheSpecific, color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" },
    { title: "Format Context", hashtags: strategy.formatContext, color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" },
  ];

  return (
    <Card className="p-6 space-y-6" data-testid="card-hashtag-strategy">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Hash className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Hashtag Strategy</h3>
            <p className="text-sm text-muted-foreground">{allHashtags.length} hashtags total</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => copyToClipboard(allHashtags, "All")}
          data-testid="button-copy-all-hashtags"
        >
          {copiedSection === "All" ? (
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

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <div key={category.title} className="space-y-3" data-testid={`hashtag-category-${category.title.toLowerCase().replace(' ', '-')}`}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{category.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2"
                onClick={() => copyToClipboard(category.hashtags, category.title)}
                data-testid={`button-copy-${category.title.toLowerCase().replace(' ', '-')}`}
              >
                {copiedSection === category.title ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span className="text-xs">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.hashtags.map((hashtag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={category.color}
                  data-testid={`badge-hashtag-${hashtag.replace('#', '')}`}
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
