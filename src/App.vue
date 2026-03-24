<template>
  <EditorLayout
    :node-count="graphStore.nodeCount"
    :edge-count="graphStore.edgeCount"
    :zoom-pct="graphStore.zoomPct"
    :mouse-pos="graphStore.mousePos"
    :canvas-items="canvasItems"
    :selected-cell-ids="editorStore.selectedCellIds"
    :hovered-cell-id="hoveredCellId"
    @graph-ready="handleGraphReady"
    @add-device="handleAddDevice"
    @hover-cell="handleListHover"
    @select-cell="handleListSelect"
    @undo="handleUndo"
    @redo="handleRedo"
    @copy="handleCopy"
    @paste="handlePaste"
    @delete="handleDelete"
    @group="handleGroup"
    @ungroup="handleUngroup"
    @select-all="handleSelectAll"
    @zoom-in="handleZoomIn"
    @zoom-out="handleZoomOut"
    @fit="handleFit"
    @center="handleCenter"
    @demo="handleDemo"
    @clear="handleClear"
    @export="handleExport"
    @import="handleImport"
    @preview="handlePreview"
    @update-canvas="handleCanvasChange"
    @update-node-patch="handleNodePatch"
    @update-node-ports="handleNodePortsChange"
    @update-node-extra-attrs="handleNodeExtraAttrsChange"
    @update-edge-style="handleEdgeStyleChange"
    @update-edge-extra-attrs="handleEdgeExtraAttrsChange"
  />
  <TopologyPreviewDialog
    v-model="previewVisible"
    :topology-json="previewTopologyJson"
    :data-json="previewDataJson"
    @update:data-json="previewDataJson = $event"
  />
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Graph } from '@antv/x6'
import EditorLayout from './components/layout/EditorLayout.vue'
import TopologyPreviewDialog from './components/preview/TopologyPreviewDialog.vue'
import { useEditorStore } from './stores/editor'
import { useGraphStore } from './stores/graph'
import {
  addDeviceNode,
  bindGraphBaseEvents,
  bindGraphKeyboard,
  copy,
  createGraph,
  deleteCells,
  groupSelectedNodes,
  highlightSelection,
  paste,
  patchEdgeExtraAttrs,
  patchEdgeStyle,
  patchNodeMeta,
  patchNodePorts,
  patchNodeStyle,
  readEdgeSelection,
  readNodeSelection,
  redo,
  selectAll,
  setCanvasProps,
  syncDeviceIconSize,
  undo,
  ungroupNode,
} from './services/x6GraphService'
import { loadDemoTopology } from './services/demoTopology'
import { exportTopology, parseTopology } from './services/serializer'
import type { CanvasListItem, CanvasProps, EdgeSelectionData, NodeSelectionData, PortCountConfig, PortPositionConfig } from './types/graph'

const editorStore = useEditorStore()
const graphStore = useGraphStore()
const canvasItems = ref<CanvasListItem[]>([])
const hoveredCellId = ref<string | null>(null)
const previewVisible = ref(false)
const previewTopologyJson = ref('')
const previewDataJson = ref(`{
  // key = 设备或线的唯一标识（优先 runtimeId，也支持 cell.id）
  "DG-01": {
    "__comment": "设备常用字段",
    "label": "发电机1",
    "status": "running",
    "hide": false,
    "bgColor": "#062338",
    "borderColor": "#22c55e",
    "strokeWidth": 2,
    "fontColor": "#e0f0ff",
    "fontSize": 11,
    "showLabel": true,
    "opacity": 1
  },
  "LINE-01": {
    "__comment": "线常用字段",
    "label": "主干线A",
    "status": "running",
    "hide": false,
    "lineColor": "#38bdf8",
    "lineWidth": 2.5,
    "lineDash": "10 6",
    "lineAnim": true,
    "lineAnimSpeed": 2,
    "lineAnimDir": "forward",
    "opacity": 1
  }
}`)

function getGraph() {
  return graphStore.graph as Graph | null
}

