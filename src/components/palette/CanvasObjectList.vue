<template>
  <div class="canvas-list">
    <SectionCard title="画布对象">
      <div class="canvas-list__stats">
        <span>总计 {{ items.length }}</span>
        <span>节点 {{ nodeCount }}</span>
        <span>连线 {{ edgeCount }}</span>
      </div>

      <div v-if="!items.length" class="canvas-list__empty">当前画布暂无对象</div>

      <div v-else class="canvas-list__items">
        <button
          v-for="item in items"
          :key="item.id"
          class="canvas-list__item"
          :class="{
            'is-active': selectedIds.includes(item.id),
            'is-hover': hoveredId === item.id,
          }"
          @mouseenter="emit('hover', item.id)"
          @mouseleave="emit('hover', null)"
          @click="emit('select', item.id)"
        >
          <span class="canvas-list__kind">{{ item.kind === 'node' ? 'N' : 'E' }}</span>
          <span class="canvas-list__label">{{ item.label || item.id }}</span>
          <span class="canvas-list__type">{{ item.type }}</span>
        </button>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CanvasListItem } from '../../types/graph'
import SectionCard from '../common/SectionCard.vue'

const props = defineProps<{
  items: CanvasListItem[]
  selectedIds: string[]
  hoveredId: string | null
}>()

const emit = defineEmits<{
  hover: [id: string | null]
  select: [id: string]
}>()

const nodeCount = computed(() => props.items.filter((item) => item.kind === 'node').length)
const edgeCount = computed(() => props.items.filter((item) => item.kind === 'edge').length)
</script>

<style scoped>
.canvas-list__stats {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #8fb7d8;
}

.canvas-list__empty {
  color: #7ea4c7;
  font-size: 12px;
  padding: 12px 4px;
}

.canvas-list__items {
  display: grid;
  gap: 6px;
}

.canvas-list__item {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  border: 1px solid #2b466f;
  background: rgba(12, 28, 48, 0.88);
  border-radius: 8px;
  padding: 8px;
  color: #d8ecff;
  cursor: pointer;
}

.canvas-list__item:hover,
.canvas-list__item.is-hover {
  border-color: #4fd3ff;
  background: rgba(18, 42, 72, 0.95);
}

.canvas-list__item.is-active {
  border-color: #36f0a5;
  box-shadow: 0 0 0 1px rgba(54, 240, 165, 0.45) inset;
}

.canvas-list__kind {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #3a5f89;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #8bc6ff;
  font-size: 11px;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}

.canvas-list__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.canvas-list__type {
  color: #78a4c8;
  font-size: 11px;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}
</style>

