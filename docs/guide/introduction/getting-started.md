# Getting Started

## Basic usage

```ts
import { createApp } from 'vue';
import App from './App.vue';
import { createMf2, Mf2Bundle } from 'vue-mf2';
import enUS from './locales/en-US.json';// {"home.greeting": "Hello {$name}", "home.goodbye": "Farewell {$name}"}
import frFR from './locales/fr-FR.json';// {"home.greeting": "Bonjour {$name}", "home.goodbye": "Hello {$name}"}

const enUSbundle = new Mf2Bundle('en-US');
enUSbundle.addResource(enUS);
const frFRbundle = new Mf2Bundle('fr-FR');
frFRbundle.addResource(frFR);
const mf2 = createMf2({
    locale: 'en-US',
    bundles: [enUSbundle, frFRbundle],
});

createApp(App).use(mf2).mount('#app');
```

Use in components:

```ts
import { useMf2 } from 'vue-mf2';

const { $t, locale } = useMf2();

console.log($t('home.greeting', { name: 'Ada' }));
// Hello Ada

locale.value = 'fr-FR';
console.log($t('home.greeting', { name: 'Ada' }));
// Bonjour Ada
```
