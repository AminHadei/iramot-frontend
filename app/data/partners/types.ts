export interface CatalogImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Partner {
  id: number;
  slug: string;
  name: string;
  tone: 0 | 1 | 2;
  image?: CatalogImage;
  description?: string;
  url?: string;
}

export interface PartnerList {
  items: Partner[];
}

export interface PartnerRecord {
  id: number;
  slug: string;
  name: string;
  logo?: CatalogImage | null;
  description?: string | null;
  url?: string | null;
  order?: number;
}

export interface PartnerFile {
  items: PartnerRecord[];
}

export interface PartnerRepository {
  list(): Promise<PartnerList>;
}
