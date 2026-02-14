# Markups

`vue-mf2` supports built-in markups and custom markups via `createMf2({ markups })`.

## Built-in markups

### `bold`

Message:

```json
{
  "label": "Please {#bold}read this{/bold}."
}
```

Default render: `<strong>...</strong>`

<Mf2Preview message="Please {#bold}read this{/bold}." />

### `italic`

Message:

```json
{
  "label": "This is {#italic}important{/italic}."
}
```

Default render: `<em>...</em>`

<Mf2Preview message="This is {#italic}important{/italic}." />

### `link`

Message:

```json
{
  "help": "Need help? {#link to=|/help|}Open docs{/link}"
}
```

Default render: `<a :href="options.to">...</a>` (falls back to `#`)

<Mf2Preview message="Need help? {#link to=|/help|}Open docs{/link}" />

### `underline`

Message:

```json
{
  "label": "Use {#underline}underlined{/underline} text."
}
```

Default render: `<u>...</u>`

<Mf2Preview message="Use {#underline}underlined{/underline} text." />

### `code`

Message:

```json
{
  "label": "Run {#code}npm run build{/code}."
}
```

Default render: `<code>...</code>`

<Mf2Preview message="Run {#code}npm run build{/code}." />

### `mark`

Message:

```json
{
  "label": "This is {#mark}highlighted{/mark}."
}
```

Default render: `<mark>...</mark>`

<Mf2Preview message="This is {#mark}highlighted{/mark}." />

## Override built-ins

You can override any built-in markup name.

```ts
import { createMf2, Mf2Bundle } from 'vue-mf2';

const mf2 = createMf2({
  locale: 'en-US',
  bundles: [new Mf2Bundle('en-US').addResource({ text: 'Use {#bold}brand{/bold} style.' })],
  markups: {
    bold: ({ children }) => <span class="brand-bold">{children}</span>
  }
});
```

<Mf2Preview message="Use {#bold}brand{/bold} style.">
  <template #bold="{ value }">
    <span class="brand-bold">{{ value }}</span>
  </template>
</Mf2Preview>

## Add custom markups

Use any new markup name in messages and provide a renderer in `markups`.

```ts
import { createMf2, Mf2Bundle, type MarkupRenderer } from 'vue-mf2';

const pill: MarkupRenderer = ({ children }) => <span class="pill-markup">{children}</span>;

const mf2 = createMf2({
  locale: 'en-US',
  bundles: [
    new Mf2Bundle('en-US').addResource({
      text: 'Custom {#pill}markup{/pill} works.'
    })
  ],
  markups: {
    pill
  }
});
```

<Mf2Preview message="Custom {#pill}markup{/pill} works.">
  <template #pill="{ value }">
    <span class="pill-markup">{{ value }}</span>
  </template>
</Mf2Preview>

## Slots vs renderers

- Use `markups` when you want global rendering behavior by markup name.
- Use `<mf2-t>` slots when you want per-call/per-component rendering behavior.
- See [Message Parts](./message-parts.md) for slot-based rich message rendering examples.
