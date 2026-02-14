# Message parts

`<mf2-t>` can render rich messages with slots, including placeholders and markup spans.

<Mf2TMessagePartsDemo />

Example shape:

```json
{
  "help_and_support": "Have you {#bold}forgotten{/bold} your password? {#resetButton/} If you need more help, click {#helpLink}here{/helpLink} for more information."
}
```

```html
<mf2-t keypath="help_and_support" :args="{ name: 'Ada' }">
  <template #resetButton>
    <button>Reset password</button>
  </template>
  <template #helpLink="{ value }">
    <a href="#help">{{ value }}</a>
  </template>
</mf2-t>
```
