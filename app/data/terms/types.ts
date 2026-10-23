export interface TermSource {
  id: number;
  label: string;
}

export interface TermSummary {
  id: number;
  title: string;
  fa: string | null;
  text: string;
  sources: TermSource[];
  date: string | null;
  slug: string;
}

export interface TermListQuery {
  source?: number;
  exclude?: number[];
}

export interface TermList {
  items: TermSummary[];
  total: number;
}

export interface TermRepository {
  list(query?: TermListQuery): Promise<TermList>;
  sources(): Promise<TermSource[]>;
}

export interface TermIndexItem {
  id: number;
  slug: string;
  title: string;
  fa: string | null;
  text: string;
  sources: number[];
  date: string | null;
}

export interface TermIndexFile {
  sources: TermSource[];
  items: TermIndexItem[];
}
