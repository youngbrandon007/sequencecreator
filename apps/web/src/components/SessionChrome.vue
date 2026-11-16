<script setup lang="ts">
defineProps<{
  code: string
  title: string | null
  status: string
  connected: boolean
}>()

defineEmits<{ leave: [] }>()
</script>

<template>
  <header class="chrome panel">
    <div>
      <div class="status">
        <span class="dot" :class="{ on: connected }" />
        <span>{{ status }}</span>
      </div>
      <p class="code">{{ code }}</p>
      <p class="muted title">{{ title || 'Untitled session' }}</p>
    </div>
    <button class="btn btn-secondary" type="button" @click="$emit('leave')">
      Leave
    </button>
  </header>
</template>

<style scoped>
.chrome {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 0.9rem;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bad);
}
.dot.on {
  background: var(--ok);
}
.code {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  letter-spacing: 0.16em;
  margin: 4px 0 0;
}
.title {
  margin: 4px 0 0;
  font-size: 0.9rem;
}
</style>
