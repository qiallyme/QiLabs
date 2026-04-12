// src/types/qinote-components.d.ts
import * as React from "react";

export interface QiVaultFileNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: QiVaultFileNode[];
}

declare module "../components/QiNoteFileTree" {
  import type { QiVaultFileNode } from "../types/qinote-components";

  export interface QiNoteFileTreeProps {
    data: QiVaultFileNode[];
    onSelect: (node: QiVaultFileNode) => void;
  }

  const QiNoteFileTree: React.FC<QiNoteFileTreeProps>;
  export default QiNoteFileTree;
}

declare module "../components/QiNoteMarkdownEditor" {
  export interface QiNoteMarkdownEditorProps {
    content: string;
    onChange: (value: string) => void;
  }

  const QiNoteMarkdownEditor: React.FC<QiNoteMarkdownEditorProps>;
  export default QiNoteMarkdownEditor;
}
