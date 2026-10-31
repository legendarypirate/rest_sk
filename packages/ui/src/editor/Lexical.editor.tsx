'use client';

import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { $getRoot } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { cn } from '@packages/ui/lib/utils';

import {
  createLexicalConfig,
  getLexicalPlainText,
  parseLexicalState,
} from './lexical.config';
import { EditorToolbar } from './Toolbar';

export type LexicalChangePayload = {
  content: Record<string, unknown>;
  plainText: string;
};

interface LexicalEditorProps {
  /** Remount key when switching records or fields. */
  editorId: string;
  initialContent?: unknown;
  editable?: boolean;
  /** `field` is a compact box. `document` is a Word-like page. */
  variant?: 'field' | 'document';
  className?: string;
  paperClassName?: string;
  paperStyle?: CSSProperties;
  paperRef?: Ref<HTMLDivElement>;
  footer?: ReactNode;
  placeholder?: string;
  onChange?: (payload: LexicalChangePayload) => void;
  onBlur?: () => void;
}

function emitChange(
  editor: ReturnType<typeof useLexicalComposerContext>[0],
  onChange?: (payload: LexicalChangePayload) => void,
) {
  if (!onChange) {
    return;
  }

  editor.getEditorState().read(() => {
    onChange({
      content: editor.getEditorState().toJSON() as unknown as Record<
        string,
        unknown
      >,
      plainText: $getRoot().getTextContent(),
    });
  });
}

function EditorChangePlugin({
  onChange,
}: {
  onChange?: (payload: LexicalChangePayload) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const notify = () => emitChange(editor, onChangeRef.current);
    const unsubText = editor.registerTextContentListener(notify);
    const unsubUpdate = editor.registerUpdateListener(notify);

    return () => {
      unsubText();
      unsubUpdate();
    };
  }, [editor]);

  return null;
}

function SyncEditable({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);
  return null;
}

export function LexicalEditor({
  editorId,
  initialContent,
  editable = true,
  variant = 'field',
  className,
  paperClassName,
  paperStyle,
  paperRef,
  footer,
  placeholder = 'Бичих…',
  onChange,
  onBlur,
}: LexicalEditorProps) {
  const config = useMemo(
    () => createLexicalConfig(`editor-${editorId}`, initialContent, editable),
    // Mount-only: parent remounts via `editorId` when the record changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorId],
  );
  const isDocument = variant === 'document';

  return (
    <LexicalComposer key={editorId} initialConfig={config}>
      <div
        className={cn(
          isDocument
            ? 'flex min-h-0 flex-1 flex-col bg-transparent'
            : editable
              ? 'min-h-48 flex flex-col overflow-hidden rounded-md border border-border bg-card'
              : 'min-h-0 bg-transparent',
          className,
        )}
      >
        {isDocument || editable ? (
          <EditorToolbar className="shrink-0" disabled={!editable} />
        ) : null}
        <div
          data-studio-canvas={isDocument ? '' : undefined}
          className={cn(
            'relative flex-1',
            isDocument ? 'min-h-0 overflow-auto' : 'overflow-y-auto',
            editable && !isDocument ? 'min-h-40' : null,
            !editable && !isDocument ? 'min-h-0' : null,
          )}
        >
          {isDocument ? (
            <div className="px-4 py-6">
              <div
                ref={paperRef}
                className={cn('relative mx-auto bg-white text-zinc-900', paperClassName)}
                style={paperStyle}
              >
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      className="min-h-full px-16 py-14 text-base leading-7 outline-none focus:outline-none"
                      aria-placeholder={placeholder}
                      onBlur={onBlur}
                      placeholder={
                        <div className="text-muted-foreground pointer-events-none absolute top-14 left-16 text-base">
                          {placeholder}
                        </div>
                      }
                    />
                  }
                  placeholder={null}
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </div>
              {footer}
            </div>
          ) : (
            <RichTextPlugin
              contentEditable={
                editable ? (
                  <ContentEditable
                    className="min-h-40 px-4 py-3 text-sm outline-none focus:outline-none"
                    aria-placeholder={placeholder}
                    onBlur={onBlur}
                    placeholder={
                      <div className="text-muted-foreground pointer-events-none absolute top-3 left-4 text-sm">
                        {placeholder}
                      </div>
                    }
                  />
                ) : (
                  <ContentEditable
                    className="min-h-0 px-0 py-0 text-sm outline-none"
                    placeholder={null}
                  />
                )
              }
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
          )}
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <SyncEditable editable={editable} />
        {onChange ? <EditorChangePlugin onChange={onChange} /> : null}
      </div>
    </LexicalComposer>
  );
}

export function LexicalViewer({
  editorId,
  content,
  className,
  emptyText = '—',
}: {
  editorId: string;
  content?: unknown;
  className?: string;
  emptyText?: string;
}) {
  const parsed = parseLexicalState(content);
  if (!getLexicalPlainText(parsed)) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <LexicalEditor
      editorId={editorId}
      initialContent={parsed}
      editable={false}
      className={className}
    />
  );
}
