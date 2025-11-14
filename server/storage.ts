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
  saveContentPackage(projectId: string, packageData: ContentPackage): Promise<void>;
  getContentPackage(projectId: string): Promise<ContentPackage | undefined>;
  getCurrentPackage(): Promise<ContentPackage | undefined>;
  saveScript(ideaId: string, duration: string, script: Script): Promise<void>;
  getScript(ideaId: string, duration: string): Promise<Script | undefined>;
  saveHashtags(ideaId: string, hashtags: HashtagStrategy): Promise<void>;
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

  async saveScript(ideaId: string, duration: string, script: Script): Promise<void> {
    const key = `${ideaId}-${duration}`;
    this.scripts.set(key, script);
  }

  async getScript(ideaId: string, duration: string): Promise<Script | undefined> {
    const key = `${ideaId}-${duration}`;
    return this.scripts.get(key);
  }

  async saveHashtags(ideaId: string, hashtags: HashtagStrategy): Promise<void> {
    this.hashtags.set(ideaId, hashtags);
  }

  async getHashtags(ideaId: string): Promise<HashtagStrategy | undefined> {
    return this.hashtags.get(ideaId);
  }
}

export const storage = new MemStorage();
