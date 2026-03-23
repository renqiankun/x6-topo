<template>
  <div class="editor-layout">
    <aside class="editor-layout__left">
      <DevicePalette @add="emit('addDevice', $event)" />
    </aside>

    <main class="editor-layout__center">
      <TopologyCanvas
        :node-count="nodeCount"
        :edge-count="edgeCount"
        :zoom-pct="zoomPct"
        :mouse-pos="mousePos"
        @ready="emit('graphReady', $event)"
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
    </main>

    <aside class="editor-layout__right">
      <PropertyPanel
        @update:canvas="emit('updateCanvas', $event)"
        @update:node-patch="emit('updateNodePatch', $event)"
        @update:node-ports="emit('updateNodePorts', $event)"
        @update:node-extra-attrs="emit('updateNodeExtraAttrs', $event)"
        @update:edge-style="emit('updateEdgeStyle', $event)"
        @update:edge-extra-attrs="emit('updateEdgeExtraAttrs', $event)"
        @group="emit('group')"
        @delete="emit('delete')"
      />
    </aside>
  </div>
</template>

<script setup lang="ts">
import DevicePalette from '../palette/DevicePalette.vue'
import TopologyCanvas from '../canvas/TopologyCanvas.vue'
import PropertyPanel from '../properties/PropertyPanel.vue'
import type { CanvasProps, EdgeSelectionData, NodeSelectionData, PortCountConfig, PortPositionConfig } from '../../types/graph'

defineProps<{
  nodeCount: number
  edgeCount: number
  zoomPct: number
  mousePos: { x: number; y: number }
}>()

const emit = defineEmits<{
  addDevice: [type: string]
  graphReady: [container: HTMLDivElement]
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
  updateCanvas: [value: CanvasProps]
  updateNodePatch: [value: Partial<NodeSelectionData>]
  updateNodePorts: [value: { portCounts: PortCountConfig; portList: PortPositionConfig[] }]
  updateNodeExtraAttrs: [value: Record<string, any>]
  updateEdgeStyle: [value: EdgeSelectionData]
  updateEdgeExtraAttrs: [value: Record<string, any>]
}>()
</script>

<style scoped>
.editor-layout {
  height: 100vh;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 360px;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  background: #060d18;
}

.editor-layout__left,
.editor-layout__right {
  min-width: 0;
  overflow: auto;
  border: 1px solid #1d2a44;
  border-radius: 14px;
  padding: 12px;
  background: #0a1220;
}

.editor-layout__center {
  min-width: 0;
}

@media (max-width: 1280px) {
  .editor-layout {
    grid-template-columns: 240px minmax(0, 1fr) 320px;
  }
}
</style>