function updateStats() {
  const graph = getGraph()
  if (!graph) return
  graphStore.setStats({
    nodeCount: graph.getNodes().length,
    edgeCount: graph.getEdges().length,
    zoomPct: Math.round(graph.zoom() * 100),
  })
  updateCanvasItems()
}

function updateCanvasItems() {
  const graph = getGraph()
  if (!graph) {
    canvasItems.value = []
    return
  }

  const nodes = graph.getNodes().map((node) => {
    const data = node.getData() || {}
    const label = String(data.label ?? node.attr('label/text') ?? node.id)
    return {
      id: node.id,
      kind: 'node' as const,
      label,
      type: String(data.deviceType || node.shape || 'node'),
    }
  })

  const edges = graph.getEdges().map((edge) => {
    const data = edge.getData() || {}
    const label = String(data.label ?? edge.getLabels()?.[0]?.attrs?.text?.text ?? edge.id)
    return {
      id: edge.id,
      kind: 'edge' as const,
      label,
      type: String(data.lineType || 'edge'),
    }
  })

  canvasItems.value = [...nodes, ...edges]
}

function syncSelectionByIds(ids: string[]) {
  const graph = getGraph()
  if (!graph) return

  applySelectionEffects(ids)

  if (!ids.length) {
    editorStore.setSelection('canvas', null, [])
    graphStore.clearSelection()
    return
  }

  if (ids.length > 1) {
    editorStore.setSelection('multi', null, ids)
    graphStore.clearSelection()
    return
  }

  const id = ids[0]
  const cell = graph.getCellById(id)
  if (!cell) {
    editorStore.setSelection('canvas', null, [])
    graphStore.clearSelection()
    return
  }

  if (cell.isNode()) {
    editorStore.setSelection('node', id, ids)
    graphStore.setSelectedNode(readNodeSelection(graph, id))
    return
  }

  if (cell.isEdge()) {
    editorStore.setSelection('edge', id, ids)
    graphStore.setSelectedEdge(readEdgeSelection(graph, id))
  }
}

function applySelectionEffects(selectedIds: string[]) {
  const graph = getGraph()
  if (!graph) return
  highlightSelection(graph, selectedIds)

  const hoverId = hoveredCellId.value
  if (!hoverId || selectedIds.includes(hoverId)) return
  const cell = graph.getCellById(hoverId)
  if (!cell) return

  if (cell.isNode()) {
    cell.attr('body/filter', 'drop-shadow(0 0 3px rgba(79,211,255,0.95)) drop-shadow(0 0 5px rgba(79,211,255,0.75))')
    return
  }

  if (cell.isEdge()) {
    cell.attr('line/filter', 'drop-shadow(0 0 3px rgba(79,211,255,1)) drop-shadow(0 0 5px rgba(79,211,255,0.85))')
  }
}

function currentSelectedIds() {
  if (editorStore.selectedCellIds.length) return [...editorStore.selectedCellIds]
  if (editorStore.selectedCellId) return [editorStore.selectedCellId]
  return []
}

function handleListHover(id: string | null) {
  hoveredCellId.value = id
  applySelectionEffects(currentSelectedIds())
}

function handleListSelect(id: string) {
  const graph = getGraph()
  if (!graph) return
  const cell = graph.getCellById(id)
  if (!cell) return
  graph.cleanSelection()
  graph.select(cell)
  syncSelectionByIds([id])
}

function withPatchSync(action: () => void) {
  graphStore.isApplyingPatch = true
  action()
  nextTick(() => {
    syncSelectionByIds(editorStore.selectedCellIds.length ? [...editorStore.selectedCellIds] : editorStore.selectedCellId ? [editorStore.selectedCellId] : [])
    graphStore.isApplyingPatch = false
  })
}

function bindCanvasDragDrop(graph: Graph, container: HTMLDivElement) {
  container.addEventListener('dragover', (event) => {
    event.preventDefault()
  })

  container.addEventListener('drop', (event) => {
    event.preventDefault()
    const type = event.dataTransfer?.getData('application/x-device-type') || event.dataTransfer?.getData('text/plain')
    if (!type) return
    const local = graph.clientToLocal(event.clientX, event.clientY)
    const node = addDeviceNode(graph, type, local.x - 35, local.y - 35)
    syncSelectionByIds([node.id])
    updateStats()
  })
}

