import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';

export const EMPTY_EDITOR_STATE = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
};

export const lexicalTheme = {
  paragraph: 'mb-2 leading-relaxed text-foreground',
  quote: 'my-2 border-l-2 border-muted-foreground/40 pl-3 text-muted-foreground italic',
  heading: {
    h1: 'mb-3 text-3xl font-semibold tracking-tight',
    h2: 'mb-2 text-2xl font-semibold tracking-tight',
    h3: 'mb-2 text-xl font-semibold',
  },
  list: {
    ul: 'mb-2 list-disc pl-5',
    ol: 'mb-2 list-decimal pl-5',
    listitem: 'my-0.5',
  },
  link: 'text-primary underline underline-offset-2',
  text: {
    bold: 'font-semibold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]',
  },
};

export const lexicalNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
];

type LexicalNodeLike = {
  text?: unknown;
  children?: unknown;
  root?: unknown;
};

export function getLexicalPlainText(state: unknown): string {
  const texts: string[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') {
      return;
    }

    const record = node as LexicalNodeLike;
    if (typeof record.text === 'string' && record.text.length > 0) {
      texts.push(record.text);
    }
    if (record.root) {
      walk(record.root);
    }
    if (Array.isArray(record.children)) {
      record.children.forEach(walk);
    }
  }

  walk(parseLexicalState(state));
  return texts.join('').replace(/\s+/g, ' ').trim();
}

export function plainTextToLexicalState(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return EMPTY_EDITOR_STATE;
  }

  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: trimmed,
              type: 'text',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };
}

export function parseLexicalState(value: unknown) {
  if (value == null || value === '') {
    return EMPTY_EDITOR_STATE;
  }

  if (typeof value === 'object' && value !== null && 'root' in value) {
    return value;
  }

  if (typeof value !== 'string') {
    return EMPTY_EDITOR_STATE;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed === 'string') {
      return parseLexicalState(parsed);
    }
    if (parsed && typeof parsed === 'object' && 'root' in parsed) {
      return parsed;
    }
  } catch {
    return plainTextToLexicalState(value);
  }

  return plainTextToLexicalState(value);
}

export function serializeLexicalState(value: unknown) {
  return JSON.stringify(parseLexicalState(value));
}

export function createLexicalConfig(
  namespace = 'Editor',
  initialJSON?: unknown,
  editable = true,
): InitialConfigType {
  const json = initialJSON
    ? serializeLexicalState(initialJSON)
    : JSON.stringify(EMPTY_EDITOR_STATE);

  return {
    namespace,
    theme: lexicalTheme,
    nodes: lexicalNodes,
    editable,
    onError(error) {
      console.error(`[${namespace}]`, error);
    },
    editorState: json,
  };
}
