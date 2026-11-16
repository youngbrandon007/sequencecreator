<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  applyAutocomplete,
  autocompleteCandidates,
  joinPeople,
  splitPeople,
  tokenBounds,
} from '@/lib/people'

const props = defineProps<{
  modelValue: string[]
  roster: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const text = ref(joinPeople(props.modelValue))
const inputRef = ref<HTMLInputElement | null>(null)
const cycleIndex = ref(0)

watch(
  () => props.modelValue,
  (people) => {
    const joined = joinPeople(people)
    if (joined !== text.value) text.value = joined
  },
)

const hint = computed(() => {
  const el = inputRef.value
  const caret = el?.selectionStart ?? text.value.length
  const { token } = tokenBounds(text.value, caret)
  const matches = autocompleteCandidates(token, props.roster)
  if (!matches.length) return ''
  const pick = matches[cycleIndex.value % matches.length]!
  return `Tab → ${pick}`
})

function commitFromText() {
  emit('update:modelValue', splitPeople(text.value))
}

function onInput(event: Event) {
  const el = event.target as HTMLInputElement
  text.value = el.value
  cycleIndex.value = 0
  commitFromText()
}

async function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab') return
  const el = inputRef.value
  if (!el) return
  const caret = el.selectionStart ?? text.value.length
  const { token } = tokenBounds(text.value, caret)
  const matches = autocompleteCandidates(token, props.roster)
  if (!matches.length) return

  event.preventDefault()
  if (event.shiftKey) cycleIndex.value = Math.max(0, cycleIndex.value - 1)
  const pick = matches[cycleIndex.value % matches.length]!
  const next = applyAutocomplete(text.value, caret, pick, {
    trailingSeparator: true,
  })
  text.value = next.value
  commitFromText()
  cycleIndex.value = 0
  await nextTick()
  el.focus()
  el.setSelectionRange(next.caret, next.caret)
}
</script>

<template>
  <div class="people-wrap">
    <input
      ref="inputRef"
      class="field"
      :value="text"
      :placeholder="placeholder ?? 'person, person'"
      @input="onInput"
      @keydown="onKeydown"
      @blur="commitFromText"
    />
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.people-wrap {
  width: 100%;
}
.hint {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--muted);
}
</style>
