'use client';

type DocumentTitleProps = {
  title: string;
};

export function DocumentTitle({ title }: DocumentTitleProps) {
  return <title>{`${title} · Restaurant Admin`}</title>;
}
