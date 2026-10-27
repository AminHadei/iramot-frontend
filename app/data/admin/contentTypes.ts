export type FieldKind =
  | "text"
  | "textarea"
  | "html"
  | "number"
  | "date"
  | "slug"
  | "status"
  | "media"
  | "boolean"
  | "json";

export interface ContentField {
  key: string;
  kind: FieldKind;
  required?: boolean;
}

export interface ContentTypeConfig {
  type: string;
  singleton: boolean;
  path: string;
  fields: ContentField[];
}

const article: ContentField[] = [
  { key: "title", kind: "text", required: true },
  { key: "slug", kind: "slug", required: true },
  { key: "excerpt", kind: "textarea" },
  { key: "body", kind: "html" },
  { key: "date", kind: "date" },
  { key: "status", kind: "status" },
  { key: "order", kind: "number" },
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
  return { type, singleton: true, path, fields };
}

const documentFields: ContentField[] = [
  { key: "title", kind: "text" },
  { key: "body", kind: "html" },
  { key: "image", kind: "media" },
  { key: "document", kind: "json" },
];

export const contentTypeConfigs: ContentTypeConfig[] = [
  collection("news"),
  collection("events"),
  collection("opportunities"),
  collection("partners"),
  collection("quarterlies"),
  collection("terms"),
  collection("workgroups"),
  collection("projects"),
  collection("areas", [
    { key: "title", kind: "text", required: true },
    { key: "slug", kind: "slug" },
    { key: "question", kind: "textarea", required: true },
    { key: "to", kind: "text" },
    { key: "status", kind: "status" },
    { key: "order", kind: "number" },
  ]),
  collection("research"),
  collection("guides", [
    { key: "title", kind: "text", required: true },
    { key: "slug", kind: "slug", required: true },
    { key: "description", kind: "textarea" },
    { key: "body", kind: "html" },
    { key: "status", kind: "status" },
    { key: "order", kind: "number" },
  ]),
  collection("pages"),
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
