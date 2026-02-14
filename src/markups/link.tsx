import type { LinkMarkupOptions, MarkupRenderer } from './types';

function normalizeHref(value: unknown): string {
  if (typeof value !== 'string') {
    return '#';
  }

  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith('\'') && trimmed.endsWith('\''))
  ) {
    const unwrapped = trimmed.slice(1, -1).trim();
    return unwrapped.length > 0 ? unwrapped : '#';
  }

  return trimmed.length > 0 ? trimmed : '#';
}

const renderLink: MarkupRenderer<LinkMarkupOptions> = ({ children, options }) => {
  const href = normalizeHref(options?.to);
  return <a href={href}>{children}</a>;
};

export default renderLink;
