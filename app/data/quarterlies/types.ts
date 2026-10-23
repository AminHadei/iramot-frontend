export interface CatalogImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Quarterly {
  id: string;
  slug: string;
  name: string;
  tone: 0 | 1 | 2;
  image?: CatalogImage;
  description?: string;
  url?: string;
}

export interface QuarterlyList {
  items: Quarterly[];
}

export interface QuarterlyRecord {
  id: string;
  slug: string;
  name: string;
  cover?: CatalogImage | null;
  description?: string | null;
  url?: string | null;
  order?: number;
}

export interface QuarterlyFile {
  items: QuarterlyRecord[];
}

export interface QuarterlyRepository {
  list(): Promise<QuarterlyList>;
}
