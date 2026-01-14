export interface Chapter {
  id: string;
  name: string;
  path: string;
  act?: string;
  description?: string;
}

export interface ContentStructure {
  acts: Act[];
  chapters: Chapter[];
  appendices: Chapter[];
}

export interface Act {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface SessionNote {
  id: string;
  title: string;
  chapter: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
}

export interface SynthesizedContent {
  title: string;
  summary: string;
  keyPoints: string[];
  npcs: NPC[];
  locations: Location[];
  encounters: Encounter[];
  treasures: string[];
  notes: string;
  rawContent: string;
}

export interface NPC {
  name: string;
  description: string;
  roleplayTips?: string;
  motivations?: string;
}

export interface Location {
  name: string;
  description: string;
  features?: string[];
}

export interface Encounter {
  name: string;
  description: string;
  difficulty?: string;
  creatures?: string[];
  tactics?: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
  content?: string;
}
