// src/Editor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import { extensions } from "./editor/extensions";
import CommandInput from "./editor/CommandInput";

const DEFAULT_HTML = `
  <h2>Tiptap React Demo</h2>
  <p>Type <strong>/</strong> for commands. Select text to see the bubble menu.</p>
  <ul><li>Bold/Italic/Underline/Strike</li><li>Links & Images</li><li>Task List & Tables</li><li>Code blocks with syntax highlighting</li></ul>
`;

export default function Editor() {
  const editor = useEditor({
    extensions,
    content: localStorage.getItem("tiptap_json")
      ? JSON.parse(localStorage.getItem("tiptap_json") as string)
      : DEFAULT_HTML,
    autofocus: "end",
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    onUpdate: ({ editor }) => {
      localStorage.setItem("tiptap_json", JSON.stringify(editor.getJSON()));
    },
  });

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <CommandInput editor={editor} />
      <div className="editor-shell">
        <EditorContent editor={editor} />
      </div>
      <footer style={{ fontSize: 12, color: "#666" }}>
        <span>
          Characters: {editor?.storage.characterCount.characters() ?? 0} / 5000
        </span>
      </footer>
    </div>
  );
}
