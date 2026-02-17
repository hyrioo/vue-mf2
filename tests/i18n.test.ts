import { Mf2Bundle, createMf2, defineStringFunction, useMf2 } from '../src/index';
import type { MessageFunctionContext } from 'messageformat/functions';

function stripBidiIsolation(value: string): string {
  return value.replace(/\u2068|\u2069/g, '');
}

describe('createMf2', () => {
  it('translates keys with args', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [new Mf2Bundle('en-US').addResource({ greeting: 'Hello {$name}' })]
    });

    expect(stripBidiIsolation(mf2.global.t('greeting', { name: 'Ada' }))).toBe('Hello Ada');
  });

  it('returns key when translation is missing', () => {
    const mf2 = createMf2({ locale: 'en-US', bundles: [new Mf2Bundle('en-US')] });

    expect(mf2.global.t('unknown.key')).toBe('unknown.key');
    expect(mf2.global.te('unknown.key')).toBe(false);
  });

  it('can switch locale', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [
        new Mf2Bundle('en-US').addResource({ title: 'Hello' }),
        new Mf2Bundle('fr-FR').addResource({ title: 'Bonjour' })
      ]
    });

    expect(mf2.global.t('title')).toBe('Hello');

    mf2.global.setLocale('fr-FR');
    expect(mf2.global.t('title')).toBe('Bonjour');
  });

  it('falls back to raw message when format parsing fails', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [new Mf2Bundle('en-US').addResource({ broken: 'Hello {' })]
    });

    expect(mf2.global.t('broken', { name: 'Ada' })).toBe('Hello {');
  });

  it('resolves useMf2() outside setup after plugin installation', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [new Mf2Bundle('en-US').addResource({ greeting: 'Hello {$name}' })]
    });

    const fakeApp = {
      provide: () => undefined,
      component: () => undefined
    };

    mf2.install(fakeApp as never);

    const { $t } = useMf2();
    expect(stripBidiIsolation($t('greeting', { name: 'Ada' }))).toBe('Hello Ada');
  });
});

it('supports createMf2 + Mf2Bundle', () => {
  const enUS = new Mf2Bundle('en-US').addResource({ 'home.greeting': 'Hello {$name}' });
  const frFR = new Mf2Bundle('fr-FR').addResource({ 'home.greeting': 'Bonjour {$name}' });

  const mf2 = createMf2({
    locale: 'en-US',
    bundles: [enUS, frFR]
  });

  expect(stripBidiIsolation(mf2.global.t('home.greeting', { name: 'Ada' }))).toBe('Hello Ada');

  mf2.global.setLocale('fr-FR');
  expect(stripBidiIsolation(mf2.global.t('home.greeting', { name: 'Ada' }))).toBe('Bonjour Ada');
});

describe('$tp', () => {
  it('returns structured parts for interpolation and markup messages', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [
        new Mf2Bundle('en-US').addResource({
          greeting: 'Hello {$name}',
          help: 'Need help? {#helpLink}Open docs{/helpLink}'
        })
      ]
    });

    const { $t, $tp, locale } = useMf2(mf2);
    expect(stripBidiIsolation($t('greeting', { name: 'Ada' }))).toBe('Hello Ada');
    expect(locale.value).toBe('en-US');

    const greetingParts = $tp('greeting', { name: 'Ada' }) as Array<Record<string, unknown>>;
    expect(greetingParts.length).toBeGreaterThan(0);
    expect(greetingParts.some((part) => part.value === 'Ada')).toBe(true);

    const helpParts = $tp('help') as Array<Record<string, unknown>>;
    const openToken = helpParts.find((part) => part.type === 'markup' && part.kind === 'open' && part.name === 'helpLink');
    const closeToken = helpParts.find((part) => part.type === 'markup' && part.kind === 'close' && part.name === 'helpLink');
    expect(openToken).toBeTruthy();
    expect(closeToken).toBeTruthy();
  });

  it('returns an empty array for missing keys', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [new Mf2Bundle('en-US').addResource({})]
    });

    const { $tp } = useMf2(mf2);
    expect($tp('missing.key')).toEqual([]);
  });
});

describe('custom markups', () => {
  it('allows overriding built-ins and adding new markups', () => {
    const customBold = ({ children }: { children: unknown[] }) => children.join('');
    const customUnderline = ({ children }: { children: unknown[] }) => children.join('');

    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [new Mf2Bundle('en-US').addResource({ greeting: 'Hello {$name}' })],
      markups: {
        bold: customBold,
        underline: customUnderline
      }
    });

    expect(mf2.global.getMarkupRenderer('bold')).toBe(customBold);
    expect(mf2.global.getMarkupRenderer('underline')).toBe(customUnderline);
    expect(typeof mf2.global.getMarkupRenderer('link')).toBe('function');
  });

  it('provides additional built-in markups by default', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [new Mf2Bundle('en-US')]
    });

    expect(typeof mf2.global.getMarkupRenderer('underline')).toBe('function');
    expect(typeof mf2.global.getMarkupRenderer('code')).toBe('function');
    expect(typeof mf2.global.getMarkupRenderer('mark')).toBe('function');
  });

});

