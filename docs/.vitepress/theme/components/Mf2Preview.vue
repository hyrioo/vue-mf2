<template>
  <div class="mf2-preview">
    <div class="mf2-preview__title">{{ title }}</div>
    <mf2-t :keypath="keypath" :args="args" :tag="tag" :instance="instance">
      <template v-for="(_, slotName) in slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>
    </mf2-t>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, useSlots } from 'vue';
import { Mf2Bundle, Mf2T, createMf2, defineStringFunction } from '../../../../src';

const props = withDefaults(
  defineProps<{
    message: string;
    keypath?: string;
    args?: Record<string, unknown>;
    tag?: string;
    title?: string;
    locale?: string;
  }>(),
  {
    keypath: 'preview',
    args: () => ({}),
    tag: 'p',
    title: 'Preview',
    locale: 'en-US'
  }
);

const slots = useSlots();
const instance = computed(() =>
  createMf2({
    locale: props.locale,
    bundles: [new Mf2Bundle(props.locale).addResource({ [props.keypath]: props.message })],
    functions: {
      uppercase: defineStringFunction((input) => String(input ?? '').toUpperCase())
    }
  })
);

const { keypath, args, tag, title } = toRefs(props);
</script>

<style scoped>
.mf2-preview {
  margin: 12px 0;
  padding: 20px 24px;
  border-radius: 8px;
  background: var(--vp-code-block-bg);
}

.mf2-preview__title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}

.mf2-preview :deep(p) {
  margin: 0;
}
</style>
