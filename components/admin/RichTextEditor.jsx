'use client';

import React, { useRef, useCallback } from 'react';
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Link, Image, Quote, Code, Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Lightweight rich text editor using a textarea with an HTML formatting toolbar.
 * Wraps selected text in HTML tags. No external dependencies.
 */
export default function RichTextEditor({ value, onChange, placeholder, className = '' }) {
  const textareaRef = useRef(null);

  const wrapSelection = useCallback((before, after) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange(newText);

    // Restore cursor position after the inserted text
    requestAnimationFrame(() => {
      ta.focus();
      const newPos = start + before.length + selected.length + after.length;
      ta.setSelectionRange(newPos, newPos);
    });
  }, [value, onChange]);

  const insertAtCursor = useCallback((text) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);

    requestAnimationFrame(() => {
      ta.focus();
      const newPos = start + text.length;
      ta.setSelectionRange(newPos, newPos);
    });
  }, [value, onChange]);

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (!url) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end) || 'link text';
    wrapSelection(`<a href="${url}">`, '</a>');
  };

  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (!url) return;
    const alt = prompt('Enter alt text:', '') || '';
    insertAtCursor(`<img src="${url}" alt="${alt}" style="max-width:100%;border-radius:8px;" />`);
  };

  const tools = [
    { icon: Bold, label: 'Bold', action: () => wrapSelection('<strong>', '</strong>') },
    { icon: Italic, label: 'Italic', action: () => wrapSelection('<em>', '</em>') },
    { icon: Heading1, label: 'H1', action: () => wrapSelection('<h1>', '</h1>') },
    { icon: Heading2, label: 'H2', action: () => wrapSelection('<h2>', '</h2>') },
    { icon: Heading3, label: 'H3', action: () => wrapSelection('<h3>', '</h3>') },
    { icon: List, label: 'Bullet List', action: () => wrapSelection('<ul>\n<li>', '</li>\n</ul>') },
    { icon: ListOrdered, label: 'Numbered List', action: () => wrapSelection('<ol>\n<li>', '</li>\n</ol>') },
    { icon: Quote, label: 'Blockquote', action: () => wrapSelection('<blockquote>', '</blockquote>') },
    { icon: Link, label: 'Link', action: handleLink },
    { icon: Image, label: 'Image', action: handleImage },
    { icon: Code, label: 'Code', action: () => wrapSelection('<code>', '</code>') },
    { icon: Minus, label: 'Divider', action: () => insertAtCursor('\n<hr />\n') },
  ];

  return (
    <div className={`border border-slate-300 rounded-md overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-1.5 bg-slate-50 border-b border-slate-200">
        {tools.map(({ icon: Icon, label, action }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-slate-200"
            title={label}
            onClick={action}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Write your content...'}
        className="w-full min-h-[400px] p-4 text-sm font-mono border-0 outline-none resize-y"
      />
    </div>
  );
}
