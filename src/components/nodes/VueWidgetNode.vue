<template>
  <div class="vue-widget">
    <div class="vue-widget__head">
      <span>Vue Component</span>
      <i class="vue-widget__dot"></i>
    </div>
    <div class="vue-widget__body">
      <div class="vue-widget__title">{{ labelText }}</div>
      <div class="vue-widget__meta">runtimeId: {{ runtimeIdText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  node: any
}>()

const labelText = ref('Vue组件节点')
const runtimeIdText = ref('-')

function syncFromNode() {
  const data = props.node?.getData?.() || {}
  console.log(data)
  labelText.value = String(data.label || 'Vue组件节点')
  runtimeIdText.value = String(data.runtimeId || '-')
}

function bindNodeEvents() {
  props.node?.on?.('change:data', syncFromNode)
  props.node?.on?.('change:attrs', syncFromNode)
}

function unbindNodeEvents() {
  props.node?.off?.('change:data', syncFromNode)
  props.node?.off?.('change:attrs', syncFromNode)
}

onMounted(() => {
  syncFromNode()
  bindNodeEvents()
})

onBeforeUnmount(() => {
  unbindNodeEvents()
})
</script>

<style scoped>
.vue-widget {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 1px solid #22d3ee;
  border-radius: 10px;
  background: linear-gradient(180deg, #10243f, #0a182c);
  color: #d7f6ff;
  font-family: 'Noto Sans SC', sans-serif;
  display: grid;
  grid-template-rows: 28px 1fr;
  overflow: hidden;
}

.vue-widget__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  background: rgba(34, 211, 238, 0.12);
  font-size: 12px;
  font-weight: 600;
}

.vue-widget__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
}

.vue-widget__body {
  padding: 8px 10px;
  display: grid;
  gap: 4px;
}

.vue-widget__title {
  font-size: 12px;
  font-weight: 700;
}

.vue-widget__meta {
  font-size: 11px;
  opacity: 0.82;
}
</style>
