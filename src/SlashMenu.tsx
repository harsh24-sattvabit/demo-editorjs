// src/SlashMenu.tsx
import { useEffect, useMemo, useRef, useState } from "react";

export default function SlashMenu({
  holderId,
  getEditor,
}: {
  holderId: string;
  getEditor: () => any;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [pos, setPos] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const editor = getEditor();

  const items = useMemo(
    () => [
      {
        label: "Header 1",
        run: () => editor?.blocks.insert("header", { level: 1 }),
      },
      {
        label: "Header 2",
        run: () => editor?.blocks.insert("header", { level: 2 }),
      },
      {
        label: "Header 3",
        run: () => editor?.blocks.insert("header", { level: 3 }),
      },
      {
        label: "Bulleted List",
        run: () => editor?.blocks.insert("list", { style: "unordered" }),
      },
      {
        label: "Numbered List",
        run: () => editor?.blocks.insert("list", { style: "ordered" }),
      },
      {
        label: "Checklist",
        run: () =>
          editor?.blocks.insert("checklist", {
            items: [{ text: "Task", checked: false }],
          }),
      },
      {
        label: "Table",
        run: () => editor?.blocks.insert("table", { rows: 3, cols: 3 }),
      },
      { label: "Image (pick)", run: () => pickImage(editor) },
      { label: "File", run: () => editor?.blocks.insert("file", {}) },
      { label: "Paragraph", run: () => editor?.blocks.insert("paragraph", {}) },
    ],
    [editor]
  );

  useEffect(() => {
    const holder = document.getElementById(holderId);
    if (!holder) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setTimeout(() => {
          const r = getCaretRect();
          if (r)
            setPos({
              left: r.left + window.scrollX,
              top: r.bottom + window.scrollY + 6,
            });
          setOpen(true);
          setQ("");
          setTimeout(() => inputRef.current?.focus(), 0);
        }, 0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    holder.addEventListener("keydown", onKeyDown);
    const onDocClick = (ev: MouseEvent) => {
      if (!(ev.target as HTMLElement).closest(".slash-pop")) setOpen(false);
    };
    document.addEventListener("click", onDocClick);

    return () => {
      holder.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onDocClick);
    };
  }, [holderId]);

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(q.toLowerCase())
  );

  if (!open) return null;

  return (
    <div
      className="slash-pop"
      style={{ position: "absolute", left: pos.left, top: pos.top, zIndex: 50 }}
    >
      <input
        ref={inputRef}
        className="slash-input"
        placeholder="Filter"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="slash-list">
        {filtered.map((it, i) => (
          <button
            key={i}
            className="slash-item"
            onClick={() => {
              it.run();
              setOpen(false);
            }}
          >
            {it.label}
          </button>
        ))}
        {filtered.length === 0 && <div className="slash-empty">No matches</div>}
      </div>
    </div>
  );
}

function pickImage(editor: any) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    editor.blocks.insert("image", { file: { url } });
  };
  input.click();
}

function getCaretRect(): DOMRect | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0).cloneRange();
  if ((range as any).getClientRects) {
    range.collapse(true);
    const rects = range.getClientRects();
    if (rects.length > 0) return rects[0];
  }
  return null;
}
