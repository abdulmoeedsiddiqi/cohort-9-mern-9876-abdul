import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Content } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { ReactNode } from 'react';

import { countWords } from '../../lib/tiptapText';
import { EditorToolbar } from './EditorToolbar';

interface TiptapEditorProps {
  content: Content;
  onUpdate: (json: object, wordCount: number) => void;
  toolbarEnd?: ReactNode;
}

export function TiptapEditor({ content, onUpdate, toolbarEnd }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content,
    editorProps: {
      attributes: { 'aria-label': 'Note content', role: 'textbox' },
    },
    onUpdate: ({ editor: updatedEditor }) => {
      onUpdate(updatedEditor.getJSON(), countWords(updatedEditor.getText()));
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor">
      <EditorToolbar editor={editor} trailing={toolbarEnd} />
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  );
}
