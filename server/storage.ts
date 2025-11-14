import { 
  ContentProject, 
  InsertContentProject, 
  ContentPackage 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createContentProject(project: InsertContentProject): Promise<ContentProject>;
  getContentProject(id: string): Promise<ContentProject | undefined>;
  saveContentPackage(projectId: string, packageData: ContentPackage): Promise<void>;
  getContentPackage(projectId: string): Promise<ContentPackage | undefined>;
  getCurrentPackage(): Promise<ContentPackage | undefined>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, ContentProject>;
  private packages: Map<string, ContentPackage>;
  private currentPackage: ContentPackage | undefined;

  constructor() {
    this.projects = new Map();
    this.packages = new Map();
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
}

export const storage = new MemStorage();
