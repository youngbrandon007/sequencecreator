<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'primary', type: 'button', disabled: false },
)
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="{
      'btn-secondary': variant === 'secondary',
      'btn-ghost': variant === 'ghost',
    }"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
