import { type App, getCurrentInstance, inject, type InjectionKey, type Plugin } from 'vue';
import Mf2TComponent from './Mf2T';
import { createComposer, type MessageArgs, type MessageResolution, Mf2Bundle, type Mf2Composer, type Mf2Functions } from './mf2';
import { createMarkupRendererResolver, type CustomMarkupRegistry } from './markups';

export type Mf2Plugin = Plugin & {
  global: Mf2Composer;
};

export interface CreateMf2Options {
  locale: string;
  bundles: Mf2Bundle[];
  markups?: CustomMarkupRegistry;
  functions?: Mf2Functions;
}

export interface UseMf2Composer {
  locale: Mf2Composer['locale'];
  availableLocales: Mf2Composer['availableLocales'];
  $t: (key: string, args?: MessageArgs) => string;
  $tp: (key: string, args?: MessageArgs) => unknown[];
  $te: (key: string) => boolean;
}

const MF2_SYMBOL: InjectionKey<Mf2Composer> = Symbol('vue-mf2');
let installedComposer: Mf2Composer | null = null;

export function createMf2(options: CreateMf2Options): Mf2Plugin {
  const resolveMarkupRenderer = createMarkupRendererResolver(options.markups);
  const global = createComposer({
    locale: options.locale,
    bundles: options.bundles,
    resolveMarkupRenderer,
    functions: options.functions
  });

  return {
      global,
      install(app: App): void {
          installedComposer = global;
          app.provide(MF2_SYMBOL, global);
          app.component('Mf2T', Mf2TComponent);
      }
  };
}

function getComposer(mf2?: Mf2Plugin): Mf2Composer {
  if (mf2) {
    return mf2.global;
  }

  if (getCurrentInstance()) {
    const injected = inject(MF2_SYMBOL, null);
    if (injected) {
      return injected;
    }
  }

  if (installedComposer) {
    return installedComposer;
  }

  throw new Error('No MF2 instance found. Pass useMf2(mf2), or install the plugin before calling useMf2() outside setup().');
}

export function useMf2Composer(mf2?: Mf2Plugin): Mf2Composer {
  return getComposer(mf2);
}

export function useMf2(mf2?: Mf2Plugin): UseMf2Composer {
  const composer = useMf2Composer(mf2);

  return {
    locale: composer.locale,
    availableLocales: composer.availableLocales,
    $t: composer.t,
    $tp: composer.tp,
    $te: composer.te
  };
}

export type { MessageArgs, MessageResolution, Mf2Composer };