function handleGraphReady(container: HTMLDivElement) {
  const graph = createGraph(container, graphStore.canvasProps)
  graphStore.setGraph(graph)

  bindGraphBaseEvents(graph, {
    onSelectionChanged: (ids) => syncSelectionByIds(ids),
    onNodeHoverPorts: () => {},
    onStatsChanged: updateStats,
    onMouseMove: (x, y) => graphStore.setStats({ mousePos: { x, y } }),
    onZoomChanged: (zoomPct) => graphStore.setStats({ zoomPct }),
  })

  bindGraphKeyboard(graph, {
    onDelete: handleDelete,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onCopy: handleCopy,
    onPaste: handlePaste,
    onGroup: handleGroup,
    onUngroup: handleUngroup,
    onSelectAll: handleSelectAll,
  })

  graph.on('blank:click', () => syncSelectionByIds([]))

  graph.on('node:change:size', ({ node }: any) => {
    syncDeviceIconSize(node)
  })

  graph.on('node:change:*', ({ node }: any) => {
    updateCanvasItems()
    if (!graphStore.isApplyingPatch && editorStore.selectedCellId === node.id) {
      graphStore.setSelectedNode(readNodeSelection(graph, node.id))
    }
  })

  graph.on('edge:change:*', ({ edge }: any) => {
    updateCanvasItems()
    if (!graphStore.isApplyingPatch && editorStore.selectedCellId === edge.id) {
      graphStore.setSelectedEdge(readEdgeSelection(graph, edge.id))
    }
  })

  bindCanvasDragDrop(graph, container)
  updateStats()
}

function handleAddDevice(type: string) {
  const graph = getGraph()
  if (!graph) return
  const area = graph.getGraphArea()
  const node = addDeviceNode(graph, type, area.width / 2 - 35, area.height / 2 - 35)
  syncSelectionByIds([node.id])
  updateStats()
}

function handleCanvasChange(value: CanvasProps) {
  const graph = getGraph()
  if (!graph) return
  graphStore.setCanvasProps(value)
  setCanvasProps(graph, value)
}

function handleNodePatch(value: Partial<NodeSelectionData>) {
  const graph = getGraph()
  const id = editorStore.selectedCellId
  if (!graph || !id) return

  const styleKeys: (keyof NodeSelectionData)[] = [
    'label',
    'x',
    'y',
    'width',
    'height',
    'fill',
    'stroke',
    'strokeWidth',
    'radius',
    'opacity',
    'fontSize',
    'fontColor',
    'labelPos',
    'showLabel',
  ]

  const stylePatch = Object.fromEntries(
    Object.entries(value).filter(([key]) => styleKeys.includes(key as keyof NodeSelectionData)),
  ) as Partial<NodeSelectionData>

  const metaPatch = Object.fromEntries(
    Object.entries(value).filter(([key]) => !styleKeys.includes(key as keyof NodeSelectionData)),
  ) as Partial<NodeSelectionData>

  withPatchSync(() => {
    if (Object.keys(stylePatch).length) patchNodeStyle(graph, id, stylePatch)
    if (Object.keys(metaPatch).length) patchNodeMeta(graph, id, metaPatch)
  })
}

function handleNodePortsChange(value: { portCounts: PortCountConfig; portList: PortPositionConfig[] }) {
  const graph = getGraph()
  const id = editorStore.selectedCellId
  if (!graph || !id) return
  withPatchSync(() => patchNodePorts(graph, id, value.portCounts, value.portList))
}

function handleNodeExtraAttrsChange(value: Record<string, any>) {
  const graph = getGraph()
  const id = editorStore.selectedCellId
  if (!graph || !id) return
  withPatchSync(() => patchNodeMeta(graph, id, { extraAttrs: value }))
}

