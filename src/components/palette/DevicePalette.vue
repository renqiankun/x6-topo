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
  color: #8ba3c7;
  font-weight: 700;
}

.palette-group__items {
  display: grid;
  gap: 8px;
}

.palette-item {
  border: 1px solid #1d2a44;
  background: #0f1b2f;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.palette-item:hover {
  border-color: #00d4ff;
  background: #11233d;
}

.palette-item__label {
  display: block;
  color: #d7e6ff;
  font-weight: 600;
}

.palette-item__type {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #7c94b5;
}
</style>
