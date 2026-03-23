import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Graph } from '@antv/x6'
import type { CanvasProps, EdgeSelectionData, NodeSelectionData } from '../types/graph'
import { defaultCanvasProps } from '../constants/defaults'

export const useGraphStore = defineStore('graph', () => {
  const graph = ref<Graph | null>(null)
  const canvasProps = ref<CanvasProps>({ ...defaultCanvasProps })
  const selectedNode = ref<NodeSelectionData | null>(null)
  const selectedEdge = ref<EdgeSelectionData | null>(null)
  const isApplyingPatch = ref(false)
  const nodeCount = ref(0)
  const edgeCount = ref(0)
  const zoomPct = ref(100)
  const mousePos = ref({ x: 0, y: 0 })

  function setGraph(instance: Graph) {
    graph.value = instance
  }

  function setCanvasProps(payload: Partial<CanvasProps>) {
    canvasProps.value = { ...canvasProps.value, ...payload }
  }

  function setSelectedNode(node: NodeSelectionData | null) {
    selectedNode.value = node
    if (node) selectedEdge.value = null
  }

  function setSelectedEdge(edge: EdgeSelectionData | null) {
    selectedEdge.value = edge
    if (edge) selectedNode.value = null
  }

  function setStats(payload: Partial<{ nodeCount: number; edgeCount: number; zoomPct: number; mousePos: { x: number; y: number } }>) {
    if (typeof payload.nodeCount === 'number') nodeCount.value = payload.nodeCount
    if (typeof payload.edgeCount === 'number') edgeCount.value = payload.edgeCount
    if (typeof payload.zoomPct === 'number') zoomPct.value = payload.zoomPct
    if (payload.mousePos) mousePos.value = payload.mousePos
  }

  function clearSelection() {
    selectedNode.value = null
    selectedEdge.value = null
  }

  const selectedLabel = computed(() => selectedNode.value?.label ?? selectedEdge.value?.label ?? selectedEdge.value?.id ?? '画布')

  return {
    graph,
    canvasProps,
    selectedNode,
    selectedEdge,
    selectedLabel,
    isApplyingPatch,
    nodeCount,
    edgeCount,
    zoomPct,
    mousePos,
    setGraph,
    setCanvasProps,
    setSelectedNode,
    setSelectedEdge,
    setStats,
    clearSelection,
  }
})
