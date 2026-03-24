import type { Graph } from '@antv/x6'

type RuntimeStatus = 'running' | 'stopped' | 'fault' | 'maintenance' | 'alarm'
type RuntimeAnimDir = 'forward' | 'reverse'

export interface RuntimePatch {
  // Common
  label?: string
  hide?: boolean
  opacity?: number
  status?: RuntimeStatus
  data?: Record<string, unknown>

  // Node style aliases
  bgColor?: string
  fill?: string
  fillColor?: string
  borderColor?: string
  stroke?: string
  strokeColor?: string
  strokeWidth?: number
  borderWidth?: number
  radius?: number
  fontColor?: string
  fontSize?: number
  showLabel?: boolean

  // Node geometry (optional)
  x?: number
  y?: number
  width?: number
  height?: number

  // Edge style aliases
  lineColor?: string
  lineWidth?: number
  lineDash?: string
  lineOpacity?: number
  lineAnim?: boolean
  anim?: boolean
  lineAnimSpeed?: number
  speed?: number
  lineAnimDir?: RuntimeAnimDir
  dir?: RuntimeAnimDir

  [key: string]: unknown
}

export type PreviewRuntimePayload = Record<string, RuntimePatch>

type PatchHandler = (cell: any, value: unknown, patch: RuntimePatch) => void

const nodePatchHandlers: Record<string, PatchHandler> = {}
const edgePatchHandlers: Record<string, PatchHandler> = {}

function speedToDuration(speed: number) {
  return `${(3 / Math.max(0.3, speed)).toFixed(2)}s`
}

function toColor(value: unknown, fallback = '#00d4ff') {
  return typeof value === 'string' && value ? value : fallback
}

function toNumber(value: unknown, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function applyNodeStatus(node: any, statusRaw: unknown) {
  const status = String(statusRaw || 'running') as RuntimeStatus
  const data = node.getData() || {}
  const baseStroke = data.origStroke ?? node.attr('body/stroke') ?? '#00d4ff'
  const baseWidth = Number(data.origSw ?? node.attr('body/strokeWidth') ?? 2)

  const styleByStatus: Record<RuntimeStatus, { stroke: string; width: number; opacity: number; dash: string; filter: string }> = {
    running: { stroke: baseStroke, width: baseWidth, opacity: 1, dash: '', filter: '' },
    stopped: { stroke: '#7c8ba1', width: baseWidth, opacity: 0.6, dash: '6 4', filter: '' },
    maintenance: { stroke: '#f59e0b', width: baseWidth, opacity: 1, dash: '3 3', filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.55))' },
    fault: { stroke: '#ef4444', width: Math.max(baseWidth, 2), opacity: 1, dash: '', filter: 'drop-shadow(0 0 5px rgba(239,68,68,0.75))' },
    alarm: { stroke: '#fb7185', width: Math.max(baseWidth, 2), opacity: 1, dash: '8 4', filter: 'drop-shadow(0 0 5px rgba(251,113,133,0.72))' },
  }

  const style = styleByStatus[status] || styleByStatus.running
  node.attr('body/stroke', style.stroke)
  node.attr('body/strokeWidth', style.width)
  node.attr('body/opacity', style.opacity)
  node.attr('body/strokeDasharray', style.dash)
  node.attr('body/filter', style.filter)
}

function updateEdgeLabel(edge: any, label: string, color: string) {
  if (!label) {
    edge.setLabels([])
    return
  }

  edge.setLabels([
    {
      attrs: {
        text: { text: label, fill: color, fontSize: 10, fontFamily: 'Noto Sans SC,sans-serif' },
        rect: { fill: '#0a1220', stroke: color, strokeWidth: 1, rx: 3, ry: 3 },
      },
      position: { distance: 0.5 },
    },
  ])
}

