// src/App.tsx
// import Editor from "./Editor";
import EditorJSComponent from "./Component/EditorJS";

import "./styles.css";

export default function App() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 className="notion-title">Editor.js Demo</h1>
      {/* <EditorJsDemo /> */}
        <EditorJSComponent />
    </div>
  );
}
