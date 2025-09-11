// src/editor/SlashMenu.tsx
import { Editor } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";

export default function SlashMenu({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <FloatingMenu editor={editor}>
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 8,
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 8,
        }}
      >
        <button onClick={() => editor.chain().focus().setParagraph().run()}>
          Paragraph
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code
        </button>
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .setImage({ src: "https://placehold.co/800x400" })
              .run()
          }
        >
          Image
        </button>
      </div>
    </FloatingMenu>
  );
}