function applyEdgeStatus(edge: any, statusRaw: unknown) {
  const status = String(statusRaw || 'running') as RuntimeStatus
  const data = edge.getData() || {}
  const line = edge.attr('line') || {}
  const baseColor = data.color ?? line.stroke ?? '#00d4ff'
  const baseWidth = Number(data.origSw ?? data.width ?? line.strokeWidth ?? 2)

  const styleByStatus: Record<RuntimeStatus, { color: string; width: number; dash: string; filter: string }> = {
    running: { color: baseColor, width: baseWidth, dash: '', filter: '' },
    stopped: { color: '#7c8ba1', width: baseWidth, dash: '8 5', filter: '' },
    maintenance: { color: '#f59e0b', width: baseWidth, dash: '4 3', filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.45))' },
    fault: { color: '#ef4444', width: Math.max(baseWidth, 2.5), dash: '', filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.7))' },
    alarm: { color: '#fb7185', width: Math.max(baseWidth, 2), dash: '10 6', filter: 'drop-shadow(0 0 5px rgba(251,113,133,0.7))' },
  }

  const style = styleByStatus[status] || styleByStatus.running
  edge.attr('line/stroke', style.color)
  edge.attr('line/strokeWidth', style.width)
  edge.attr('line/strokeDasharray', style.dash)
  edge.attr('line/filter', style.filter)
}

function applyEdgeAnimation(edge: any, enabled: boolean, patch: RuntimePatch) {
  const line = edge.attr('line') || {}
  const speed = toNumber(patch.lineAnimSpeed ?? patch.speed ?? edge.getData()?.speed, 2)
  const dir = (patch.lineAnimDir ?? patch.dir ?? edge.getData()?.dir) === 'reverse' ? 'reverse' : 'forward'
  if (enabled) {
    if (!patch.lineDash && !patch.dash && !line.strokeDasharray) edge.attr('line/strokeDasharray', '12 6')
    edge.attr('line/style', `animation:flow ${speedToDuration(speed)} linear ${dir === 'reverse' ? 'reverse' : 'normal'} infinite`)
  } else {
    edge.attr('line/style', 'animation:none')
  }
}

function registerBuiltInHandlers() {
  if (nodePatchHandlers.label) return

  nodePatchHandlers.label = (node, value, patch) => {
    const text = typeof value === 'string' ? value : ''
    const showLabel = typeof patch.showLabel === 'boolean' ? patch.showLabel : (node.getData()?.showLabel ?? true)
    node.setData({ ...(node.getData?.() || {}), label: text })
    node.attr('label/text', showLabel ? text : '')
  }
  nodePatchHandlers.hide = (node, value) => node.setVisible(!Boolean(value))
  nodePatchHandlers.opacity = (node, value) => node.attr('body/opacity', toNumber(value, 1))
  nodePatchHandlers.status = (node, value) => applyNodeStatus(node, value)
  nodePatchHandlers.bgColor = (node, value) => node.attr('body/fill', toColor(value, '#071830'))
  nodePatchHandlers.fill = nodePatchHandlers.bgColor
  nodePatchHandlers.fillColor = nodePatchHandlers.bgColor
  nodePatchHandlers.borderColor = (node, value) => node.attr('body/stroke', toColor(value))
  nodePatchHandlers.stroke = nodePatchHandlers.borderColor
  nodePatchHandlers.strokeColor = nodePatchHandlers.borderColor
  nodePatchHandlers.strokeWidth = (node, value) => node.attr('body/strokeWidth', toNumber(value, 2))
  nodePatchHandlers.borderWidth = nodePatchHandlers.strokeWidth
  nodePatchHandlers.radius = (node, value) => {
    const r = toNumber(value, 4)
    node.attr('body/rx', r)
    node.attr('body/ry', r)
  }
  nodePatchHandlers.fontColor = (node, value) => node.attr('label/fill', toColor(value, '#e0f0ff'))
  nodePatchHandlers.fontSize = (node, value) => node.attr('label/fontSize', toNumber(value, 11))
  nodePatchHandlers.showLabel = (node, value) => {
    const show = Boolean(value)
    const label = (typeof node.getData()?.label === 'string' ? node.getData()?.label : '')
      || (typeof node.attr('label/text') === 'string' ? node.attr('label/text') : '')
    node.attr('label/text', show ? String(label) : '')
  }
  nodePatchHandlers.x = (node, value, patch) => {
    const pos = node.position()
    node.setPosition(toNumber(value, pos.x), toNumber(patch.y, pos.y))
  }
  nodePatchHandlers.y = (node, value, patch) => {
    const pos = node.position()
    node.setPosition(toNumber(patch.x, pos.x), toNumber(value, pos.y))
  }
  nodePatchHandlers.width = (node, value, patch) => {
    const size = node.size()
    node.setSize(toNumber(value, size.width), toNumber(patch.height, size.height))
  }
  nodePatchHandlers.height = (node, value, patch) => {
    const size = node.size()
    node.setSize(toNumber(patch.width, size.width), toNumber(value, size.height))
  }

  edgePatchHandlers.label = (edge, value, patch) => {
    const line = edge.attr('line') || {}
    const color = toColor(patch.lineColor ?? patch.color ?? line.stroke)
    updateEdgeLabel(edge, String(value || ''), color)
  }
  edgePatchHandlers.hide = (edge, value) => edge.setVisible(!Boolean(value))
  edgePatchHandlers.opacity = (edge, value) => edge.attr('line/opacity', toNumber(value, 1))
  edgePatchHandlers.status = (edge, value) => applyEdgeStatus(edge, value)
  edgePatchHandlers.color = (edge, value) => edge.attr('line/stroke', toColor(value))
  edgePatchHandlers.lineColor = edgePatchHandlers.color
  edgePatchHandlers.bgColor = edgePatchHandlers.color
  edgePatchHandlers.stroke = edgePatchHandlers.color
  edgePatchHandlers.strokeColor = edgePatchHandlers.color
  edgePatchHandlers.width = (edge, value) => edge.attr('line/strokeWidth', toNumber(value, 2))
  edgePatchHandlers.lineWidth = edgePatchHandlers.width
  edgePatchHandlers.strokeWidth = edgePatchHandlers.width
  edgePatchHandlers.dash = (edge, value) => edge.attr('line/strokeDasharray', typeof value === 'string' ? value.trim() : '')
  edgePatchHandlers.lineDash = edgePatchHandlers.dash
  edgePatchHandlers.lineOpacity = (edge, value) => edge.attr('line/opacity', toNumber(value, 1))
  edgePatchHandlers.anim = (edge, value, patch) => applyEdgeAnimation(edge, Boolean(value), patch)
  edgePatchHandlers.lineAnim = edgePatchHandlers.anim
  edgePatchHandlers.speed = (edge, _value, patch) => {
    const line = edge.attr('line') || {}
    const isOn = typeof line.style === 'string' && line.style.includes('animation:flow')
    if (isOn) applyEdgeAnimation(edge, true, patch)
  }
  edgePatchHandlers.lineAnimSpeed = edgePatchHandlers.speed
  edgePatchHandlers.dir = edgePatchHandlers.speed
  edgePatchHandlers.lineAnimDir = edgePatchHandlers.speed
}

