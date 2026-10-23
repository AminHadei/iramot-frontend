export type OpportunityType = "research" | "job";

export interface OpportunityImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface OpportunityRecord {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  organization?: string | null;
  type?: OpportunityType | null;
  image?: OpportunityImage | null;
  deadline?: string | null;
  publishedAt: string;
  sample?: boolean;
}

export interface OpportunityFile {
  items: OpportunityRecord[];
}

export interface Opportunity {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  sample?: boolean;
  tone: 0 | 1 | 2;
  image?: OpportunityImage;
  description?: string;
  organization?: string;
  type?: OpportunityType;
  deadline?: string;
}

export interface OpportunityList {
  items: Opportunity[];
}

export interface OpportunityRepository {
  list(): Promise<OpportunityList>;
}
