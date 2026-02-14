# Functions

MessageFormat functions are used through annotations in expressions, for example:

```mf2
Today is {$date :datetime weekday=long}.
```

In MF2, functions are generally used in two ways:

- Formatting functions: format a value for output in text.
- Selector functions: help `.match` choose a variant.

## Common built-ins

## `:number`

Formatting:

```mf2
{$value :number notation=scientific}
{$value :number style=percent}
```

`12345` with `notation=scientific`:
<Mf2Preview message="{$value :number notation=scientific}" :args="{ value: 12345 }" />

`0.42` with `style=percent`:
<Mf2Preview message="{$value :number style=percent}" :args="{ value: 0.42 }" />

Selection:

```mf2
.input {$count :number}
.match $count
one  {{One item}}
*    {{Many items}}
```

You can also change selection behavior with options like `select=exact` or `select=ordinal`.

## `:integer`

Like `:number`, but treated as integer-oriented formatting.

```mf2
{$value :integer}
```

`42.9` (locale formatting applies):
<Mf2Preview message="{$value :integer}" :args="{ value: 42.9 }" />

## `:string`

Useful for exact string matching:

```mf2
.input {$status :string}
.match $status
ok   {{Success}}
fail {{Failure}}
*    {{Unknown}}
```

`status=ok`:
<Mf2Preview :message="'.input {$status :string}\\n.match $status\\nok {{Success}}\\nfail {{Failure}}\\n* {{Unknown}}'" :args="{ status: 'ok' }" />
`status=fail`:
<Mf2Preview :message="'.input {$status :string}\\n.match $status\\nok {{Success}}\\nfail {{Failure}}\\n* {{Unknown}}'" :args="{ status: 'fail' }" />
`status=pending`:
<Mf2Preview :message="'.input {$status :string}\\n.match $status\\nok {{Success}}\\nfail {{Failure}}\\n* {{Unknown}}'" :args="{ status: 'pending' }" />

## Date functions

`vue-mf2` includes MessageFormat `DraftFunctions`, so date functions are available out of the box.

## `:date`

Formats date-only output.

```mf2
Today is {$value :date dateStyle=long}.
```

<Mf2Preview message="Today is {$value :date dateStyle=long}." :args="{ value: new Date('2026-02-14T12:34:56Z') }" />

Common options:

- `dateStyle`: `full`, `long`, `medium`, `short`
- `calendar`, `numberingSystem`, `timeZone`

## `:time`

Formats time-only output.

```mf2
Meeting starts at {$value :time timeStyle=short}.
```

<Mf2Preview message="Meeting starts at {$value :time timeStyle=short}." :args="{ value: new Date('2026-02-14T13:45:00Z') }" />

Common options:

- `timeStyle`: `full`, `long`, `medium`, `short`
- `hour12`, `hourCycle`, `timeZone`

## `:datetime`

Formats date and time together.

```mf2
Created at {$value :datetime dateStyle=medium timeStyle=short}.
```

<Mf2Preview message="Created at {$value :datetime dateStyle=medium timeStyle=short}." :args="{ value: new Date('2026-02-14T12:34:56Z') }" />

You can also use part-style options (instead of style presets), for example:

```mf2
{$value :datetime year=numeric month=long day=2-digit hour=2-digit minute=2-digit}
```

## Function options

Each function has its own options and valid operand types. If an operand cannot be parsed/handled by the function, formatting can fail and runtime-specific fallback behavior applies.

## Render examples

## Render with `$t` in script/template

```vue
<script setup lang="ts">
import { useMf2 } from 'vue-mf2';

const { $t } = useMf2();
const now = new Date('2026-02-14T12:34:56Z');
</script>

<template>
  <p>{{ $t('date_label', { value: now }) }}</p>
  <p>{{ $t('time_label', { value: now }) }}</p>
  <p>{{ $t('datetime_label', { value: now }) }}</p>
</template>
```

Example messages:

```json
{
  "date_label": "Today is {$value :date dateStyle=long}.",
  "time_label": "Current time: {$value :time timeStyle=short}.",
  "datetime_label": "Created at {$value :datetime dateStyle=medium timeStyle=short}."
}
```

## Render with `Mf2T`

`Mf2T` also works with function-based messages.

```vue
<script setup lang="ts">
const now = new Date('2026-02-14T12:34:56Z');
</script>

<template>
  <Mf2T keypath="datetime_label" :args="{ value: now }" tag="p" />
</template>
```

## In `vue-mf2`

`vue-mf2` uses the underlying `messageformat` runtime for function behavior. That means function support and option behavior are defined by MF2/runtime semantics, not custom logic in this package.

For custom function registration, see [Custom Functions](./custom-functions.md).

For full function details, see the official MF2 reference:

- https://messageformat.unicode.org/docs/reference/functions/
