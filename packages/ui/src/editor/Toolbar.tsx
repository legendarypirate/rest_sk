'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  type ElementFormatType,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from 'lucide-react';

import { Button } from '@packages/ui/components/button';
import { cn } from '@packages/ui/lib/utils';

type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  align: ElementFormatType;
};

export function EditorToolbar({
  className,
  disabled = false,
}: {
  className?: string;
  disabled?: boolean;
}) {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    align: '',
  });

  const syncFormats = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        setFormats({
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          align: '',
        });
        return;
      }

      const top = selection.anchor.getNode().getTopLevelElement();

      setFormats({
        bold: selection.hasFormat('bold'),
        italic: selection.hasFormat('italic'),
        underline: selection.hasFormat('underline'),
        strikethrough: selection.hasFormat('strikethrough'),
        align: top && 'getFormatType' in top ? top.getFormatType() : '',
      });
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      syncFormats();
    });
  }, [editor, syncFormats]);

  const setHeading = (tag: HeadingTagType | 'paragraph' | 'quote') => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (tag === 'paragraph') {
        $setBlocksType(selection, () => $createParagraphNode());
        return;
      }
      if (tag === 'quote') {
        $setBlocksType(selection, () => $createQuoteNode());
        return;
      }
      $setBlocksType(selection, () => $createHeadingNode(tag));
    });
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/80 px-3 py-2',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
    >
      <ToolBtn
        label="Буцаах"
        disabled={disabled}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo2Icon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Давтах"
        disabled={disabled}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo2Icon className="size-3.5" />
      </ToolBtn>

      <Sep />

      <ToolBtn
        label="Гарчиг 1"
        disabled={disabled}
        onClick={() => setHeading('h1')}
      >
        <Heading1Icon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Гарчиг 2"
        disabled={disabled}
        onClick={() => setHeading('h2')}
      >
        <Heading2Icon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Гарчиг 3"
        disabled={disabled}
        onClick={() => setHeading('h3')}
      >
        <Heading3Icon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Ишлэл"
        disabled={disabled}
        onClick={() => setHeading('quote')}
      >
        <QuoteIcon className="size-3.5" />
      </ToolBtn>

      <Sep />

      <ToolBtn
        label="Бүдүүн"
        active={formats.bold}
        disabled={disabled}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <BoldIcon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Налуу"
        active={formats.italic}
        disabled={disabled}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <ItalicIcon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Доогуур зураас"
        active={formats.underline}
        disabled={disabled}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <UnderlineIcon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Дундуур зураас"
        active={formats.strikethrough}
        disabled={disabled}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
      >
        <StrikethroughIcon className="size-3.5" />
      </ToolBtn>

      <Sep />

      <ToolBtn
        label="Зүүн"
        active={formats.align === 'left'}
        disabled={disabled}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
      >
        <AlignLeftIcon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Гол"
        active={formats.align === 'center'}
        disabled={disabled}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
      >
        <AlignCenterIcon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Баруун"
        active={formats.align === 'right'}
        disabled={disabled}
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
      >
        <AlignRightIcon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Тэгшитгэх"
        active={formats.align === 'justify'}
        disabled={disabled}
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
        }
      >
        <AlignJustifyIcon className="size-3.5" />
      </ToolBtn>

      <Sep />

      <ToolBtn
        label="Жагсаалт"
        disabled={disabled}
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      >
        <ListIcon className="size-3.5" />
      </ToolBtn>
      <ToolBtn
        label="Дугаарласан"
        disabled={disabled}
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      >
        <ListOrderedIcon className="size-3.5" />
      </ToolBtn>
    </div>
  );
}

function Sep() {
  return <span className="mx-1 h-4 w-px bg-border" />;
}

function ToolBtn({
  children,
  label,
  active,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="icon-xs"
      variant="ghost"
      title={label}
      aria-label={label}
      disabled={disabled}
      className={cn(active && 'bg-background text-foreground')}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
