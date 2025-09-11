// src/EditorJsDemo.tsx
import { useEffect, useRef } from "react";
import EditorJS, {
  type OutputData,
  type ToolConstructable,
} from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Checklist from "@editorjs/checklist";
import Table from "@editorjs/table";
import ImageTool from "@editorjs/image";
import Underline from "@editorjs/underline";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import FileTool from "./tools/FileTool";
// import SlashMenu from "./SlashMenu";

const HOLDER_ID = "editorjs";

export default function EditorJsDemo() {
  const editorRef = useRef<EditorJS | null>(null);
  //   const [ready, setReady] = useState(false);

  useEffect(() => {
    if (editorRef.current) return;

    const saved = localStorage.getItem("ej_data");

    const editor = new EditorJS({
      holder: HOLDER_ID,
      autofocus: true,
      placeholder: "Type “/” for commands…",
      data: saved ? (JSON.parse(saved) as OutputData) : undefined,
      tools: {
        header: {
          class: Header as unknown as ToolConstructable,
          inlineToolbar: true,
          config: { levels: [1, 2, 3], defaultLevel: 2 },
        },
        list: {
          class: List as unknown as ToolConstructable,
          inlineToolbar: true,
        },
        checklist: {
          class: Checklist as unknown as ToolConstructable,
          inlineToolbar: true,
        },
        table: {
          class: Table as unknown as ToolConstructable,
          inlineToolbar: true,
        },
        image: {
          class: ImageTool as unknown as ToolConstructable,
          inlineToolbar: true,
          config: {
            uploader: {
              async uploadByFile(file: File) {
                const url = URL.createObjectURL(file);
                return { success: 1, file: { url } };
              },
            },
          },
        },
        underline: Underline as unknown as ToolConstructable,
        marker: Marker as unknown as ToolConstructable,
        inlineCode: InlineCode as unknown as ToolConstructable,
        file: FileTool as unknown as ToolConstructable,
      },
      //   onReady: () => setReady(true),
      onChange: async () => {
        const data = await editorRef.current?.save();
        localStorage.setItem("ej_data", JSON.stringify(data));
      },
    });

    editorRef.current = editor;

    return () => {
      editorRef.current?.destroy?.();
      editorRef.current = null;
    };
  }, []);

  const saveJSON = async () => {
    const data = await editorRef.current?.save();
    console.log("Data:", data);
    alert("Saved to localStorage & logged to console ✅");
  };

  return (
    <div style={{ position: "relative" }}>
      <div className="toolbar">
        <button onClick={saveJSON}>Save</button>
        <button
          onClick={() => {
            localStorage.removeItem("ej_data");
            location.reload();
          }}
        >
          Clear
        </button>
      </div>

      <div id={HOLDER_ID} className="editorjs-shell" />

      {/* {ready && (
        <SlashMenu holderId={HOLDER_ID} getEditor={() => editorRef.current} />
      )} */}
    </div>
  );
}
