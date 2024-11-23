'use client';

import { inputRules } from 'prosemirror-inputrules';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { useEffect, useRef } from 'react';
import { basicSetup, basicSchema, customKeymap } from '@/lib/editor/rules';

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  className?: string;
}

export function Editor({ content = '', onChange, className }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: basicSchema.nodeFromJSON(content || { type: 'doc', content: [{ type: 'paragraph' }] }),
      plugins: [
        ...basicSetup(basicSchema),
        keymap(customKeymap)
      ]
    });

    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        
        if (onChange) {
          const content = newState.doc.toJSON();
          onChange(JSON.stringify(content));
        }
      }
    });

    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, [content, onChange]);

  return <div ref={editorRef} className={className} />;
}
