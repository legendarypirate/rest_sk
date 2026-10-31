'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
  type RenderTask,
} from 'pdfjs-dist';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@packages/ui/components/button';
import { cn } from '@packages/ui/lib/utils';

import {
  MCard,
  MCardContent,
  MCardDescription,
  MCardHeader,
  MCardTitle,
} from './MCard';

const PDFJS_VERSION = '6.3.289';

if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
}

type MPdfPreviewProps = {
  src: string;
  title?: string;
  className?: string;
};

export function MPdfPreview({ src, title, className }: MPdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    const task = getDocument({
      url: src,
      isEvalSupported: false,
      withCredentials: false,
    });

    setStatus('loading');
    setDoc(null);
    setPage(1);

    void task.promise
      .then((next) => {
        if (cancelled) {
          void next.destroy();
          return;
        }
        setDoc(next);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
      void task.destroy();
    };
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!doc || !canvas || status !== 'ready') {
      return;
    }

    let cancelled = false;

    void doc.getPage(page).then(async (pdfPage) => {
      if (cancelled) {
        return;
      }

      const base = pdfPage.getViewport({ scale: 1 });
      const width = Math.min(720, canvas.parentElement?.clientWidth || 720);
      const scale = width / base.width;
      const viewport = pdfPage.getViewport({ scale });
      const ratio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderTaskRef.current?.cancel();
      const renderTask = pdfPage.render({
        canvas,
        canvasContext: context,
        viewport,
      });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
      } catch {
        // Superseded by another page or unmount.
      }
    });

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [doc, page, status]);

  const pages = doc?.numPages ?? 0;
  const label = title?.trim() || 'PDF';

  return (
    <MCard size="sm" className={cn('gap-0 overflow-hidden py-0', className)}>
      <MCardHeader className="flex-row items-center justify-between gap-3 border-b px-3 py-2.5">
        <div className="min-w-0">
          <MCardDescription>PDF</MCardDescription>
          <MCardTitle className="truncate text-sm">{label}</MCardTitle>
        </div>
        {status === 'ready' && pages > 0 ? (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-14 text-center text-xs tabular-nums text-muted-foreground">
              {page} / {pages}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={page >= pages}
              onClick={() => setPage((current) => Math.min(pages, current + 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        ) : null}
      </MCardHeader>
      <MCardContent className="bg-muted/40 p-3">
        {status === 'error' ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Урьдчилан үзэх боломжгүй. Файлыг дахин байршуулна уу.
          </p>
        ) : (
          <div className="flex min-h-64 items-center justify-center">
            {status === 'loading' ? (
              <p className="text-sm text-muted-foreground">Уншиж байна…</p>
            ) : null}
            <canvas
              ref={canvasRef}
              className={cn(
                'max-w-full rounded-md bg-white shadow-sm',
                status !== 'ready' && 'hidden',
              )}
            />
          </div>
        )}
      </MCardContent>
    </MCard>
  );
}
