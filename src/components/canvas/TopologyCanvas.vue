<template>
  <div class="topology-canvas">
    <CanvasToolbar
      :node-count="nodeCount"
      :edge-count="edgeCount"
      :zoom-pct="zoomPct"
      :mouse-pos="mousePos"
      @undo="emit('undo')"
      @redo="emit('redo')"
      @copy="emit('copy')"
      @paste="emit('paste')"
      @delete="emit('delete')"
      @group="emit('group')"
      @ungroup="emit('ungroup')"
      @select-all="emit('selectAll')"
      @zoom-in="emit('zoomIn')"
      @zoom-out="emit('zoomOut')"
      @fit="emit('fit')"
      @center="emit('center')"
      @demo="emit('demo')"
      @clear="emit('clear')"
      @export="emit('export')"
      @import="emit('import')"
    />
    <div ref="containerRef" class="topology-canvas__container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CanvasToolbar from './CanvasToolbar.vue'

defineProps<{
  nodeCount: number
  edgeCount: number
  zoomPct: number
  mousePos: { x: number; y: number }
}>()

const emit = defineEmits<{
  ready: [container: HTMLDivElement]
  undo: []
  redo: []
  copy: []
  paste: []
  delete: []
  group: []
  ungroup: []
  selectAll: []
  zoomIn: []
  zoomOut: []
  fit: []
  center: []
  demo: []
  clear: []
  export: []
  import: []
}>()

const containerRef = ref<HTMLDivElement>()

onMounted(() => {
  if (containerRef.value) emit('ready', containerRef.value)
})
</script>

<style scoped>
.topology-canvas {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0a1220;
  border: 1px solid #1d2a44;
  border-radius: 14px;
  overflow: hidden;
}

.topology-canvas__container {
  flex: 1;
  min-height: 640px;
}
</style>
