export type FieldKind =
  | "text"
  | "textarea"
  | "html"
  | "number"
  | "date"
  | "datetime"
  | "slug"
  | "status"
  | "media"
  | "boolean"
  | "json";

export type FieldScope = "meta" | "seo" | "payload";

export interface ContentField {
  key: string;
  kind: FieldKind;
  required?: boolean;
  scope?: FieldScope;
}

export interface ContentTypeConfig {
  type: string;
  singleton: boolean;
  path: string;
  fields: ContentField[];
}

const meta: ContentField[] = [
  { key: "slug", kind: "slug", required: true, scope: "meta" },
  { key: "status", kind: "status", scope: "meta" },
  { key: "publishedAt", kind: "datetime", scope: "meta" },
  { key: "sortOrder", kind: "number", scope: "meta" },
  { key: "seoTitle", kind: "text", scope: "seo" },
  { key: "seoDescription", kind: "textarea", scope: "seo" },
  { key: "seoImage", kind: "media", scope: "seo" },
];

const article: ContentField[] = [
  ...meta,
  { key: "title", kind: "text", required: true },
  { key: "excerpt", kind: "textarea" },
  { key: "body", kind: "html" },
  { key: "date", kind: "date" },
  { key: "image", kind: "media" },
];

function collection(type: string, fields: ContentField[] = article): ContentTypeConfig {
  return {
    type,
    singleton: false,
    path: `/admin/content/${type}`,
    fields,
  };
}

function singleton(
  type: string,
  path: string,
  fields: ContentField[],
): ContentTypeConfig {
  return {
    type,
    singleton: true,
    path,
    fields: [{ key: "status", kind: "status", scope: "meta" }, ...fields],
  };
}

const documentFields: ContentField[] = [
  { key: "title", kind: "text" },
  { key: "body", kind: "html" },
  { key: "image", kind: "media" },
];

const eventFields: ContentField[] = [
  ...meta,
  { key: "title", kind: "text", required: true },
  { key: "excerpt", kind: "textarea" },
  { key: "body", kind: "html" },
  { key: "program", kind: "text", required: true },
  { key: "startsAt", kind: "datetime" },
  { key: "location", kind: "text" },
];

export const contentTypeConfigs: ContentTypeConfig[] = [
  collection("news"),
  collection("news-category", [
    ...meta,
    { key: "name", kind: "text", required: true },
    { key: "description", kind: "textarea" },
  ]),
  collection("news-tag", [...meta, { key: "name", kind: "text", required: true }]),
  collection("event", eventFields),
  collection("opportunity"),
  collection("quarterly"),
  collection("partner"),
  collection("workgroup"),
  collection("term"),
  collection("term-source", [...meta, { key: "name", kind: "text", required: true }]),
  collection("project"),
  collection("area", [
    ...meta,
    { key: "title", kind: "text", required: true },
    { key: "question", kind: "textarea", required: true },
    { key: "to", kind: "text" },
  ]),
  collection("research"),
  collection("guide", [
    ...meta,
    { key: "title", kind: "text", required: true },
    { key: "description", kind: "textarea" },
    { key: "body", kind: "html" },
  ]),
  collection("page"),
  singleton("settings", "/admin/settings", documentFields),
  singleton("home", "/admin/home", documentFields),
  singleton("about", "/admin/about", documentFields),
  singleton("conference", "/admin/conference", documentFields),
  singleton("award", "/admin/award", documentFields),
  singleton("workgroup-section", "/admin/workgroups/section", [
    { key: "title", kind: "text", required: true },
    { key: "description", kind: "textarea" },
    { key: "body", kind: "html" },
  ]),
];

export function contentTypeConfig(type: string): ContentTypeConfig | undefined {
  return contentTypeConfigs.find((item) => item.type === type);
}
