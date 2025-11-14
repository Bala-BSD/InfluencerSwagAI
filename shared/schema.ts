import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Drizzle table definition for content projects (for consistency with guidelines)
export const contentProjects = pgTable("content_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  productDescription: text("product_description").notNull(),
  targetAudience: text("target_audience").notNull(),
  brandVoice: text("brand_voice").notNull(),
  campaignObjective: text("campaign_objective").notNull(),
  contentStyle: text("content_style").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content packages table (stores generated content for each project)
export const contentPackages = pgTable("content_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  ideas: jsonb("ideas").notNull(),
  trendInsights: jsonb("trend_insights").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scripts table (stores generated scripts for ideas)
export const scripts = pgTable("scripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").notNull(),
  projectId: varchar("project_id").notNull(),
  duration: varchar("duration").notNull(),
  scenes: jsonb("scenes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Hashtag strategies table
export const hashtagStrategies = pgTable("hashtag_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").notNull(),
  projectId: varchar("project_id").notNull(),
  branded: jsonb("branded").notNull(),
  broadReach: jsonb("broad_reach").notNull(),
  nicheSpecific: jsonb("niche_specific").notNull(),
  formatContext: jsonb("format_context").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User preferences table (tracks favorites and ratings)
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id"),
  scriptId: varchar("script_id"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  rating: integer("rating"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content variants table (for A/B testing)
export const contentVariants = pgTable("content_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").notNull(),
  projectId: varchar("project_id").notNull(),
  variantNumber: integer("variant_number").notNull(),
  duration: varchar("duration").notNull(),
  scenes: jsonb("scenes").notNull(),
  variantType: text("variant_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Calendar entries table (for scheduled content)
export const calendarEntries = pgTable("calendar_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  ideaId: varchar("idea_id").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  platform: text("platform"),
  status: text("status").default('planned').notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Competitor analyses table
export const competitorAnalyses = pgTable("competitor_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  competitorName: text("competitor_name").notNull(),
  contentUrl: text("content_url"),
  description: text("description").notNull(),
  insights: jsonb("insights").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content Project Schema
export const contentProjectSchema = z.object({
  id: z.string(),
  productName: z.string(),
  productDescription: z.string(),
  targetAudience: z.string(),
  brandVoice: z.string(),
  campaignObjective: z.enum(['awareness', 'engagement', 'conversion', 'retention']),
  contentStyle: z.enum(['relatable_peer', 'expert_authority', 'aspirational_leader', 'problem_solver', 'entertainer', 'educator']),
  createdAt: z.string(),
});

export const insertContentProjectSchema = createInsertSchema(contentProjects).omit({ id: true, createdAt: true });

export type ContentProject = z.infer<typeof contentProjectSchema>;
export type InsertContentProject = z.infer<typeof insertContentProjectSchema>;

// Content Idea Schema
export const contentIdeaSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  hook: z.string(),
  angle: z.string(),
  funnelStage: z.enum(['awareness', 'engagement', 'conversion', 'retention', 'trending']),
  category: z.string(),
  description: z.string(),
});

export type ContentIdea = z.infer<typeof contentIdeaSchema>;

// Script Schema
export const scriptSchema = z.object({
  id: z.string(),
  ideaId: z.string(),
  duration: z.enum(['15', '30', '60']),
  scenes: z.array(z.object({
    timeStart: z.number(),
    timeEnd: z.number(),
    visual: z.string(),
    voiceOver: z.string(),
    onScreenText: z.string().optional(),
    audioCue: z.string().optional(),
    transition: z.string().optional(),
  })),
});

export type Script = z.infer<typeof scriptSchema>;

// Hashtag Strategy Schema
export const hashtagStrategySchema = z.object({
  branded: z.array(z.string()),
  broadReach: z.array(z.string()),
  nicheSpecific: z.array(z.string()),
  formatContext: z.array(z.string()),
});

export type HashtagStrategy = z.infer<typeof hashtagStrategySchema>;

// Trend Insights Schema
export const trendInsightsSchema = z.object({
  emergingFormats: z.array(z.string()),
  viralNarratives: z.array(z.string()),
  audioStyles: z.array(z.string()),
  seasonalRelevance: z.string(),
});

export type TrendInsights = z.infer<typeof trendInsightsSchema>;

// Performance Prediction Schema
export const performancePredictionSchema = z.object({
  viewDuration: z.object({
    min: z.number(),
    max: z.number(),
  }),
  engagementRate: z.object({
    min: z.number(),
    max: z.number(),
  }),
  shareabilityScore: z.number(),
  conversionPotential: z.enum(['low', 'medium', 'high', 'very_high']),
});

export type PerformancePrediction = z.infer<typeof performancePredictionSchema>;

// Complete Content Package Schema
export const contentPackageSchema = z.object({
  project: contentProjectSchema,
  ideas: z.array(contentIdeaSchema),
  trendInsights: trendInsightsSchema,
});

export type ContentPackage = z.infer<typeof contentPackageSchema>;

// API Request/Response Schemas
export const generateContentRequestSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productDescription: z.string().min(10, "Product description must be at least 10 characters"),
  targetAudience: z.string().min(5, "Target audience description is required"),
  brandVoice: z.string().min(5, "Brand voice description is required"),
  campaignObjective: z.enum(['awareness', 'engagement', 'conversion', 'retention']),
  contentStyle: z.enum(['relatable_peer', 'expert_authority', 'aspirational_leader', 'problem_solver', 'entertainer', 'educator']),
});

export type GenerateContentRequest = z.infer<typeof generateContentRequestSchema>;

export const generateScriptRequestSchema = z.object({
  ideaId: z.string(),
  projectId: z.string(),
  ideaTitle: z.string(),
  ideaHook: z.string(),
  ideaAngle: z.string(),
  productName: z.string(),
  duration: z.enum(['15', '30', '60']),
  contentStyle: z.string(),
});

export type GenerateScriptRequest = z.infer<typeof generateScriptRequestSchema>;

export const generateHashtagsRequestSchema = z.object({
  ideaId: z.string(),
  projectId: z.string(),
  ideaTitle: z.string(),
  productName: z.string(),
  funnelStage: z.string(),
});

export type GenerateHashtagsRequest = z.infer<typeof generateHashtagsRequestSchema>;
