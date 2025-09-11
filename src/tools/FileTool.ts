// src/tools/FileTool.ts
// Minimal custom Tool that shows a file card (title + size, open/delete)
// Works without backend using blob URLs via <input type="file" />.

type FileData = { title?: string; href?: string; size?: string };

export default class FileTool {
  static get toolbox() {
    return {
      title: "File",
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
    };
  }

  private data: FileData;
  private wrapper!: HTMLElement;

  constructor({ data }: { data: FileData }) {
    this.data = data || {};
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.className = "file-block";

    const card = document.createElement("div");
    card.className = "file-card";

    const icon = document.createElement("div");
    icon.className = "file-icon";
    icon.textContent = "📄";

    const meta = document.createElement("div");
    meta.className = "file-meta";

    const title = document.createElement("div");
    title.className = "file-title";
    title.textContent = this.data.title || "My file";

    const size = document.createElement("div");
    size.className = "file-size";
    size.textContent = this.data.size || "";

    const actions = document.createElement("div");
    actions.className = "file-actions";

    const openBtn = document.createElement("button");
    openBtn.textContent = "Open";
    openBtn.onclick = () => {
      if (this.data.href) window.open(this.data.href, "_blank");
    };

    const replaceBtn = document.createElement("button");
    replaceBtn.textContent = this.data.href ? "Replace" : "Pick file";
    replaceBtn.onclick = () => this.pick();

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => this.wrapper.remove();

    actions.append(openBtn, replaceBtn, deleteBtn);
    meta.append(title, size);
    card.append(icon, meta, actions);
    this.wrapper.append(card);

    return this.wrapper;
  }

  save(blockContent: HTMLElement): FileData {
    // read back from DOM (simple)
    const t =
      blockContent.querySelector(".file-title")?.textContent || "My file";
    const s = blockContent.querySelector(".file-size")?.textContent || "";
    return { title: t, size: s, href: this.data.href };
  }

  validate(data: FileData) {
    return !!data.title;
  }

  static get isReadOnlySupported() {
    return true;
  }

  private pick() {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const href = URL.createObjectURL(file);
      const size = human(file.size);
      this.data = { title: file.name, href, size };
      // rerender simple DOM bits
      const titleEl = this.wrapper.querySelector(".file-title")!;
      const sizeEl = this.wrapper.querySelector(".file-size")!;
      titleEl.textContent = file.name;
      sizeEl.textContent = size;
    };
    input.click();
  }
}

function human(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
