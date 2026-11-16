<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import { createSession, fetchSession } from '@/lib/session'

const emit = defineEmits<{
  joined: [payload: { code: string; title: string | null }]
}>()

const title = ref('')
const joinCode = ref('')
const busy = ref(false)
const error = ref('')

async function onCreate() {
  busy.value = true
  error.value = ''
  try {
    const session = await createSession(title.value.trim() || undefined)
    emit('joined', { code: session.code, title: session.title })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not create session'
  } finally {
    busy.value = false
  }
}

async function onJoin() {
  busy.value = true
  error.value = ''
  try {
    const code = joinCode.value.trim().toUpperCase()
    const session = await fetchSession(code)
    emit('joined', { code: session.code, title: session.title })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not join session'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="lobby">
    <h1>Sequence Creator</h1>
    <p class="lede muted">
      Collaborative show sequencing. Create a session, share the code, and edit
      entries / show order together.
    </p>

    <div class="panel stack">
      <div class="row">
        <div class="grow">
          <label class="label" for="title">Session title (optional)</label>
          <input id="title" v-model="title" class="field" placeholder="Friday show" />
        </div>
        <div class="align-end">
          <AppButton :disabled="busy" @click="onCreate">Create session</AppButton>
        </div>
      </div>

      <div class="row">
        <div class="grow">
          <label class="label" for="join">Or join with code</label>
          <input
            id="join"
            v-model="joinCode"
            class="field"
            maxlength="8"
            placeholder="e.g. K7M2QX"
            @keydown.enter="onJoin"
          />
        </div>
        <div class="align-end">
          <AppButton variant="secondary" :disabled="busy" @click="onJoin">
            Join
          </AppButton>
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </section>
</template>

<style scoped>
.lobby h1 {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  margin-bottom: 8px;
}
.lede {
  margin: 0 0 24px;
  max-width: 36rem;
  line-height: 1.45;
}
.align-end {
  align-self: end;
}
.error {
  color: var(--bad);
  margin: 0;
}
</style>