describe('functions', () => {
  it('supports custom functions via createMf2 options', () => {
    const uppercase = (ctx: MessageFunctionContext, _options: Record<string, unknown>, input?: unknown) => {
      const value = String(input ?? '').toUpperCase();
      const locale = ctx.locales[0] ?? 'en-US';

      return {
        type: 'string' as const,
        dir: ctx.dir ?? 'auto',
        toParts: () => [{ type: 'string' as const, locale, value }],
        toString: () => value,
        valueOf: () => value
      };
    };

    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [
        new Mf2Bundle('en-US').addResource({
          loud_name: 'User: {$name :uppercase}'
        })
      ],
      functions: {
        uppercase
      }
    });

    expect(stripBidiIsolation(mf2.global.t('loud_name', { name: 'Ada' }))).toBe('User: ADA');
    const parts = mf2.global.tp('loud_name', { name: 'Ada' }) as Array<Record<string, unknown>>;
    expect(parts.some((part) => part.type === 'string' && part.value === 'ADA')).toBe(true);
  });

  it('supports :string function with .match selection', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [
        new Mf2Bundle('en-US').addResource({
          status_message: `.input {$status :string}
.match $status
ok {{Success}}
fail {{Failure}}
* {{Unknown}}`
        })
      ]
    });

    expect(mf2.global.t('status_message', { status: 'ok' })).toBe('Success');
    expect(mf2.global.t('status_message', { status: 'fail' })).toBe('Failure');
    expect(mf2.global.t('status_message', { status: 'pending' })).toBe('Unknown');
  });

  it('supports custom functions via defineStringFunction helper', () => {
    const uppercase = defineStringFunction((input) => String(input ?? '').toUpperCase());

    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [
        new Mf2Bundle('en-US').addResource({
          loud_name: 'User: {$name :uppercase}'
        })
      ],
      functions: {
        uppercase
      }
    });

    expect(stripBidiIsolation(mf2.global.t('loud_name', { name: 'Ada' }))).toBe('User: ADA');
    const parts = mf2.global.tp('loud_name', { name: 'Ada' }) as Array<Record<string, unknown>>;
    expect(parts.some((part) => part.type === 'string' && part.value === 'ADA')).toBe(true);
  });

  it('supports :number function with exact selection', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [
        new Mf2Bundle('en-US').addResource({
          item_count: `.input {$count :number select=exact}
.match $count
1 {{One item}}
* {{Many items}}`
        })
      ]
    });

    expect(mf2.global.t('item_count', { count: 1 })).toBe('One item');
    expect(mf2.global.t('item_count', { count: 2 })).toBe('Many items');
  });

  it('returns parts for function-based messages through $tp', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [
        new Mf2Bundle('en-US').addResource({
          item_count: `.input {$count :number select=exact}
.match $count
1 {{One item}}
* {{Many items}}`
        })
      ]
    });

    const { $tp } = useMf2(mf2);
    const parts = $tp('item_count', { count: 1 }) as Array<Record<string, unknown>>;
    expect(parts.length).toBeGreaterThan(0);
    expect(parts.some((part) => part.value === 'One item')).toBe(true);
  });

  it('formats dates with :datetime', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [
        new Mf2Bundle('en-US').addResource({
          date_label: 'Today is {$date :datetime dateStyle=medium}.'
        })
      ]
    });

    const output = stripBidiIsolation(mf2.global.t('date_label', { date: new Date('2026-02-14T12:34:56Z') }));
    expect(output).not.toContain('{$date}');
    expect(output).toContain('Today is');
  });

  it('returns datetime parts for :datetime function', () => {
    const mf2 = createMf2({
      locale: 'en-US',
      bundles: [
        new Mf2Bundle('en-US').addResource({
          date_label: 'Today is {$date :datetime dateStyle=medium}.'
        })
      ]
    });

    const { $tp } = useMf2(mf2);
    const parts = $tp('date_label', { date: new Date('2026-02-14T12:34:56Z') }) as Array<Record<string, unknown>>;
    const hasDatetimePart = parts.some((part) => part.type === 'datetime');
    expect(hasDatetimePart).toBe(true);
  });
});
