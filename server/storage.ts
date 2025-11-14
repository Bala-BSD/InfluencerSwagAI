import { 
  ContentProject, 
  InsertContentProject, 
  ContentPackage,
  Script,
  HashtagStrategy 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createContentProject(project: InsertContentProject): Promise<ContentProject>;
  getContentProject(id: string): Promise<ContentProject | undefined>;
  getAllProjects(): Promise<ContentProject[]>;
  updateProject(id: string, updates: Partial<InsertContentProject>): Promise<ContentProject | undefined>;
  deleteProject(id: string): Promise<void>;
  saveContentPackage(projectId: string, packageData: ContentPackage): Promise<void>;
  getContentPackage(projectId: string): Promise<ContentPackage | undefined>;
  getCurrentPackage(): Promise<ContentPackage | undefined>;
  saveScript(ideaId: string, duration: string, script: Script, projectId: string): Promise<void>;
  getScript(ideaId: string, duration: string): Promise<Script | undefined>;
  saveHashtags(ideaId: string, hashtags: HashtagStrategy, projectId: string): Promise<void>;
  getHashtags(ideaId: string): Promise<HashtagStrategy | undefined>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, ContentProject>;
  private packages: Map<string, ContentPackage>;
  private currentPackage: ContentPackage | undefined;
  private scripts: Map<string, Script>;
  private hashtags: Map<string, HashtagStrategy>;

  constructor() {
    this.projects = new Map();
    this.packages = new Map();
    this.scripts = new Map();
    this.hashtags = new Map();
  }

  async createContentProject(insertProject: InsertContentProject): Promise<ContentProject> {
    const id = randomUUID();
    const project: ContentProject = { 
      ...insertProject,
      campaignObjective: insertProject.campaignObjective as any,
      contentStyle: insertProject.contentStyle as any,
      id,
      createdAt: new Date().toISOString(),
    };
    this.projects.set(id, project);
    return project;
  }

  async getContentProject(id: string): Promise<ContentProject | undefined> {
    return this.projects.get(id);
  }

  async saveContentPackage(projectId: string, packageData: ContentPackage): Promise<void> {
    this.packages.set(projectId, packageData);
    this.currentPackage = packageData;
  }

  async getContentPackage(projectId: string): Promise<ContentPackage | undefined> {
    return this.packages.get(projectId);
  }

  async getCurrentPackage(): Promise<ContentPackage | undefined> {
    return this.currentPackage;
  }

  async saveScript(ideaId: string, duration: string, script: Script, projectId: string): Promise<void> {
    const key = `${ideaId}-${duration}`;
    this.scripts.set(key, script);
  }

  async getScript(ideaId: string, duration: string): Promise<Script | undefined> {
    const key = `${ideaId}-${duration}`;
    return this.scripts.get(key);
  }

  async saveHashtags(ideaId: string, hashtags: HashtagStrategy, projectId: string): Promise<void> {
    this.hashtags.set(ideaId, hashtags);
  }

  async getHashtags(ideaId: string): Promise<HashtagStrategy | undefined> {
    return this.hashtags.get(ideaId);
  }

  async getAllProjects(): Promise<ContentProject[]> {
    return Array.from(this.projects.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateProject(id: string, updates: Partial<InsertContentProject>): Promise<ContentProject | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated = { 
      ...project, 
      ...updates,
      campaignObjective: (updates.campaignObjective || project.campaignObjective) as any,
      contentStyle: (updates.contentStyle || project.contentStyle) as any,
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
    this.packages.delete(id);
  }
}

// Export MemStorage for backward compatibility or testing
export const memStorage = new MemStorage();

// Use DatabaseStorage as default (imported and re-exported from db-storage)
import { storage as dbStorage } from './db-storage';
export const storage = dbStorage;