export function registerPreviewNodePatchHandler(key: string, handler: PatchHandler) {
  nodePatchHandlers[key] = handler
}

export function registerPreviewEdgePatchHandler(key: string, handler: PatchHandler) {
  edgePatchHandlers[key] = handler
}

function getCellKeys(cell: any): string[] {
  const data = cell.getData?.() || {}
  const keys = [cell.id, data.runtimeId].filter(Boolean).map((value) => String(value))
  return [...new Set(keys)]
}

function applyPatch(cell: any, patch: RuntimePatch, handlers: Record<string, PatchHandler>) {
  Object.entries(patch).forEach(([key, value]) => {
    if (key.startsWith('__')) return
    const handler = handlers[key]
    if (handler) handler(cell, value, patch)
  })
  cell.setData({ ...(cell.getData?.() || {}), ...patch, ...(patch.data || {}) })
}

export function applyPreviewData(graph: Graph, payload: PreviewRuntimePayload) {
  registerBuiltInHandlers()

  const keyToNodes = new Map<string, any[]>()
  graph.getNodes().forEach((node) => {
    getCellKeys(node).forEach((key) => {
      const list = keyToNodes.get(key) || []
      list.push(node)
      keyToNodes.set(key, list)
    })
  })

  const keyToEdges = new Map<string, any[]>()
  graph.getEdges().forEach((edge) => {
    getCellKeys(edge).forEach((key) => {
      const list = keyToEdges.get(key) || []
      list.push(edge)
      keyToEdges.set(key, list)
    })
  })

  Object.entries(payload || {}).forEach(([id, patch]) => {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return
    const nodeList = keyToNodes.get(id) || []
    const edgeList = keyToEdges.get(id) || []
    nodeList.forEach((node) => applyPatch(node, patch, nodePatchHandlers))
    edgeList.forEach((edge) => applyPatch(edge, patch, edgePatchHandlers))
  })
}
