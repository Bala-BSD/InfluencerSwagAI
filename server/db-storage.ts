import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { eq, and, desc } from 'drizzle-orm';
import {
  contentProjects,
  contentPackages,
  scripts,
  hashtagStrategies,
  userPreferences,
  contentVariants,
  calendarEntries,
  competitorAnalyses,
  ContentProject,
  InsertContentProject,
  ContentPackage,
  Script,
  HashtagStrategy,
} from '@shared/schema';
import type { IStorage } from './storage';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  async createContentProject(insertProject: InsertContentProject): Promise<ContentProject> {
    const [project] = await db.insert(contentProjects).values(insertProject).returning();
    return {
      ...project,
      campaignObjective: project.campaignObjective as any,
      contentStyle: project.contentStyle as any,
      createdAt: project.createdAt.toISOString(),
    };
  }

  async getContentProject(id: string): Promise<ContentProject | undefined> {
    const [project] = await db.select().from(contentProjects).where(eq(contentProjects.id, id));
    if (!project) return undefined;
    return {
      ...project,
      campaignObjective: project.campaignObjective as any,
      contentStyle: project.contentStyle as any,
      createdAt: project.createdAt.toISOString(),
    };
  }

  async getAllProjects(): Promise<ContentProject[]> {
    const projects = await db.select().from(contentProjects).orderBy(desc(contentProjects.createdAt));
    return projects.map(p => ({
      ...p,
      campaignObjective: p.campaignObjective as any,
      contentStyle: p.contentStyle as any,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  async saveContentPackage(projectId: string, packageData: ContentPackage): Promise<void> {
    const existing = await db.select().from(contentPackages).where(eq(contentPackages.projectId, projectId));
    
    if (existing.length > 0) {
      await db.update(contentPackages)
        .set({
          ideas: packageData.ideas as any,
          trendInsights: packageData.trendInsights as any,
        })
        .where(eq(contentPackages.projectId, projectId));
    } else {
      await db.insert(contentPackages).values({
        projectId,
        ideas: packageData.ideas as any,
        trendInsights: packageData.trendInsights as any,
      });
    }
  }

  async getContentPackage(projectId: string): Promise<ContentPackage | undefined> {
    const [pkg] = await db.select().from(contentPackages).where(eq(contentPackages.projectId, projectId));
    if (!pkg) return undefined;

    const [project] = await db.select().from(contentProjects).where(eq(contentProjects.id, projectId));
    if (!project) return undefined;

    return {
      project: {
        ...project,
        campaignObjective: project.campaignObjective as any,
        contentStyle: project.contentStyle as any,
        createdAt: project.createdAt.toISOString(),
      },
      ideas: pkg.ideas as any,
      trendInsights: pkg.trendInsights as any,
    };
  }

  async getCurrentPackage(): Promise<ContentPackage | undefined> {
    const [pkg] = await db.select().from(contentPackages).orderBy(desc(contentPackages.createdAt)).limit(1);
    if (!pkg) return undefined;

    const [project] = await db.select().from(contentProjects).where(eq(contentProjects.id, pkg.projectId));
    if (!project) return undefined;

    return {
      project: {
        ...project,
        campaignObjective: project.campaignObjective as any,
        contentStyle: project.contentStyle as any,
        createdAt: project.createdAt.toISOString(),
      },
      ideas: pkg.ideas as any,
      trendInsights: pkg.trendInsights as any,
    };
  }

  async saveScript(ideaId: string, duration: string, script: Script, projectId: string): Promise<void> {
    const existing = await db.select()
      .from(scripts)
      .where(and(
        eq(scripts.ideaId, ideaId),
        eq(scripts.duration, duration)
      ));

    if (existing.length > 0) {
      await db.update(scripts)
        .set({ scenes: script.scenes as any })
        .where(and(
          eq(scripts.ideaId, ideaId),
          eq(scripts.duration, duration)
        ));
    } else {
      await db.insert(scripts).values({
        ideaId,
        projectId,
        duration,
        scenes: script.scenes as any,
      });
    }
  }

  async getScript(ideaId: string, duration: string): Promise<Script | undefined> {
    const [result] = await db.select()
      .from(scripts)
      .where(and(
        eq(scripts.ideaId, ideaId),
        eq(scripts.duration, duration)
      ));

    if (!result) return undefined;

    return {
      id: result.id,
      ideaId: result.ideaId,
      duration: duration as '15' | '30' | '60',
      scenes: result.scenes as any,
    };
  }

  async saveHashtags(ideaId: string, hashtags: HashtagStrategy, projectId: string): Promise<void> {
    const existing = await db.select()
      .from(hashtagStrategies)
      .where(eq(hashtagStrategies.ideaId, ideaId));

    if (existing.length > 0) {
      await db.update(hashtagStrategies)
        .set({
          branded: hashtags.branded as any,
          broadReach: hashtags.broadReach as any,
          nicheSpecific: hashtags.nicheSpecific as any,
          formatContext: hashtags.formatContext as any,
        })
        .where(eq(hashtagStrategies.ideaId, ideaId));
    } else {
      await db.insert(hashtagStrategies).values({
        ideaId,
        projectId,
        branded: hashtags.branded as any,
        broadReach: hashtags.broadReach as any,
        nicheSpecific: hashtags.nicheSpecific as any,
        formatContext: hashtags.formatContext as any,
      });
    }
  }

  async getHashtags(ideaId: string): Promise<HashtagStrategy | undefined> {
    const [result] = await db.select()
      .from(hashtagStrategies)
      .where(eq(hashtagStrategies.ideaId, ideaId));

    if (!result) return undefined;

    return {
      branded: result.branded as string[],
      broadReach: result.broadReach as string[],
      nicheSpecific: result.nicheSpecific as string[],
      formatContext: result.formatContext as string[],
    };
  }

  // New methods for multi-project support
  async updateProject(id: string, updates: Partial<InsertContentProject>): Promise<ContentProject | undefined> {
    const [updated] = await db.update(contentProjects)
      .set(updates)
      .where(eq(contentProjects.id, id))
      .returning();
    
    if (!updated) return undefined;
    
    return {
      ...updated,
      campaignObjective: updated.campaignObjective as any,
      contentStyle: updated.contentStyle as any,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteProject(id: string): Promise<void> {
    // Cascade delete all related records
    await db.delete(calendarEntries).where(eq(calendarEntries.projectId, id));
    await db.delete(contentVariants).where(eq(contentVariants.projectId, id));
    await db.delete(competitorAnalyses).where(eq(competitorAnalyses.projectId, id));
    await db.delete(hashtagStrategies).where(eq(hashtagStrategies.projectId, id));
    await db.delete(scripts).where(eq(scripts.projectId, id));
    await db.delete(contentPackages).where(eq(contentPackages.projectId, id));
    await db.delete(contentProjects).where(eq(contentProjects.id, id));
  }
}

export const storage = new DatabaseStorage();
