# vue-mf2

Lightweight Vue 3 i18n library powered by MessageFormat 2.

## Install

```bash
yarn add vue-mf2
```

```bash
npm install vue-mf2
```

Peer dependency: `vue@^3.4`

## Quick Start

```ts
import { createApp } from 'vue';
import App from './App.vue';
import { createMf2, Mf2Bundle } from 'vue-mf2';

const mf2 = createMf2({
  locale: 'en-US',
  bundles: [
    new Mf2Bundle('en-US').addResource({
      greeting: 'Hello {$name}'
    }),
    new Mf2Bundle('fr-FR').addResource({
      greeting: 'Bonjour {$name}'
    })
  ]
});

createApp(App).use(mf2).mount('#app');
```

```ts
import { useMf2 } from 'vue-mf2';

const { $t, locale } = useMf2();

$t('greeting', { name: 'Ada' }); // Hello Ada
locale.value = 'fr-FR';
$t('greeting', { name: 'Ada' }); // Bonjour Ada
```

## License

MIT
