<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LobbyView from '@/views/LobbyView.vue'
import SessionView from '@/views/SessionView.vue'
import { fetchSession } from '@/lib/session'

const code = ref<string | null>(null)
const title = ref<string | null>(null)
const bootError = ref('')

onMounted(async () => {
  const boot = new URL(location.href).searchParams.get('code')
  if (!boot) return
  try {
    const session = await fetchSession(boot.trim().toUpperCase())
    code.value = session.code
    title.value = session.title
  } catch {
    bootError.value = 'Could not open that session code.'
  }
})

function onJoined(payload: { code: string; title: string | null }) {
  code.value = payload.code
  title.value = payload.title
  bootError.value = ''
  const url = new URL(location.href)
  url.searchParams.set('code', payload.code)
  history.replaceState(null, '', url)
}

function onLeave() {
  code.value = null
  title.value = null
  const url = new URL(location.href)
  url.searchParams.delete('code')
  history.replaceState(null, '', url)
}
</script>

<template>
  <div class="app-shell">
    <p v-if="bootError" class="boot-error">{{ bootError }}</p>
    <LobbyView v-if="!code" @joined="onJoined" />
    <SessionView
      v-else
      :code="code"
      :title="title"
      @leave="onLeave"
    />
  </div>
</template>

<style scoped>
.boot-error {
  color: var(--bad);
  margin: 0 0 12px;
}
</style>
