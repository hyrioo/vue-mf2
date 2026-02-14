<template>
  <section class="mf2t-demo">
    <Mf2T keypath="help_and_support" tag="p">
      <template #resetButton>
        <button class="reset-btn" type="button">Reset password</button>
      </template>
      <template #helpLink="{ value }">
        <a href="#help">{{ value }}</a>
      </template>
    </Mf2T>

    <details>
      <summary>Raw parts ($tp)</summary>
      <pre>{{ parts }}</pre>
    </details>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Mf2T, useMf2 } from '../../../../src';

const { $tp } = useMf2();
const parts = computed(() => JSON.stringify($tp('help_and_support'), null, 2));
</script>

<style scoped>
.mf2t-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
}

.reset-btn {
  margin: 0 6px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.reset-btn:hover {
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
}

pre {
  margin-top: 10px;
  border-radius: 8px;
  padding: 10px;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}
</style>
