# Custom Functions

You can register custom functions in `createMf2({ functions })`.

## Option A: helper API (`defineStringFunction`)

Use this for simple string output transforms.

```ts
import { createMf2, defineStringFunction, Mf2Bundle } from 'vue-mf2';

const uppercase = defineStringFunction((input) => String(input ?? '').toUpperCase());

const mf2 = createMf2({
  locale: 'en-US',
  bundles: [
    new Mf2Bundle('en-US').addResource({
      loud_name: 'User: {$name :uppercase}'
    })
  ],
  functions: { uppercase }
});
```

Preview:

<Mf2Preview message="User: {$name :uppercase}" :args="{ name: 'Ada' }" />

## Option B: full MessageFormat function

Use this when you need full control over parts, locale handling, or selection behavior.

```ts
import { createMf2, Mf2Bundle, type Mf2Functions } from 'vue-mf2';
import type { MessageFunctionContext } from 'messageformat/functions';

const uppercase: Mf2Functions['uppercase'] = (
  ctx: MessageFunctionContext,
  _options,
  input
) => {
  const value = String(input ?? '').toUpperCase();
  const locale = ctx.locales[0] ?? 'en-US';

  return {
    type: 'string',
    dir: ctx.dir ?? 'auto',
    toParts: () => [{ type: 'string', locale, value }],
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
  functions: { uppercase }
});
```

## Notes

- `functions` extend the built-ins (`DraftFunctions`) already included by `vue-mf2`.
- Prefer `defineStringFunction` unless you need custom parts or selector behavior.
