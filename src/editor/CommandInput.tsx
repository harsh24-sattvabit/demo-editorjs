import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";

export type CommandOption = {
  id: string;
  label: string;
  keywords?: string[];
  action: (editor: Editor) => void;
  group?: "AI" | "Style" | "Insert";
  icon?: string;
};

function removeTrailingSlashQuery(editor: Editor) {
  const { state } = editor;
  const { from } = state.selection;
  const $from = state.selection.$from;
  const blockStart = $from.start();
  const textBefore = state.doc.textBetween(blockStart, from, "\n", "\n");
  const lastSlash = textBefore.lastIndexOf("/");
  if (lastSlash === -1) return;
  const hasWhitespaceAfterSlash = /\s/.test(textBefore.slice(lastSlash + 1));
  if (hasWhitespaceAfterSlash) return;
  const deleteFrom = blockStart + lastSlash;
  const deleteTo = from;
  editor.chain().focus().deleteRange({ from: deleteFrom, to: deleteTo }).run();
}

const DEFAULT_COMMANDS: CommandOption[] = [
  {
    id: "continue",
    label: "Continue Writing",
    keywords: ["ai", "continue"],
    group: "AI",
    icon: "✨",
    action: () => {},
  },
  {
    id: "askai",
    label: "Ask AI",
    keywords: ["ai", "ask"],
    group: "AI",
    icon: "🤖",
    action: () => {},
  },
  {
    id: "paragraph",
    label: "Paragraph",
    keywords: ["text", "p"],
    group: "Style",
    icon: "🅿️",
    action: (e) => e.chain().focus().setParagraph().run(),
  },
  {
    id: "h1",
    label: "Heading 1",
    keywords: ["title", "h1", "heading"],
    group: "Style",
    icon: "H1",
    action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: "h2",
    label: "Heading 2",
    keywords: ["subtitle", "h2", "heading"],
    group: "Style",
    icon: "H2",
    action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: "bulletList",
    label: "Bulleted list",
    keywords: ["list", "ul", "bullet"],
    group: "Style",
    icon: "•",
    action: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    id: "orderedList",
    label: "Numbered list",
    keywords: ["list", "ol", "number"],
    group: "Style",
    icon: "1.",
    action: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    id: "taskList",
    label: "Task list",
    keywords: ["todo", "checkbox", "tasks"],
    group: "Style",
    icon: "☑︎",
    action: (e) => e.chain().focus().toggleTaskList().run(),
  },
  {
    id: "image",
    label: "Image (URL)",
    keywords: ["img", "picture", "media"],
    group: "Insert",
    icon: "🖼️",
    action: (e) => {
      const url = window.prompt("Image URL")?.trim();
      if (!url) return;
      e.chain().focus().setImage({ src: url }).run();
    },
  },
  {
    id: "table",
    label: "Insert table",
    keywords: ["grid", "table"],
    group: "Insert",
    icon: "▦",
    action: (e) =>
      e
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    id: "codeBlock",
    label: "Code block",
    keywords: ["code", "snippet"],
    group: "Insert",
    icon: "</>",
    action: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
];

export default function CommandInput({
  editor,
  placeholder = "Type '/' for commands",
}: {
  editor: Editor | null;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const commands = DEFAULT_COMMANDS;

  const filtered = useMemo(() => {
    if (!isCommandMode) return [] as CommandOption[];
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        (c.keywords || []).some((k) => k.toLowerCase().includes(q))
    );
  }, [isCommandMode, query, commands]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandOption[]>();
    for (const c of filtered) {
      const g = c.group || "Style";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => {
    if (!isCommandMode) setActiveIndex(0);
  }, [isCommandMode, query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsCommandMode(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const runOption = (opt: CommandOption) => {
    if (!editor) return;
    removeTrailingSlashQuery(editor);
    opt.action(editor);
    setIsCommandMode(false);
    setValue("");
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isCommandMode) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (i) =>
          (i - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[activeIndex] || filtered[0];
      if (option && editor) {
        runOption(option);
      }
    } else if (e.key === "Escape") {
      setIsCommandMode(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    const slashIndex = next.lastIndexOf("/");
    if (slashIndex !== -1) {
      setIsCommandMode(true);
      setQuery(next.slice(slashIndex + 1));
    } else {
      setIsCommandMode(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="notion-command-input"
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          outline: "none",
          fontSize: 14,
        }}
      />

      {isCommandMode && filtered.length > 0 && (
        <div
          className="notion-command-popover"
          style={{
            position: "absolute",
            left: 8,
            top: 44,
            zIndex: 20,
            background: "#111418",
            border: "1px solid #2a2f36",
            borderRadius: 12,
            boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
            width: 340,
            color: "#e5e7eb",
            overflow: "hidden",
          }}
        >
          <div style={{ maxHeight: 280, overflowY: "auto", padding: 8 }}>
            {grouped.map(([groupName, items]) => (
              <div key={groupName} style={{ paddingBottom: 8 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "#9aa3af",
                    padding: "6px 8px",
                    borderTop: "1px solid #1e232a",
                    borderBottom: "1px solid #1e232a",
                    margin: "6px 0",
                  }}
                >
                  {groupName}
                </div>
                {items.map((opt) => {
                  const itemIndex = filtered.findIndex((o) => o.id === opt.id);
                  const active = itemIndex === activeIndex;
                  return (
                    <button
                      key={opt.id}
                      onMouseDown={(ev) => {
                        ev.preventDefault();
                        if (editor) runOption(opt);
                      }}
                      className="notion-command-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        textAlign: "left",
                        gap: 10,
                        padding: "10px 12px",
                        background: active ? "#1a1f26" : "transparent",
                        border: 0,
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      <span
                        style={{ width: 22, textAlign: "center", opacity: 0.9 }}
                      >
                        {opt.icon || "•"}
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div
            style={{
              padding: 8,
              borderTop: "1px solid #2a2f36",
              background: "#0e1216",
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="/Filter…"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #2a2f36",
                background: "#0b0f14",
                color: "#e5e7eb",
                outline: "none",
                fontSize: 13,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
