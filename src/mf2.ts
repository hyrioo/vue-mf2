import { MessageFormat } from 'messageformat';
import { DraftFunctions } from 'messageformat/functions';
import type { MessageFunction } from 'messageformat/functions';
import { computed, ref, shallowRef, type ComputedRef, type Ref } from 'vue';
import type { MarkupRenderer } from './markups/types';

export type MessageArgs = Record<string, unknown>;
export type LocaleMessages = Record<string, string>;
export type Mf2Functions = Record<string, MessageFunction<string, string>>;
export type StringFunctionTransform = (
  input: unknown,
  context: {
    locale: string;
    dir: 'ltr' | 'rtl' | 'auto';
    options: Record<string, unknown>;
  }
) => string;

interface ComposerOptions {
  locale: string;
  bundles: Mf2Bundle[];
  resolveMarkupRenderer: (name: string) => MarkupRenderer | undefined;
  functions?: Mf2Functions;
}

export interface MessageResolution {
  locale: string;
  message: string;
}

export interface Mf2Composer {
  locale: Ref<string>;
  availableLocales: ComputedRef<string[]>;
  t: (key: string, args?: MessageArgs) => string;
  tp: (key: string, args?: MessageArgs) => unknown[];
  te: (key: string) => boolean;
  setLocale: (locale: string) => void;
  getMarkupRenderer: (name: string) => MarkupRenderer | undefined;
  resolveMessage: (key: string) => MessageResolution | null;
}

export class Mf2Bundle {
  private readonly localeName: string;
  private readonly dictionary: LocaleMessages = {};

  constructor(locale: string) {
    this.localeName = locale;
  }

  get locale(): string {
    return this.localeName;
  }

  addResource(resource: Record<string, unknown>): this {
    for (const [key, value] of Object.entries(resource)) {
      if (typeof value === 'string') {
        this.dictionary[key] = value;
      }
    }

    return this;
  }

  getMessage(key: string): string | undefined {
    return this.dictionary[key];
  }
}

function bundlesToLocaleMap(bundles: Mf2Bundle[]): Map<string, Mf2Bundle> {
  const map = new Map<string, Mf2Bundle>();
  for (const bundle of bundles) {
    const locale = bundle.locale;
    if (map.has(locale)) {
      throw new Error(`Duplicate bundle locale '${locale}' is not allowed. Pass one Mf2Bundle per locale.`);
    }

    map.set(locale, bundle);
  }

  return map;
}

export function defineStringFunction(transform: StringFunctionTransform): MessageFunction<string, string> {
  return (ctx, options, input) => {
    const locale = ctx.locales[0] ?? 'en';
    const dir = ctx.dir ?? 'auto';
    const value = String(transform(input, { locale, dir, options }));

    return {
      type: 'string',
      dir,
      toParts: () => [{ type: 'string', locale, value }],
      toString: () => value,
      valueOf: () => value
    };
  };
}

export function createComposer(options: ComposerOptions): Mf2Composer {
  const locale = ref(options.locale);
  const bundles = shallowRef<Map<string, Mf2Bundle>>(bundlesToLocaleMap(options.bundles));
  const formatterCache = new Map<string, MessageFormat<any, any>>();
  const messageFunctions = options.functions
    ? { ...DraftFunctions, ...options.functions }
    : DraftFunctions;

  const availableLocales = computed(() =>
    [...bundles.value.keys()].sort((left, right) => left.localeCompare(right))
  );

  const resolveMessage = (key: string): MessageResolution | null => {
    const localeName = locale.value;
    const localeBundle = bundles.value.get(localeName);
    if (!localeBundle) {
      return null;
    }

    const message = localeBundle.getMessage(key);
    if (typeof message !== 'string') {
      return null;
    }

    return {
      locale: localeName,
      message
    };
  };

  const getFormatter = (messageLocale: string, key: string, message: string): MessageFormat<any, any> | null => {
    const cacheKey = `${messageLocale}::${key}`;
    const cached = formatterCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const formatter = new MessageFormat(messageLocale, message, { functions: messageFunctions });
      formatterCache.set(cacheKey, formatter);
      return formatter;
    } catch {
      return null;
    }
  };

  const getResolvedFormatter = (
    key: string
  ): { resolved: MessageResolution; formatter: MessageFormat<any, any> | null } | null => {
    const resolved = resolveMessage(key);
    if (!resolved) {
      return null;
    }

    const formatter = getFormatter(resolved.locale, key, resolved.message);
    return { resolved, formatter };
  };

  const t = (key: string, args: MessageArgs = {}): string => {
    const payload = getResolvedFormatter(key);
    if (!payload) {
      return key;
    }
    if (!payload.formatter) {
      return payload.resolved.message;
    }

    try {
      return String(payload.formatter.format(args));
    } catch {
      return payload.resolved.message;
    }
  };

  const tp = (key: string, args: MessageArgs = {}): unknown[] => {
    const payload = getResolvedFormatter(key);
    if (!payload || !payload.formatter) {
      return [];
    }

    try {
      return payload.formatter.formatToParts(args);
    } catch {
      return [];
    }
  };

  const te = (key: string): boolean => resolveMessage(key) !== null;

  const setLocale = (nextLocale: string): void => {
    locale.value = nextLocale;
  };

  return {
    locale,
    availableLocales,
    t,
    tp,
    te,
    setLocale,
    getMarkupRenderer: options.resolveMarkupRenderer,
    resolveMessage
  };
}