function handleEdgeStyleChange(value: EdgeSelectionData) {
  const graph = getGraph()
  const id = graphStore.selectedEdge?.id || editorStore.selectedCellId
  if (!graph || !id) return
  withPatchSync(() => patchEdgeStyle(graph, id, value))
}

function handleEdgeExtraAttrsChange(value: Record<string, any>) {
  const graph = getGraph()
  const id = editorStore.selectedCellId
  if (!graph || !id) return
  withPatchSync(() => patchEdgeExtraAttrs(graph, id, value))
}

function handleUndo() {
  const graph = getGraph()
  if (!graph) return
  undo(graph)
  nextTick(() => updateStats())
}

function handleRedo() {
  const graph = getGraph()
  if (!graph) return
  redo(graph)
  nextTick(() => updateStats())
}

function handleCopy() {
  const graph = getGraph()
  if (!graph) return
  copy(graph, editorStore.selectedCellIds)
}

function handlePaste() {
  const graph = getGraph()
  if (!graph) return
  paste(graph)
  nextTick(() => updateStats())
}

function handleDelete() {
  const graph = getGraph()
  if (!graph) return
  deleteCells(graph, editorStore.selectedCellIds)
  syncSelectionByIds([])
  updateStats()
}

function handleGroup() {
  const graph = getGraph()
  if (!graph) return
  const group = groupSelectedNodes(graph, editorStore.selectedCellIds)
  if (group) {
    syncSelectionByIds([group.id])
    updateStats()
  }
}

function handleUngroup() {
  const graph = getGraph()
  if (!graph) return
  const id = editorStore.selectedCellId
  if (!id) return
  if (ungroupNode(graph, id)) {
    syncSelectionByIds([])
    updateStats()
  }
}

function handleSelectAll() {
  const graph = getGraph()
  if (!graph) return
  selectAll(graph)
  syncSelectionByIds(graph.getSelectedCells().map((cell) => cell.id))
}

function handleZoomIn() {
  const graph = getGraph()
  if (!graph) return
  graph.zoom(0.1)
}

function handleZoomOut() {
  const graph = getGraph()
  if (!graph) return
  graph.zoom(-0.1)
}

function handleFit() {
  const graph = getGraph()
  if (!graph) return
  graph.zoomToFit({ padding: 40, maxScale: 2 })
}

function handleCenter() {
  const graph = getGraph()
  if (!graph) return
  graph.centerContent()
}

function handleDemo() {
  const graph = getGraph()
  if (!graph) return
  loadDemoTopology(graph)
  syncSelectionByIds([])
  updateStats()
  ElMessage.success('示例拓扑已加载')
}

function handleClear() {
  const graph = getGraph()
  if (!graph) return
  graph.clearCells()
  syncSelectionByIds([])
  updateStats()
}

function downloadTextFile(name: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

function handleExport() {
  const graph = getGraph()
  if (!graph) return
  const json = exportTopology(graph, graphStore.canvasProps)
  downloadTextFile('topology.json', json)
  ElMessage.success('拓扑已导出')
}

function handlePreview() {
  const graph = getGraph()
  if (!graph) return
  previewTopologyJson.value = exportTopology(graph, graphStore.canvasProps)
  previewVisible.value = true
}

async function handleImport() {
  const graph = getGraph()
  if (!graph) return

  try {
    const { value } = await ElMessageBox.prompt('请粘贴拓扑 JSON', '导入拓扑', {
      inputType: 'textarea',
      inputPlaceholder: '请粘贴导出的 topology.json 内容',
      inputValidator: (input) => Boolean(input?.trim()) || '请输入 JSON 内容',
    })
    const payload = parseTopology(value)
    graph.fromJSON(payload.graph)
    graphStore.setCanvasProps(payload.canvas)
    setCanvasProps(graph, payload.canvas)
    syncSelectionByIds([])
    updateStats()
    ElMessage.success('导入成功')
  } catch (error: any) {
    if (error === 'cancel' || error?.action === 'cancel' || error?.action === 'close') return
    ElMessage.error(error?.message || '导入失败')
  }
}
</script>
