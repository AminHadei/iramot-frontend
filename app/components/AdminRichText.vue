<script setup lang="ts">
import type Quill from "quill";
import { resolveContentFile } from "~/utils/mediaUrl";

const model = defineModel<string>({ required: true });

const props = defineProps<{
  id: string;
  invalid?: boolean;
  urlPrompt: string;
}>();

const host = ref<HTMLElement | null>(null);
const auth = useAuth();
const runtime = useRuntimeConfig();
let editor: Quill | null = null;

const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "link", "image"],
  [{ align: [] }, { direction: "rtl" }],
  ["clean"],
];

function canonical(html: string) {
  const value = html
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
  if (
    !value ||
    value === "<p><br></p>" ||
    value === "<p></p>" ||
    value === "<p> </p>"
  ) {
    return "";
  }
  return value;
}

function writeModel() {
  if (!editor) return;
  const next = canonical(editor.getSemanticHTML());
  if (next !== model.value) model.value = next;
}

function readModel() {
  if (!editor) return;
  const next = model.value || "";
  if (canonical(editor.getSemanticHTML()) === canonical(next)) return;
  const delta = editor.clipboard.convert({ html: next || "<p><br></p>" });
  editor.setContents(delta, "silent");
}

async function insertImage(file: File) {
  if (!editor) return;
  let url = "";
  try {
    const form = new FormData();
    form.set("file", file);
    const uploaded = await auth
      .api()
      .request<{ url?: string; path?: string }>("/admin/media", {
        method: "POST",
        body: form,
      });
    const raw = uploaded.url || uploaded.path || "";
    url =
      resolveContentFile(raw, {
        apiBase: runtime.public.apiBase,
        siteBase: runtime.app.baseURL,
      }) ?? raw;
  } catch {
    url = window.prompt(props.urlPrompt)?.trim() ?? "";
  }
  if (!url) return;
  const index = editor.getSelection(true)?.index ?? editor.getLength();
  editor.insertEmbed(index, "image", url, "user");
  writeModel();
}

function pickImage() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) void insertImage(file);
  });
  input.click();
}

const EDITOR_CSS = `
.admin-rich-text {
  border: 1px solid #2b2b33;
  background-color: #fffdf5;
  color: #2b2b33;
}
.admin-rich-text:focus-within {
  border-color: #2d317a;
}
.admin-rich-text .ql-toolbar.ql-snow {
  direction: rtl;
  border: 0;
  border-block-end: 1px solid #2b2b33;
  background: transparent;
  font-family: IRANYekan, Tahoma, sans-serif;
}
.admin-rich-text .ql-toolbar.ql-snow .ql-formats {
  display: inline-block;
  margin: 0;
  margin-inline-end: 15px;
  float: inline-start;
}
.admin-rich-text .ql-toolbar.ql-snow button,
.admin-rich-text .ql-toolbar.ql-snow .ql-picker {
  float: inline-start;
}
.admin-rich-text .ql-container.ql-snow {
  border: 0;
  font-family: IRANYekan, Tahoma, sans-serif;
}
.admin-rich-text .ql-editor {
  min-height: 10rem;
  direction: rtl;
  text-align: start;
  font-family: IRANYekan, Tahoma, sans-serif;
  font-size: 1rem;
  line-height: 1.7;
  padding: 0.75rem;
}
.admin-rich-text .ql-editor.ql-blank::before {
  inset-inline-start: 0.75rem;
  inset-inline-end: auto;
  text-align: start;
  font-style: normal;
  font-family: IRANYekan, Tahoma, sans-serif;
}
`;

function ensureEditorStyles() {
  if (document.getElementById("admin-rich-text-styles")) return;
  const style = document.createElement("style");
  style.id = "admin-rich-text-styles";
  style.textContent = EDITOR_CSS;
  document.head.appendChild(style);
}

onMounted(async () => {
  if (!host.value) return;
  const [{ default: QuillCtor }] = await Promise.all([
    import("quill"),
    import("quill/dist/quill.snow.css"),
  ]);
  ensureEditorStyles();
  editor = new QuillCtor(host.value, {
    theme: "snow",
    modules: { toolbar: TOOLBAR },
  });
  editor.root.setAttribute("dir", "rtl");
  editor.root.id = props.id;
  const toolbar = editor.getModule("toolbar") as {
    container?: HTMLElement | null;
    addHandler: (name: string, fn: () => void) => void;
  };
  toolbar.container?.setAttribute("dir", "rtl");
  toolbar.addHandler("image", pickImage);
  editor.on("text-change", (_delta, _old, source) => {
    if (source !== "user") return;
    writeModel();
  });
  readModel();
});

watch(() => model.value, readModel);
</script>

<template>
  <div class="admin-rich-text" :class="{ 'admin-rich-text--invalid': invalid }">
    <div ref="host" />
  </div>
</template>
