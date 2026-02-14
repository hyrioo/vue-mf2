import type { VNodeChild } from 'vue';

export interface MarkupRenderInput<TOptions = Record<string, unknown> | undefined> {
  children: VNodeChild[];
  options?: TOptions;
}

export type MarkupRenderer<TOptions = Record<string, unknown> | undefined> = (
  input: MarkupRenderInput<TOptions>
) => VNodeChild;

export interface LinkMarkupOptions {
  to?: string;
}

export interface BuiltinMarkupOptions {
  bold: undefined;
  italic: undefined;
  link: LinkMarkupOptions;
  underline: undefined;
  code: undefined;
  mark: undefined;
}

export type BuiltinMarkupName = keyof BuiltinMarkupOptions;

export type BuiltinMarkupRegistry = {
  [K in BuiltinMarkupName]: MarkupRenderer<BuiltinMarkupOptions[K]>;
};
