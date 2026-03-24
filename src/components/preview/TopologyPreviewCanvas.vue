<template>
  <div class="preview-canvas-wrap">
    <div ref="containerRef" class="preview-canvas"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { defaultCanvasProps } from '../../constants/defaults'
import { applyPreviewData, type PreviewRuntimePayload } from '../../services/previewDataApplier'
import { createGraph, setCanvasProps } from '../../services/x6GraphService'
import type { CanvasProps } from '../../types/graph'

type TopologyInput = string | Record<string, unknown> | null
type RuntimeInput = string | Record<string, unknown> | null

interface ParsedTopology {
  graph: Record<string, unknown>
  canvas: CanvasProps
}

const props = defineProps<{
  topologyJson: TopologyInput
  dataJson?: RuntimeInput
  autoCenter?: boolean
}>()

const emit = defineEmits<{
  error: [message: string]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const graphRef = ref<ReturnType<typeof createGraph> | null>(null)

function normalizeObject(input: string | Record<string, unknown>): Record<string, unknown> {
  if (typeof input === 'string') {
    const raw = input.trim()
    if (!raw) return {}
    // Support JSONC style comments and trailing commas in preview input.
    const jsonLike = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|\s)\/\/.*$/gm, '')
      .replace(/,\s*([}\]])/g, '$1')
    const parsed = JSON.parse(jsonLike)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid JSON object')
    }
    return parsed as Record<string, unknown>
  }
  return input
}

function parseTopology(input: TopologyInput): ParsedTopology {
  if (!input) throw new Error('Missing topologyJson')
  const parsed = normalizeObject(input)

  if (Array.isArray((parsed as any).cells)) {
    return { graph: parsed, canvas: { ...defaultCanvasProps } }
  }

  const graphJson = (parsed as any).graph
  if (!graphJson || !Array.isArray(graphJson.cells)) {
    throw new Error('Invalid topology JSON, expected graph.cells')
  }

  return {
    graph: graphJson,
    canvas: { ...defaultCanvasProps, ...((parsed as any).canvas || {}) },
  }
}

function parseRuntime(input: RuntimeInput): PreviewRuntimePayload {
  if (!input) return {}
  return normalizeObject(input) as PreviewRuntimePayload
}

function ensureGraph() {
  if (graphRef.value || !containerRef.value) return
  graphRef.value = createGraph(containerRef.value, defaultCanvasProps, { previewMode: true })
}

function render() {
  const graph = graphRef.value
  if (!graph) return

  try {
    const topology = parseTopology(props.topologyJson)
    graph.clearCells()
    graph.fromJSON(topology.graph)
    setCanvasProps(graph as any, { ...topology.canvas, panning: true, mousewheel: true })
    applyPreviewData(graph as any, parseRuntime(props.dataJson || null))
    if (props.autoCenter !== false) graph.centerContent()
    emit('error', '')
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Preview render failed')
  }
}

watch(
  () => [props.topologyJson, props.dataJson],
  () => render(),
  { deep: true },
)

onMounted(() => {
  ensureGraph()
  render()
})

onBeforeUnmount(() => {
  graphRef.value?.dispose()
  graphRef.value = null
})
</script>

<style scoped>
.preview-canvas-wrap {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border: 1px solid #22406a;
  border-radius: 12px;
  overflow: hidden;
  background: #081223;
}

.preview-canvas {
  width: 100%;
  height: 100%;
  min-height: 420px;
}
</style>
