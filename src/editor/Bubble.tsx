// src/editor/Bubble.tsx
import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

export default function Bubble({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <BubbleMenu editor={editor}>
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 8,
          background: "#111",
          color: "#fff",
          borderRadius: 8,
        }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={b(editor.isActive("bold"))}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={b(editor.isActive("italic"))}
        >
          <i>I</i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          style={b(editor.isActive("underline"))}
        >
          U
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={b(editor.isActive("strike"))}
        >
          S
        </button>
      </div>
    </BubbleMenu>
  );
}

const b = (active: boolean): React.CSSProperties => ({
  background: active ? "#fff" : "transparent",
  color: active ? "#111" : "#fff",
  border: "1px solid #444",
  borderRadius: 6,
  padding: "4px 8px",
});
