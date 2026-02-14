
# Message parts

```json
{
    "help_and_support": "Have you forgotten your password?\n{resetButton}\nIf you need more help, click {#helpLink}here{/helpLink} for more information."
}
```
```html
<mf2-t keypath="help_and_support" :args="{name: 'Ada'}">
    <template #resetButton>
        <button>Reset password</button>
    </template>
    <template #helpLink="{$content}">
        <a href="#help">{{ $content }}</a>
    </template>
</mf2-t>
```
