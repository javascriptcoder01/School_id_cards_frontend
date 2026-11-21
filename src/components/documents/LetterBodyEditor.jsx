// LetterBodyEditor.jsx — TipTap rich text (StarterKit [Underline + Link included] + TextAlign + Table).
// Sirf wahi nodes / marks jo backend sanitiser allow karta hai: p, h1–h4, b/i/u/s, lists, links, tables, text-align.
// Word se paste: schema ke bahar sab (styles, images, comments) apne aap hat jaata hai.
import React, { useEffect } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TableKit } from '@tiptap/extension-table';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Table as TableIcon,
  Rows3,
  Columns3,
  Trash2,
  Undo2,
  Redo2,
} from 'lucide-react';

// Word / Google Docs ka kachra (conditional comments, <style>, <o:p>, mso classes) paste se pehle hatao
const cleanPastedHtml = (html) =>
  String(html || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?o:p[^>]*>/gi, '')
    .replace(/<\/?(meta|link|xml)[^>]*>/gi, '')
    .replace(/\sclass="?Mso[^"\s>]*"?/gi, '');

const SAFE_LINK = /^(https?:\/\/|mailto:)/i;

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
    code: false,
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
    link: { openOnClick: false, autolink: true, defaultProtocol: 'https', protocols: ['http', 'https', 'mailto'], isAllowedUri: (url) => SAFE_LINK.test(url) },
  }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TableKit.configure({ table: { resizable: false } }),
];

const Btn = ({ onClick, active = false, disabled = false, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    aria-pressed={active}
    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'} disabled:opacity-40`}
  >
    {children}
  </button>
);
const Sep = () => <span className="mx-0.5 h-5 w-px shrink-0 bg-slate-200" />;

export const LetterBodyEditor = ({ value, onChange, placeholder = 'Write the letter here…' }) => {
  const editor = useEditor({
    extensions,
    content: value || '',
    editorProps: {
      transformPastedHTML: cleanPastedHtml,
      attributes: { class: 'tiptap min-h-64 px-3.5 py-3 text-sm leading-relaxed text-slate-900 focus:outline-none', 'aria-label': 'Letter body' },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  });

  // Bahar se content badla (quick template) → editor mein daalo
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if ((value || '') !== current) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [editor, value]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
          bold: e.isActive('bold'),
          italic: e.isActive('italic'),
          underline: e.isActive('underline'),
          strike: e.isActive('strike'),
          h2: e.isActive('heading', { level: 2 }),
          h3: e.isActive('heading', { level: 3 }),
          bullet: e.isActive('bulletList'),
          ordered: e.isActive('orderedList'),
          link: e.isActive('link'),
          table: e.isActive('table'),
          align: ['left', 'center', 'right', 'justify'].find((a) => e.isActive({ textAlign: a })) || 'left',
          canUndo: e.can().undo(),
          canRedo: e.can().redo(),
          empty: e.isEmpty,
        }
        : null,
  });

  if (!editor || !state) return <div className="min-h-64 rounded-2xl border border-slate-200 bg-slate-50" />;
  const chain = () => editor.chain().focus();

  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Link (https://… or mailto:…). Leave empty to remove.', previous);
    if (url === null) return;
    if (!url.trim()) return chain().extendMarkRange('link').unsetLink().run();
    if (!SAFE_LINK.test(url.trim())) return window.alert('Only https://, http:// or mailto: links are allowed.');
    chain().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-slate-100 bg-slate-50/70 px-1.5 py-1">
        <Btn title="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
        <Btn title="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
        <Btn title="Underline" active={state.underline} onClick={() => chain().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></Btn>
        <Btn title="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Btn>
        <Sep />
        <Btn title="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
        <Btn title="Sub-heading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
        <Btn title="Bullet list" active={state.bullet} onClick={() => chain().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
        <Btn title="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
        <Sep />
        <Btn title="Align left" active={state.align === 'left'} onClick={() => chain().setTextAlign('left').run()}><AlignLeft className="h-4 w-4" /></Btn>
        <Btn title="Align centre" active={state.align === 'center'} onClick={() => chain().setTextAlign('center').run()}><AlignCenter className="h-4 w-4" /></Btn>
        <Btn title="Align right" active={state.align === 'right'} onClick={() => chain().setTextAlign('right').run()}><AlignRight className="h-4 w-4" /></Btn>
        <Btn title="Justify" active={state.align === 'justify'} onClick={() => chain().setTextAlign('justify').run()}><AlignJustify className="h-4 w-4" /></Btn>
        <Sep />
        <Btn title="Link" active={state.link} onClick={setLink}><Link2 className="h-4 w-4" /></Btn>
        <Btn title="Insert table" onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon className="h-4 w-4" /></Btn>
        {state.table && (
          <>
            <Btn title="Add row" onClick={() => chain().addRowAfter().run()}><Rows3 className="h-4 w-4" /></Btn>
            <Btn title="Add column" onClick={() => chain().addColumnAfter().run()}><Columns3 className="h-4 w-4" /></Btn>
            <Btn title="Delete table" onClick={() => chain().deleteTable().run()}><Trash2 className="h-4 w-4" /></Btn>
          </>
        )}
        <Sep />
        <Btn title="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()}><Undo2 className="h-4 w-4" /></Btn>
        <Btn title="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()}><Redo2 className="h-4 w-4" /></Btn>
      </div>
      <div className="relative">
        {state.empty && <p className="pointer-events-none absolute left-3.5 top-3 text-sm text-slate-400">{placeholder}</p>}
        <EditorContent
          editor={editor}
          className="[&_.tiptap_a]:text-indigo-600 [&_.tiptap_a]:underline [&_.tiptap_h1]:text-2xl [&_.tiptap_h1]:font-bold [&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-bold [&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-semibold [&_.tiptap_h4]:font-semibold [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_p]:my-1.5 [&_.tiptap_table]:my-2 [&_.tiptap_table]:w-full [&_.tiptap_table]:border-collapse [&_.tiptap_td]:border [&_.tiptap_td]:border-slate-300 [&_.tiptap_td]:px-2 [&_.tiptap_td]:py-1 [&_.tiptap_th]:border [&_.tiptap_th]:border-slate-300 [&_.tiptap_th]:bg-slate-50 [&_.tiptap_th]:px-2 [&_.tiptap_th]:py-1 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6"
        />
      </div>
    </div>
  );
};

export default LetterBodyEditor;
