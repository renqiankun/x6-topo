<template>
  <div class="property-panel">
    <div class="property-panel__title">当前对象：{{ graphStore.selectedLabel }}</div>

    <CanvasPropsForm
      v-if="editorStore.selectionKind === 'canvas'"
      :model-value="graphStore.canvasProps"
      @update:model-value="emit('update:canvas', $event)"
    />

    <NodePropsForm
      v-else-if="editorStore.selectionKind === 'node' && graphStore.selectedNode"
      :model-value="graphStore.selectedNode"
      @update:patch="emit('update:nodePatch', $event)"
      @update:ports="emit('update:nodePorts', $event)"
      @update:extra-attrs="emit('update:nodeExtraAttrs', $event)"
    />

    <EdgePropsForm
      v-else-if="editorStore.selectionKind === 'edge' && graphStore.selectedEdge"
      :model-value="graphStore.selectedEdge"
      @update:model-value="emit('update:edgeStyle', $event)"
      @update:extra-attrs="emit('update:edgeExtraAttrs', $event)"
    />

    <SectionCard v-else-if="editorStore.selectionKind === 'multi'" title="批量操作">
      <div class="multi-actions">
        <el-button size="small" @click="emit('group')">组合</el-button>
        <el-button size="small" @click="emit('delete')">删除</el-button>
      </div>
      <div class="multi-count">已选中 {{ editorStore.selectedCellIds.length }} 个对象</div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import CanvasPropsForm from './CanvasPropsForm.vue'
import EdgePropsForm from './EdgePropsForm.vue'
import NodePropsForm from './NodePropsForm.vue'
import SectionCard from '../common/SectionCard.vue'
import { useEditorStore } from '../../stores/editor'
import { useGraphStore } from '../../stores/graph'
import type { CanvasProps, EdgeSelectionData, NodeSelectionData, PortCountConfig, PortPositionConfig } from '../../types/graph'

const editorStore = useEditorStore()
const graphStore = useGraphStore()

const emit = defineEmits<{
  'update:canvas': [value: CanvasProps]
  'update:nodePatch': [value: Partial<NodeSelectionData>]
  'update:nodePorts': [value: { portCounts: PortCountConfig; portList: PortPositionConfig[] }]
  'update:nodeExtraAttrs': [value: Record<string, any>]
  'update:edgeStyle': [value: EdgeSelectionData]
  'update:edgeExtraAttrs': [value: Record<string, any>]
  group: []
  delete: []
}>()
</script>

<style scoped>
.property-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-panel__title {
  font-size: 13px;
  font-weight: 700;
  color: #b9dbff;
  letter-spacing: 0.04em;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #28466e;
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.13), rgba(0, 212, 255, 0.02));
}

.multi-actions {
  display: flex;
  gap: 8px;
}

.multi-count {
  margin-top: 10px;
  color: #8fb0d3;
  font-size: 12px;
}
</style>
