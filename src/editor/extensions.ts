// src/editor/extensions.ts
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight/lib/core";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

export const extensions = [
  StarterKit.configure({
    bulletList: { keepMarks: true },
    orderedList: { keepMarks: true },
    codeBlock: false, // we use CodeBlockLowlight instead
  }),
  Underline,
  Highlight,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Link.configure({ openOnClick: true, autolink: true }),
  Image.configure({ inline: false, allowBase64: true }),
  Placeholder.configure({
    placeholder: "Type “/” for commands…",
    includeChildren: true,
  }),
  CharacterCount.configure({ limit: 5000 }),
  TaskList,
  TaskItem.configure({ nested: true }),
  CodeBlockLowlight.configure({ lowlight }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];
