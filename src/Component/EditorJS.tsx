import React, { useEffect, useRef, useState } from "react";
import type { ToolConstructable, OutputData } from "@editorjs/editorjs";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Table from "@editorjs/table";
import FileTool from "../tools/FileTool";
import { getSuggestion } from "../editor/aiSuggester";
const HOLDER_ID = "editorjs";
const DEBOUNCE_MS = 350;

const EditorJSComponent: React.FC = () => {
  const holderRef = useRef<EditorJS | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ghost, setGhost] = useState<string>("");
  const [pos, setPos] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  const suggestionActiveRef = useRef<string>("");
  const debounceRef = useRef<number | null>(null);

  const debounce = (fn: () => void, ms = DEBOUNCE_MS) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(fn, ms);
  };

  useEffect(() => {
    if (holderRef.current) return;
    type ToolConfig = {
      class: ToolConstructable;
      inlineToolbar?: boolean;
      config?: Record<string, unknown>;
    };

    const tools: Record<string, ToolConfig> = {
      header: {
        class: Header as unknown as ToolConstructable,
        inlineToolbar: true,
        config: { levels: [2, 3, 4], defaultLevel: 2 },
      },
      list: {
        class: List as unknown as ToolConstructable,
        inlineToolbar: true,
      },
      paragraph: {
        class: Paragraph as unknown as ToolConstructable,
        inlineToolbar: true,
      },
      table: {
        class: Table as unknown as ToolConstructable,
        inlineToolbar: true,
      },
      file: {
        class: FileTool as unknown as ToolConstructable,
        inlineToolbar: true,
      },
    };

    const saved = localStorage.getItem("ej_data");

    const editor = new EditorJS({
      placeholder: "Type “/” for commands…",
      holder: HOLDER_ID,
      tools,
      autofocus: true,
      data: saved ? (JSON.parse(saved) as OutputData) : undefined,
      onChange: async () => {
        try {
          const data = await editor.save();
          localStorage.setItem("ej_data", JSON.stringify(data));
        } catch (error) {
          console.error(error);
        }
      },
    });

    function getCaretRect(): DOMRect | null {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;
      const range = selection.getRangeAt(0).cloneRange();
      if (!range.collapsed) {
        range.collapse(false);
      }
      const rects = range.getClientRects();
      if (rects && rects.length > 0) return rects[rects.length - 1];
      const dummy = document.createElement("span");
      dummy.appendChild(document.createTextNode("\u200b"));
      range.insertNode(dummy);
      const rect = dummy.getBoundingClientRect();
      dummy.parentNode?.removeChild(dummy);
      return rect ?? null;
    }

    function getTextBeforeCursor(): string {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return "";
      const range = selection.getRangeAt(0);
      const anchorNode = selection.anchorNode as Node | null;
      if (!anchorNode) return "";
      const blockEl = (
        anchorNode instanceof Element ? anchorNode : anchorNode.parentElement
      )?.closest(".ce-block");
      if (!blockEl) return "";
      const preRange = document.createRange();
      preRange.selectNodeContents(blockEl);
      preRange.setEnd(range.endContainer, range.endOffset);
      const text = preRange.toString();
      return text;
    }

    function updatePositionFromCaret() {
      const caretRect = getCaretRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!caretRect || !containerRect) return;
      setPos({
        left: Math.max(0, caretRect.left - containerRect.left),
        top: Math.max(0, caretRect.bottom - containerRect.top),
      });
    }

    async function updateSuggestion() {
      const contextText = getTextBeforeCursor();
      const suggestion = await getSuggestion({ textBeforeCursor: contextText });
      suggestionActiveRef.current = suggestion;
      setGhost(suggestion);
      updatePositionFromCaret();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab" && suggestionActiveRef.current) {
        e.preventDefault();
        const text = suggestionActiveRef.current;
        if (!text) return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        suggestionActiveRef.current = "";
        setGhost("");
        return;
      }
      if (e.key === "Escape") {
        suggestionActiveRef.current = "";
        setGhost("");
        return;
      }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        updatePositionFromCaret();
      }
    }

    function onKeyUp() {
      debounce(() => updateSuggestion());
    }

    function onMouseUp() {
      updatePositionFromCaret();
      debounce(() => updateSuggestion());
    }

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    document.addEventListener("mouseup", onMouseUp, true);
    document.addEventListener("selectionchange", updatePositionFromCaret, true);

    return () => {
      if (editor.destroy) {
        editor.destroy();
      }
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", onKeyUp, true);
      document.removeEventListener("mouseup", onMouseUp, true);
      document.removeEventListener(
        "selectionchange",
        updatePositionFromCaret,
        true
      );
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div id={HOLDER_ID} className="editorjs-shell" />
      {ghost && (
        <div
          className="ai-ghost"
          style={{
            position: "absolute",
            left: pos.left,
            top: pos.top,
            pointerEvents: "none",
            whiteSpace: "pre-wrap",
          }}
        >
          {ghost}
        </div>
      )}
    </div>
  );
};

export default EditorJSComponent;
