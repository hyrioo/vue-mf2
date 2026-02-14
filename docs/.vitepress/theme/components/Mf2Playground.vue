<template>
  <section class="mf2-playground">
    <h2>MF2 Playground</h2>

    <div class="controls">
      <label>
        Locale
        <select v-model="locale">
          <option v-for="value in availableLocales" :key="value" :value="value">{{ value }}</option>
        </select>
      </label>

      <label>
        Message key
        <select v-model="keypath">
          <option v-for="value in keys" :key="value" :value="value">{{ value }}</option>
        </select>
      </label>

      <label>
        Name arg
        <input v-model="name" type="text" />
      </label>
    </div>

    <div class="output">
      <p><strong>Exists:</strong> {{ exists }}</p>
      <p><strong>Output:</strong> {{ output }}</p>
      <pre>{{ partsJson }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Mf2Bundle, createMf2, useMf2 } from '../../../../src';

const mf2 = createMf2({
  locale: 'en-US',
  bundles: [
    new Mf2Bundle('en-US').addResource({
      'home.greeting': 'Hello {$name}',
      'home.support': 'Need help? {#helpLink}Open docs{/helpLink}'
    }),
    new Mf2Bundle('fr-FR').addResource({
      'home.greeting': 'Bonjour {$name}',
      'home.support': 'Besoin d\'aide ? {#helpLink}Ouvrir la doc{/helpLink}'
    })
  ]
});

const { $t, $tp, $te, locale, availableLocales } = useMf2(mf2);
const keypath = ref('home.greeting');
const name = ref('Ada');
const keys = ['home.greeting', 'home.support', 'missing.key'];

const args = computed(() => ({ name: name.value }));
const output = computed(() => $t(keypath.value, args.value));
const exists = computed(() => $te(keypath.value));
const partsJson = computed(() => JSON.stringify($tp(keypath.value, args.value), null, 2));
</script>

<style scoped>
.mf2-playground {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
}

.controls {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

select,
input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 8px;
}

.output {
  margin-top: 16px;
}

pre {
  margin-top: 12px;
  border-radius: 8px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}
</style>
