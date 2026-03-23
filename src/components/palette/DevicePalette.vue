<template>
  <div class="palette">
    <SectionCard title="设备库">
      <div class="palette-list">
        <div v-for="cat in deviceCategories" :key="cat.name" class="palette-group">
          <div class="palette-group__title">{{ cat.name }}</div>
          <div class="palette-group__items">
            <button
              v-for="item in cat.devices"
              :key="item.type"
              class="palette-item"
              draggable="true"
              @dragstart="onDragStart($event, item.type)"
              @click="emit('add', item.type)"
            >
              <span class="palette-item__label">{{ item.label }}</span>
              <span class="palette-item__type">{{ item.type }}</span>
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import SectionCard from '../common/SectionCard.vue'
import { deviceCategories } from '../../constants/devices'

const emit = defineEmits<{ add: [type: string] }>()

function onDragStart(event: DragEvent, type: string) {
  event.dataTransfer?.setData('application/x-device-type', type)
  event.dataTransfer?.setData('text/plain', type)
  event.dataTransfer?.setDragImage(event.currentTarget as Element, 24, 24)
}
</script>

<style scoped>
.palette-list {
  display: grid;
  gap: 12px;
}

.palette-group {
  display: grid;
  gap: 8px;
}

.palette-group__title {
  font-size: 12px;
  color: #8fc0e8;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.palette-group__items {
  display: grid;
  gap: 8px;
}

.palette-item {
  border: 1px solid #28456d;
  background: linear-gradient(180deg, rgba(20, 39, 66, 0.9), rgba(13, 28, 49, 0.9));
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

.palette-item:hover {
  border-color: #43d8ff;
  background: linear-gradient(180deg, rgba(23, 48, 80, 0.95), rgba(14, 35, 61, 0.95));
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.3), 0 0 16px rgba(0, 212, 255, 0.2);
}

.palette-item__label {
  display: block;
  color: #e7f2ff;
  font-weight: 600;
}

.palette-item__type {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #7fb2d8;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}
</style>
