import { generateWithRetry } from "./openrouter";
import {
  GenerateContentRequest,
  GenerateScriptRequest,
  GenerateHashtagsRequest,
  ContentIdea,
  TrendInsights,
  Script,
  HashtagStrategy,
} from "@shared/schema";
import { randomUUID } from "crypto";

export class AIContentService {
  // Generate 30+ content ideas using combinatorial creativity
  async generateContentIdeas(request: GenerateContentRequest, projectId: string): Promise<ContentIdea[]> {
    const prompt = `ACT AS CONTENT STRATEGIST AND CREATIVE DIRECTOR:

OBJECTIVE: ${request.campaignObjective}
PRODUCT: ${request.productName}
DESCRIPTION: ${request.productDescription}
TARGET AUDIENCE: ${request.targetAudience}
BRAND VOICE: ${request.brandVoice}
CREATOR STYLE: ${request.contentStyle}

GENERATE 30 DIVERSE CONTENT IDEAS using combinatorial creativity:

FORMULA VARIATIONS:
1. Style + Product Scenario + Objective
2. Style + Trend Adaptation + Objective
3. Story Arc + Product Scenario + Objective

CLUSTER OUTPUT by FUNNEL STAGE:
- AWARENESS (8 ideas): Top-funnel, brand introduction
- ENGAGEMENT (8 ideas): Community-building, interaction
- CONVERSION (8 ideas): Action-oriented, sales-driving
- RETENTION (4 ideas): Loyalty-focused, repeat engagement
- TRENDING (2 ideas): High virality potential

OUTPUT FORMAT (JSON array):
[
  {
    "title": "Compelling title",
    "hook": "3-5 second attention-grabbing hook",
    "angle": "Unique perspective or approach",
    "funnelStage": "awareness|engagement|conversion|retention|trending",
    "category": "Brief category label",
    "description": "One sentence description"
  }
]

Return ONLY valid JSON array with exactly 30 ideas. No markdown, no explanations.`;

    try {
      const response = await generateWithRetry(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid JSON response");
      
      const ideas = JSON.parse(jsonMatch[0]);
      return ideas.map((idea: any) => ({
        id: randomUUID(),
        projectId,
        title: idea.title,
        hook: idea.hook,
        angle: idea.angle,
        funnelStage: idea.funnelStage,
        category: idea.category || "General",
        description: idea.description || idea.hook,
      }));
    } catch (error) {
      console.error("Error generating content ideas:", error);
      throw new Error("Failed to generate content ideas");
    }
  }

  // Generate trend insights
  async generateTrendInsights(request: GenerateContentRequest): Promise<TrendInsights> {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const prompt = `ACT AS TREND FORECASTING ANALYST for ${request.targetAudience} interested in ${request.productName}.
Current date: ${currentDate}

BASED ON YOUR TRAINING DATA and pattern recognition:

1. PREDICT 3 emerging content formats for next week (be specific about format/structure)
2. IDENTIFY 2 viral narrative frameworks that work well for ${request.campaignObjective}
3. SUGGEST 5 trending audio styles or sound trends
4. ANALYZE seasonal relevance for ${request.productDescription}

OUTPUT FORMAT (JSON):
{
  "emergingFormats": ["format1", "format2", "format3"],
  "viralNarratives": ["narrative1", "narrative2"],
  "audioStyles": ["audio1", "audio2", "audio3", "audio4", "audio5"],
  "seasonalRelevance": "2-3 sentence seasonal analysis"
}

Return ONLY valid JSON. No markdown, no explanations.`;

    try {
      const response = await generateWithRetry(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid JSON response");
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error generating trend insights:", error);
      // Return fallback data
      return {
        emergingFormats: [
          "Behind-the-scenes process reveals",
          "Quick-transition product demos",
          "User testimonial compilations"
        ],
        viralNarratives: [
          "Problem → Discovery → Transformation journey",
          "Unexpected solution to common frustration"
        ],
        audioStyles: [
          "Upbeat trending audio",
          "Authentic voiceover (no music)",
          "Nostalgic throwback tracks",
          "ASMR product sounds",
          "Motivational soundtracks"
        ],
        seasonalRelevance: "Current season presents opportunities for lifestyle-focused content that emphasizes daily routines and personal improvement themes."
      };
    }
  }

  // Generate time-coded script
  async generateScript(request: GenerateScriptRequest): Promise<Script> {
    const duration = parseInt(request.duration);
    
    const prompt = `ACT AS VIDEO DIRECTOR AND SCRIPTWRITER:

CONTENT IDEA: ${request.ideaTitle}
HOOK: ${request.ideaHook}
ANGLE: ${request.ideaAngle}
PRODUCT: ${request.productName}
DURATION: ${duration} seconds
STYLE: ${request.contentStyle}

CREATE TIME-CODED SCRIPT with precise timing breakdown:
- Hook: ${Math.floor(duration * 0.10)}s (0-${Math.floor(duration * 0.10)}s)
- Problem/Setup: ${Math.floor(duration * 0.20)}s
- Solution/Product: ${Math.floor(duration * 0.50)}s
- CTA: ${Math.floor(duration * 0.12)}s
- Branding: ${Math.floor(duration * 0.08)}s

For EACH scene, provide:
1. Time range (start-end)
2. VISUAL description (camera angle, action, what viewer sees)
3. VOICE-OVER script (exact words spoken)
4. ON-SCREEN TEXT (optional, text overlays)
5. AUDIO CUE (music/sound effects)
6. TRANSITION (how to move to next scene)

OUTPUT FORMAT (JSON):
{
  "scenes": [
    {
      "timeStart": 0,
      "timeEnd": 3,
      "visual": "Extreme close-up of frustrated face, camera slowly pulls back",
      "voiceOver": "I was SO done with this problem...",
      "onScreenText": "The Daily Struggle",
      "audioCue": "Dramatic pause, then upbeat music starts",
      "transition": "Quick snap zoom"
    }
  ]
}

Create ${duration === 15 ? '3-4' : duration === 30 ? '5-6' : '8-10'} scenes. Return ONLY valid JSON.`;

    try {
      const response = await generateWithRetry(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid JSON response");
      
      const scriptData = JSON.parse(jsonMatch[0]);
      return {
        id: randomUUID(),
        ideaId: request.ideaId,
        duration: request.duration,
        scenes: scriptData.scenes,
      };
    } catch (error) {
      console.error("Error generating script:", error);
      throw new Error("Failed to generate script");
    }
  }

  // Generate hashtag strategy
  async generateHashtags(request: GenerateHashtagsRequest): Promise<HashtagStrategy> {
    const prompt = `ACT AS HASHTAG STRATEGIST:

CONTENT IDEA: ${request.ideaTitle}
PRODUCT: ${request.productName}
FUNNEL STAGE: ${request.funnelStage}

GENERATE COMPREHENSIVE HASHTAG STRATEGY:

1. BRANDED HASHTAGS (2-3): Your brand-specific hashtags
2. BROAD REACH HASHTAGS (4-5): High-volume, general discovery
3. NICHE SPECIFIC HASHTAGS (5-6): Targeted to specific audience/interest
4. FORMAT CONTEXT HASHTAGS (3-4): Video format and platform specific

RULES:
- All hashtags must start with #
- Mix of popular and niche hashtags
- Consider platform algorithm preferences
- Optimize for ${request.funnelStage} funnel stage

OUTPUT FORMAT (JSON):
{
  "branded": ["#BrandName", "#BrandTagline"],
  "broadReach": ["#Lifestyle", "#Viral", "#Trending", "#ForYou"],
  "nicheSpecific": ["#SpecificAudience", "#NicheInterest", "#TargetedTopic"],
  "formatContext": ["#Reels", "#ContentType", "#VideoFormat"]
}

Return ONLY valid JSON. No markdown.`;

    try {
      const response = await generateWithRetry(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid JSON response");
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error generating hashtags:", error);
      // Return fallback hashtags
      const productTag = request.productName.replace(/\s+/g, '');
      return {
        branded: [`#${productTag}`, `#${productTag}Life`],
        broadReach: ["#ViralContent", "#TrendingNow", "#ForYou", "#Discover"],
        nicheSpecific: ["#LifestyleContent", "#DailyRoutine", "#ProductReview", "#MustHave", "#GameChanger"],
        formatContext: ["#Reels", "#ShortForm", "#VideoContent"],
      };
    }
  }
}

export const aiService = new AIContentService();
