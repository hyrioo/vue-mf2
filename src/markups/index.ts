import renderBold from './bold';
import renderItalic from './italic';
import renderUnderline from './underline';
import renderCode from './code';
import renderMark from './mark';
import renderLink from './link';
import type { BuiltinMarkupRegistry, MarkupRenderer } from './types';

export const BUILTIN_MARKUP_RENDERERS: BuiltinMarkupRegistry = {
  bold: renderBold,
  italic: renderItalic,
  underline: renderUnderline,
  code: renderCode,
  mark: renderMark,
  link: renderLink
};

export type CustomMarkupRegistry = Record<string, MarkupRenderer>;

export function createMarkupRendererResolver(customMarkups: CustomMarkupRegistry = {}): (name: string) => MarkupRenderer | undefined {
  const merged = {
    ...BUILTIN_MARKUP_RENDERERS,
    ...customMarkups
  } as Record<string, MarkupRenderer | undefined>;

  return (name: string) => merged[name];
}
