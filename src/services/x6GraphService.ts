import {
  Clipboard,
  Graph,
  History,
  Keyboard,
  Selection,
  Snapline,
  Transform,
} from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import { defaultCanvasProps, defaultEdgeSelectionData, defaultNodeSelectionData, defaultPortCounts, makePortsFromList } from '../constants/defaults'
import { getDeviceByType } from '../constants/devices'
import { toDataUrl } from '../constants/svgs'
import VueWidgetNode from '../components/nodes/VueWidgetNode.vue'
import type {
  CanvasProps,
  DeviceDefinition,
  EdgeMarker,
  EdgeSelectionData,
  NodeSelectionData,
  PortCountConfig,
  PortPositionConfig,
  PortsConfig,
} from '../types/graph'

let nodeRegistered = false

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function normalizeDirectionFromPortId(id: string): PortPositionConfig['dir'] {
  if (id.startsWith('top')) return 'top'
  if (id.startsWith('bottom')) return 'bottom'
  if (id.startsWith('left')) return 'left'
  return 'right'
}

function parsePortPos(raw: string | number) {
  if (typeof raw === 'string' && raw.endsWith('%')) {
    return { unit: '%' as const, pos: Number(raw.replace('%', '')) || 0 }
  }
  return { unit: 'px' as const, pos: Number(raw) || 0 }
}

function markerToAttr(marker: EdgeMarker, size: number) {
  if (marker === 'none') return null
  if (marker === 'open') return { name: 'block', size, open: true }
  if (marker === 'square') return { name: 'path', size, d: 'M -6 -6 L 6 -6 L 6 6 L -6 6 Z' }
  return { name: marker, size }
}

function markerFromAttr(marker: any): EdgeMarker {
  if (!marker) return 'none'
  if (typeof marker === 'string') return marker as EdgeMarker
  if (marker.name === 'block' && marker.open) return 'open'
  if (marker.name === 'path' && typeof marker.d === 'string') return 'square'
  return (marker.name as EdgeMarker) || 'classic'
}

function speedToDuration(speed: number) {
  return `${(3 / Math.max(0.3, speed)).toFixed(2)}s`
}

export function syncDeviceIconSize(node: any) {
  if (!node?.isNode?.()) return
  if (node.shape !== 'x-device') return
  const size = node.size()
  node.attr('icon/width', Math.max(0, Number(size.width) - 8))
  node.attr('icon/height', Math.max(0, Number(size.height) - 18))
}

export function registerCustomNodes() {
  if (nodeRegistered) return
  Graph.registerNode(
    'x-device',
    {
      inherit: 'rect',
      markup: [
        { tagName: 'rect', selector: 'body' },
        { tagName: 'image', selector: 'icon' },
        { tagName: 'text', selector: 'label' },
      ],
      attrs: {
        body: {
          fill: '#071830',
          stroke: '#00d4ff',
          strokeWidth: 2,
          rx: 4,
          ry: 4,
          refWidth: '100%',
          refHeight: '100%',
          magnet: false,
        },
        icon: {
          x: 4,
          y: 2,
          refWidth: 'calc(100% - 8)',
          refHeight: 'calc(100% - 18)',
        },
        label: {
          fill: '#e0f0ff',
          fontSize: 10,
          fontFamily: 'Noto Sans SC,sans-serif',
          textAnchor: 'middle',
          refX: '50%',
          refY: '100%',
          refY2: -4,
        },
      },
    },
    true,
  )
  register({
    shape: 'x-vue-widget',
    width: 188,
    height: 96,
    component: VueWidgetNode,
  })
  nodeRegistered = true
}

export interface CreateGraphOptions {
  previewMode?: boolean
}

export function createGraph(
  container: HTMLElement,
  canvasProps: CanvasProps = defaultCanvasProps,
  options: CreateGraphOptions = {},
) {
  registerCustomNodes()
  const previewMode = options.previewMode === true

  let graph!: Graph
  graph = new Graph({
    container,
    autoResize: true,
    background: { color: canvasProps.background },
    grid: {
      size: canvasProps.gridSize,
      visible: canvasProps.gridVisible,
      type: canvasProps.gridType,
      args: { color: canvasProps.gridColor, thickness: 1 },
    },
    mousewheel: previewMode
      ? { enabled: true, zoomAtMousePosition: true, modifiers: [], minScale: 0.15, maxScale: 4 }
      : (canvasProps.mousewheel
        ? { enabled: true, zoomAtMousePosition: true, modifiers: ['ctrl', 'meta'], minScale: 0.15, maxScale: 4 }
        : undefined),
    panning: previewMode
      ? { enabled: true, modifiers: [] }
      : (canvasProps.panning ? { enabled: true, modifiers: ['space'] } : false),
    translating: { restrict: false },
    interacting(cellView: any) {
      if (previewMode) return false
      const data = cellView.cell.getData() || {}
      if (data.locked) return false
      return { nodeMovable: true, edgeMovable: true, edgeLabelMovable: true }
    },
    connecting: {
      router: { name: 'orth', args: { padding: 20 } },
      connector: { name: 'rounded', args: { radius: 8 } },
      anchor: 'center',
      // In preview mode, some imported edges may not have endpoint anchors.
      // Use boundary to avoid runtime "Anchor should be specified" errors.
      connectionPoint: previewMode ? 'boundary' : 'anchor',
      allowBlank: false,
      allowLoop: false,
      allowMulti: true,
      snap: { radius: 40 },
      highlight: true,
      validateMagnet({ magnet }: any) {
        return magnet.getAttribute('magnet') === 'true' || magnet.getAttribute('magnet') === ''
      },
      createEdge(): any {
        return graph.createEdge({
          attrs: { line: { stroke: '#00d4ff', strokeWidth: 2, targetMarker: 'classic', sourceMarker: null } },
          data: {
            ...defaultEdgeSelectionData,
            lineType: 'overhead',
            origSw: 2,
          },
          zIndex: 0,
        })
      },
      validateConnection({ sourceView, targetView, sourceMagnet, targetMagnet }: any) {
        if (sourceView === targetView) return false
        if (!sourceMagnet || !targetMagnet) return false
        return true
      },
    },
  } as any)

  const pluginDefs = previewMode
    ? []
    : [
      Keyboard && new Keyboard({ enabled: true }),
      Selection && new Selection({ enabled: true, multiple: true, rubberband: true, rubberNode: true, rubberEdge: true, showNodeSelectionBox: false, showEdgeSelectionBox: false, pointerEvents: 'none' }),
      History && new History({ enabled: true }),
      Clipboard && new Clipboard({ enabled: true }),
      Snapline && new Snapline({ enabled: true }),
      Transform && new Transform({
        resizing: {
          enabled(node: any) {
            const data = node?.getData?.() || {}
            return !data.locked && (data.resizable ?? true)
          },
          minWidth: 30,
          minHeight: 30,
        },
        rotating: {
          enabled(node: any) {
            const data = node?.getData?.() || {}
            return !data.locked && (data.rotatable ?? true)
          },
          grid: 15,
        },
      }),
    ].filter(Boolean)

  pluginDefs.forEach((plugin) => {
    try {
      graph.use(plugin as any)
    } catch {
      // ignore plugin install failures for compatibility
    }
  })

  if (!previewMode) graph.enableKeyboard()

  return graph
}

export function getDeviceDefinition(type: string): DeviceDefinition {
  return getDeviceByType(type)
}

export function addDeviceNode(graph: Graph, type: string, x: number, y: number) {
  const device = getDeviceDefinition(type)
  const counts = { ...defaultPortCounts }
  const portList = buildPortListFromCounts(counts)
  const portsConfig = makePortsFromList(portList)

  if (device.renderKind === 'text') {
    return graph.addNode({
      shape: 'rect',
      x,
      y,
      width: device.size.w,
      height: device.size.h,
      attrs: {
        body: {
          fill: device.fill,
          stroke: device.stroke,
          strokeWidth: device.strokeWidth,
          rx: 6,
          ry: 6,
        },
        label: {
          text: device.label,
          fill: '#e7f2ff',
          fontSize: 13,
          fontWeight: 700,
          textAnchor: 'middle',
          refX: '50%',
          refY: '50%',
          textVerticalAnchor: 'middle',
        },
      },
      ports: portsConfig,
      data: {
        ...deepClone(defaultNodeSelectionData),
        runtimeId: '',
        label: device.label,
        deviceType: device.type,
        voltage: '10kV',
        fill: device.fill,
        stroke: device.stroke,
        strokeWidth: device.strokeWidth,
        showLabel: true,
        portCounts: counts,
        portList,
        portsConfig,
        svgContent: '',
        origStroke: device.stroke,
        origSw: device.strokeWidth,
      },
    })
  }

  if (device.renderKind === 'vue') {
    return graph.addNode({
      shape: 'x-vue-widget',
      x,
      y,
      width: device.size.w,
      height: device.size.h,
      ports: portsConfig,
      data: {
        ...deepClone(defaultNodeSelectionData),
        runtimeId: '',
        label: device.label,
        deviceType: device.type,
        voltage: '10kV',
        fill: device.fill,
        stroke: device.stroke,
        strokeWidth: device.strokeWidth,
        showLabel: false,
        portCounts: counts,
        portList,
        portsConfig,
        svgContent: device.svg,
        origStroke: device.stroke,
        origSw: device.strokeWidth,
      },
    })
  }

  if (device.renderKind === 'graphic') {
    return graph.addNode({
      shape: 'rect',
      x,
      y,
      width: device.size.w,
      height: device.size.h,
      attrs: {
        body: {
          fill: 'rgba(0,0,0,0)',
          stroke: device.stroke,
          strokeWidth: device.strokeWidth,
          rx: 8,
          ry: 8,
        },
        label: {
          text: '',
        },
      },
      ports: portsConfig,
      data: {
        ...deepClone(defaultNodeSelectionData),
        runtimeId: '',
        label: device.label,
        deviceType: device.type,
        voltage: '10kV',
        fill: 'rgba(0,0,0,0)',
        stroke: device.stroke,
        strokeWidth: device.strokeWidth,
        showLabel: false,
        portCounts: counts,
        portList,
        portsConfig,
        svgContent: '',
        origStroke: device.stroke,
        origSw: device.strokeWidth,
      },
    })
  }

  return graph.addNode({
    shape: 'x-device',
    x,
    y,
    width: device.size.w,
    height: device.size.h,
    attrs: {
      body: {
        fill: device.fill,
        stroke: device.stroke,
        strokeWidth: device.strokeWidth,
        rx: 4,
        ry: 4,
      },
      icon: {
        href: toDataUrl(device.svg),
        width: device.size.w,
        height: device.size.h,
      },
      label: {
        text: device.label,
        fill: '#e0f0ff',
        fontSize: 10,
      },
    },
    ports: portsConfig,
    data: {
      ...deepClone(defaultNodeSelectionData),
      runtimeId: '',
      label: device.label,
      deviceType: device.type,
      voltage: '10kV',
      fill: device.fill,
      stroke: device.stroke,
      strokeWidth: device.strokeWidth,
      showLabel: true,
      portCounts: counts,
      portList,
      portsConfig,
      svgContent: device.svg,
      origStroke: device.stroke,
      origSw: device.strokeWidth,
    },
  })
}

export function setCanvasProps(graph: Graph, canvas: CanvasProps) {
  graph.drawBackground({ color: canvas.background })

  if (canvas.gridVisible) {
    graph.showGrid()
    graph.drawGrid({
      type: canvas.gridType,
      args: { color: canvas.gridColor, thickness: 1, factor: canvas.gridSize },
    })
  } else {
    graph.hideGrid()
  }

  if (canvas.panning) graph.enablePanning()
  else graph.disablePanning()

  if (canvas.mousewheel) graph.enableMouseWheel()
  else graph.disableMouseWheel()

  const snapline = graph.getPlugin<any>('snapline')
  if (snapline?.enable && snapline?.disable) {
    if (canvas.snapline) snapline.enable()
    else snapline.disable()
  }

  const selection = graph.getPlugin<any>('selection')
  if (selection?.enableRubberband && selection?.disableRubberband) {
    if (canvas.rubberband) selection.enableRubberband()
    else selection.disableRubberband()
  }
}

export function bindGraphBaseEvents(
  graph: Graph,
  callbacks: {
    onSelectionChanged: (ids: string[]) => void
    onNodeHoverPorts: (nodeId: string, visible: boolean) => void
    onStatsChanged: () => void
    onMouseMove: (x: number, y: number) => void
    onZoomChanged: (zoomPct: number) => void
  },
) {
  graph.on('selection:changed', () => {
    callbacks.onSelectionChanged(graph.getSelectedCells().map((cell) => cell.id))
  })

  graph.on('node:mouseenter', ({ node }) => {
    node.getPorts().forEach((p) => {
      if (p.id) node.portProp(p.id, 'attrs/pBody/visibility', 'visible')
    })
    callbacks.onNodeHoverPorts(node.id, true)
  })

  graph.on('node:mouseleave', ({ node }) => {
    node.getPorts().forEach((p) => {
      if (p.id) node.portProp(p.id, 'attrs/pBody/visibility', 'hidden')
    })
    callbacks.onNodeHoverPorts(node.id, false)
  })

  graph.on('node:added', callbacks.onStatsChanged)
  graph.on('node:removed', callbacks.onStatsChanged)
  graph.on('edge:added', callbacks.onStatsChanged)
  graph.on('edge:removed', callbacks.onStatsChanged)

  graph.on('mousemove', ({ x, y }: any) => callbacks.onMouseMove(Math.round(x), Math.round(y)))
  graph.on('scale', ({ sx }: any) => callbacks.onZoomChanged(Math.round(sx * 100)))
}

export function bindGraphKeyboard(graph: Graph, handlers: {
  onDelete: () => void
  onUndo: () => void
  onRedo: () => void
  onCopy: () => void
  onPaste: () => void
  onGroup: () => void
  onUngroup: () => void
  onSelectAll: () => void
}) {
  graph.bindKey(['backspace', 'delete', 'del'], () => {
    handlers.onDelete()
    return false
  })
  graph.bindKey('ctrl+z', () => {
    handlers.onUndo()
    return false
  })
  graph.bindKey('ctrl+y', () => {
    handlers.onRedo()
    return false
  })
  graph.bindKey(['ctrl+c', 'meta+c', 'ctrl+insert'], () => {
    handlers.onCopy()
    return false
  })
  graph.bindKey(['ctrl+v', 'meta+v', 'shift+insert'], () => {
    handlers.onPaste()
    return false
  })
  graph.bindKey('ctrl+g', () => {
    handlers.onGroup()
    return false
  })
  graph.bindKey('ctrl+shift+g', () => {
    handlers.onUngroup()
    return false
  })
  graph.bindKey('ctrl+a', () => {
    handlers.onSelectAll()
    return false
  })
}

export function groupSelectedNodes(graph: Graph, selectedIds: string[]) {
  const nodes = selectedIds
    .map((id) => graph.getCellById(id))
    .filter((cell): cell is any => Boolean(cell?.isNode?.() && !cell.getData?.()?.isGroup))

  if (nodes.length < 2) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  nodes.forEach((node) => {
    const p = node.getPosition()
    const s = node.getSize()
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x + s.width)
    maxY = Math.max(maxY, p.y + s.height)
  })

  const pad = 24
  const groupNode = graph.addNode({
    shape: 'rect',
    x: minX - pad,
    y: minY - pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
    zIndex: -1,
    attrs: {
      body: {
        fill: 'rgba(0,212,255,0.04)',
        stroke: '#00d4ff',
        strokeWidth: 1.5,
        strokeDasharray: '8,4',
        rx: 8,
      },
      label: {
        text: '组合',
        fill: 'rgba(0,212,255,0.7)',
        fontSize: 10,
        textAnchor: 'middle',
        refX: '50%',
        refY: 0,
        refY2: -14,
      },
    },
    data: { isGroup: true, label: '组合', memberCount: nodes.length },
  })

  nodes.forEach((node) => {
    node.setParent(groupNode)
    groupNode.addChild(node)
  })

  return groupNode
}

export function ungroupNode(graph: Graph, groupId: string) {
  const groupNode = graph.getCellById(groupId)
  if (!groupNode || !groupNode.isNode() || !groupNode.getData()?.isGroup) return false

  const children = groupNode.getChildren() || []
  children.forEach((child) => child.setParent(null))
  graph.removeNode(groupNode)
  return true
}

export function undo(graph: Graph) {
  graph.undo()
}

export function redo(graph: Graph) {
  graph.redo()
}

export function copy(graph: Graph, selectedIds: string[]) {
  const cells = selectedIds.map((id) => graph.getCellById(id)).filter(Boolean) as any[]
  if (cells.length) graph.copy(cells)
}

export function paste(graph: Graph) {
  graph.paste({ offset: 20 })
}

export function selectAll(graph: Graph) {
  graph.select(graph.getCells())
}

export function deleteCells(graph: Graph, selectedIds: string[]) {
  const cells = selectedIds.map((id) => graph.getCellById(id)).filter(Boolean) as any[]
  if (cells.length) graph.removeCells(cells)
}

export function highlightSelection(graph: Graph, selectedIds: string[]) {
  graph.getNodes().forEach((node) => {
    if (selectedIds.includes(node.id)) {
      node.attr('body/filter', 'drop-shadow(0 0 3px rgba(0,255,157,0.95)) drop-shadow(0 0 5px rgba(0,255,157,0.8))')
    } else {
      node.attr('body/filter', '')
    }
  })

  graph.getEdges().forEach((edge) => {
    if (selectedIds.includes(edge.id)) {
      edge.attr('line/filter', 'drop-shadow(0 0 3px rgba(0,212,255,1)) drop-shadow(0 0 5px rgba(0,212,255,0.9))')
    } else {
      edge.attr('line/filter', '')
    }
  })
}

export function patchNodeLabel(graph: Graph, id: string, label: string) {
  const node = graph.getCellById(id)
  if (!node || !node.isNode()) return
  node.attr('label/text', label)
  node.setData({ ...node.getData(), label })
}

export function patchNodeStyle(graph: Graph, id: string, patch: Partial<NodeSelectionData>) {
  const node = graph.getCellById(id)
  if (!node || !node.isNode()) return

  if (typeof patch.fill === 'string') node.attr('body/fill', patch.fill)
  if (typeof patch.stroke === 'string') node.attr('body/stroke', patch.stroke)
  if (typeof patch.strokeWidth === 'number') node.attr('body/strokeWidth', patch.strokeWidth)
  if (typeof patch.radius === 'number') {
    node.attr('body/rx', patch.radius)
    node.attr('body/ry', patch.radius)
  }
  if (typeof patch.opacity === 'number') node.attr('body/opacity', patch.opacity)
  if (typeof patch.fontSize === 'number') node.attr('label/fontSize', patch.fontSize)
  if (typeof patch.fontColor === 'string') node.attr('label/fill', patch.fontColor)
  if (typeof patch.label === 'string') {
    const showLabel = patch.showLabel ?? (node.getData()?.showLabel ?? true)
    node.attr('label/text', showLabel ? patch.label : '')
  }
  if (typeof patch.showLabel === 'boolean') {
    const text = patch.showLabel ? patch.label ?? node.getData()?.label ?? node.attr('label/text') : ''
    node.attr('label/text', text)
  }

  if (typeof patch.x === 'number' || typeof patch.y === 'number') {
    const p = node.position()
    node.setPosition(patch.x ?? p.x, patch.y ?? p.y)
  }

  if (typeof patch.width === 'number' || typeof patch.height === 'number') {
    const s = node.size()
    const nextW = patch.width ?? s.width
    const nextH = patch.height ?? s.height
    node.setSize(nextW, nextH)
    syncDeviceIconSize(node)
  }

  if (patch.labelPos) {
    const lp = patch.labelPos
    const attrs: Record<string, any> = {}
    if (lp === 'center') Object.assign(attrs, { refX: '50%', refY: '50%', textVerticalAnchor: 'middle', refY2: 0, textAnchor: 'middle' })
    else if (lp === 'top') Object.assign(attrs, { refX: '50%', refY: 0, refY2: -4, textVerticalAnchor: 'bottom', textAnchor: 'middle' })
    else if (lp === 'bottom') Object.assign(attrs, { refX: '50%', refY: '100%', refY2: 4, textVerticalAnchor: 'top', textAnchor: 'middle' })
    else if (lp === 'left') Object.assign(attrs, { refX: 0, refY: '50%', refX2: -4, refY2: 0, textVerticalAnchor: 'middle', textAnchor: 'end' })
    else if (lp === 'right') Object.assign(attrs, { refX: '100%', refY: '50%', refX2: 4, refY2: 0, textVerticalAnchor: 'middle', textAnchor: 'start' })
    const labelAttr = (node.attr('label') || {}) as Record<string, any>
    node.attr('label', { ...labelAttr, ...attrs })
  }

  const oldData = node.getData() || {}
  node.setData({ ...oldData, ...patch, origStroke: patch.stroke ?? oldData.origStroke, origSw: patch.strokeWidth ?? oldData.origSw })
}

function findNearestPort(oldPort: any, newList: PortPositionConfig[]) {
  if (!oldPort || !newList.length) return newList[0]
  const oldDir = normalizeDirectionFromPortId(oldPort.id)
  const raw = oldPort.args?.x ?? oldPort.args?.y ?? '50%'
  const { pos: oldPos } = parsePortPos(raw)
  const sameDir = newList.filter((p) => p.dir === oldDir)
  const pool = sameDir.length ? sameDir : newList
  return pool.reduce((best, p) => Math.abs(p.pos - oldPos) < Math.abs(best.pos - oldPos) ? p : best, pool[0])
}

export function patchNodePorts(graph: Graph, id: string, portCounts: PortCountConfig, portList: PortPositionConfig[]) {
  const node = graph.getCellById(id)
  if (!node || !node.isNode()) return

  const existingPorts = node.getPorts() || []
  const existingIds = new Set(existingPorts.map((p) => p.id).filter((pid): pid is string => typeof pid === 'string'))
  const newIds = new Set(portList.map((p) => p.id))

  const removedIds = [...existingIds].filter((pid) => !newIds.has(pid))
  const edgeRemaps: Array<{ edge: any; side: 'source' | 'target'; newPortId: string }> = []

  if (removedIds.length) {
    graph.getEdges().forEach((edge) => {
      const src = edge.getSource() as any
      const tgt = edge.getTarget() as any
      if (src?.cell === node.id && src?.port && removedIds.includes(src.port)) {
        const nearest = findNearestPort(existingPorts.find((p) => p.id === src.port), portList)
        if (nearest?.id) edgeRemaps.push({ edge, side: 'source', newPortId: nearest.id })
      }
      if (tgt?.cell === node.id && tgt?.port && removedIds.includes(tgt.port)) {
        const nearest = findNearestPort(existingPorts.find((p) => p.id === tgt.port), portList)
        if (nearest?.id) edgeRemaps.push({ edge, side: 'target', newPortId: nearest.id })
      }
    })
  }

  const portsConfig: PortsConfig = makePortsFromList(portList)
  node.prop('ports', deepClone(portsConfig))

  edgeRemaps.forEach(({ edge, side, newPortId }) => {
    if (side === 'source') edge.setSource({ cell: node.id, port: newPortId })
    else edge.setTarget({ cell: node.id, port: newPortId })
  })

  node.setData({
    ...node.getData(),
    portCounts: deepClone(portCounts),
    portList: deepClone(portList),
    portsConfig: deepClone(portsConfig),
  })
}

export function patchNodeExtraAttrs(graph: Graph, id: string, extraAttrs: Record<string, any>) {
  const node = graph.getCellById(id)
  if (!node || !node.isNode()) return
  node.setData({ ...node.getData(), extraAttrs: deepClone(extraAttrs) })
}

export function patchNodeMeta(graph: Graph, id: string, payload: Partial<NodeSelectionData>) {
  const node = graph.getCellById(id)
  if (!node || !node.isNode()) return
  node.setData({ ...node.getData(), ...deepClone(payload) })

  if ('rotatable' in payload || 'resizable' in payload || 'locked' in payload) {
    const transform = graph.getPlugin<any>('transform')
    if (transform?.createWidget) transform.createWidget(node)
  }
}

export function patchEdgeStyle(graph: Graph, id: string, payload: EdgeSelectionData) {
  const edge = graph.getCellById(id)
  if (!edge || !edge.isEdge()) return

  const rawDash = typeof payload.dash === 'string' ? payload.dash.trim() : ''
  const dash = payload.anim ? '12 6' : (rawDash || null)
  const animation = payload.anim
    ? `animation:flow ${speedToDuration(payload.speed)} linear ${payload.dir === 'reverse' ? 'reverse' : 'normal'} infinite`
    : 'animation:none'
  const lineAttrs = {
    stroke: payload.color,
    strokeWidth: payload.width,
    strokeDasharray: dash,
    style: animation,
    sourceMarker: markerToAttr(payload.srcMark, payload.markSize),
    targetMarker: markerToAttr(payload.tgtMark, payload.markSize),
  }
  edge.attr('line', lineAttrs)

  if (payload.router === 'normal') edge.setRouter('normal')
  else edge.setRouter({ name: payload.router, args: { padding: 20 } })

  if (payload.connector === 'normal') edge.setConnector('normal')
  else edge.setConnector({ name: payload.connector, args: { radius: 8 } })

  if (payload.label) {
    edge.setLabels([
      {
        attrs: {
          text: {
            text: payload.label,
            fill: payload.color,
            fontSize: 10,
          },
          rect: {
            fill: '#0a1220',
            stroke: payload.color,
            strokeWidth: 1,
            rx: 3,
            ry: 3,
          },
        },
        position: { distance: 0.5 },
      },
    ])
  } else {
    edge.setLabels([])
  }
  edge.setData({ ...edge.getData(), ...deepClone(payload), animated: payload.anim, origSw: payload.width })
}

export function patchEdgeExtraAttrs(graph: Graph, id: string, extraAttrs: Record<string, any>) {
  const edge = graph.getCellById(id)
  if (!edge || !edge.isEdge()) return
  edge.setData({ ...edge.getData(), extraAttrs: deepClone(extraAttrs) })
}

function buildPortListFromCounts(counts: PortCountConfig, old = [] as PortPositionConfig[]) {
  const list: PortPositionConfig[] = []

  const build = (dir: PortPositionConfig['dir'], count: number) => {
    for (let i = 0; i < count; i++) {
      const id = count === 1 ? dir : `${dir}_${i + 1}`
      const defPos = count === 1 ? 50 : Math.round((((i + 1) * 100) / (count + 1)) * 10) / 10
      const prev = old.find((p) => p.id === id)
      list.push(prev ? { ...prev } : { id, dir, unit: '%', pos: defPos })
    }
  }

  build('top', counts.top)
  build('right', counts.right)
  build('bottom', counts.bottom)
  build('left', counts.left)

  return list
}

export function readNodeSelection(graph: Graph, id: string): NodeSelectionData | null {
  const node = graph.getCellById(id)
  if (!node || !node.isNode()) return null
  const data = node.getData() || {}
  const position = node.position()
  const size = node.size()
  const ports = node.getPorts() || []

  const portCounts: PortCountConfig = data.portCounts || {
    top: ports.filter((p) => p.id && normalizeDirectionFromPortId(p.id) === 'top').length || 1,
    right: ports.filter((p) => p.id && normalizeDirectionFromPortId(p.id) === 'right').length || 1,
    bottom: ports.filter((p) => p.id && normalizeDirectionFromPortId(p.id) === 'bottom').length || 1,
    left: ports.filter((p) => p.id && normalizeDirectionFromPortId(p.id) === 'left').length || 1,
  }

  const portList: PortPositionConfig[] = data.portList || ports
    .filter((p) => Boolean(p.id))
    .map((p) => {
      const dir = normalizeDirectionFromPortId(p.id as string)
      const args = (p.args || {}) as { x?: string | number; y?: string | number }
      const axis = dir === 'top' || dir === 'bottom' ? (args.x ?? '50%') : (args.y ?? '50%')
      const parsed = parsePortPos(axis)
      return {
        id: p.id as string,
        dir,
        unit: parsed.unit,
        pos: parsed.pos,
      }
    })

  return {
    id: node.id,
    runtimeId: data.runtimeId ?? '',
    label: data.label ?? node.attr('label/text') ?? '',
    deviceType: data.deviceType ?? 'device',
    status: data.status ?? 'running',
    x: Math.round(position.x),
    y: Math.round(position.y),
    width: Math.round(size.width),
    height: Math.round(size.height),
    fill: node.attr('body/fill') ?? data.fill ?? '#071830',
    stroke: node.attr('body/stroke') ?? data.stroke ?? '#00d4ff',
    strokeWidth: Number(node.attr('body/strokeWidth') ?? data.strokeWidth ?? 2),
    radius: Number(node.attr('body/rx') ?? data.radius ?? 4),
    opacity: Number(node.attr('body/opacity') ?? data.opacity ?? 1),
    fontSize: Number(node.attr('label/fontSize') ?? data.fontSize ?? 11),
    fontColor: node.attr('label/fill') ?? data.fontColor ?? '#e0f0ff',
    labelPos: data.labelPos ?? 'bottom',
    showLabel: data.showLabel ?? true,
    voltage: data.voltage ?? '10kV',
    rotatable: data.rotatable ?? true,
    resizable: data.resizable ?? true,
    locked: data.locked ?? false,
    customKey: data.customKey ?? '',
    customVal: data.customVal ?? '',
    portCounts,
    portList: deepClone(portList),
    portsConfig: deepClone(data.portsConfig ?? makePortsFromList(portList)),
    extraAttrs: deepClone(data.extraAttrs ?? {}),
  }
}

export function readEdgeSelection(graph: Graph, id: string): EdgeSelectionData | null {
  const edge = graph.getCellById(id)
  if (!edge || !edge.isEdge()) return null

  const data = edge.getData() || {}
  const line = (edge.attr('line') || {}) as any
  const styleRaw = line?.style
  const style = typeof styleRaw === 'string'
    ? styleRaw
    : (styleRaw?.animation ? `animation:${styleRaw.animation}` : '')

  return {
    id: edge.id,
    runtimeId: data.runtimeId ?? '',
    label: data.label ?? (edge.getLabels()?.[0]?.attrs?.text?.text || ''),
    lineType: data.lineType ?? 'overhead',
    color: line.stroke ?? '#00d4ff',
    // Prefer persisted width to avoid reading the temporary +2 highlight stroke width.
    width: Number(data.origSw ?? data.width ?? line.strokeWidth ?? 2),
    dash: data.dash ?? line.strokeDasharray ?? '',
    router: data.router ?? 'orth',
    connector: data.connector ?? 'rounded',
    srcMark: markerFromAttr(line.sourceMarker),
    tgtMark: markerFromAttr(line.targetMarker),
    markSize: data.markSize ?? 8,
    anim: style.includes('ant-line-flow') || style.includes('flow') || data.anim || data.animated || false,
    speed: data.speed ?? 2,
    dir: data.dir ?? 'forward',
    voltage: data.voltage ?? '10kV',
    amp: Number(data.amp ?? 200),
    len: data.len ?? '',
    impedance: data.impedance ?? '',
    customKey: data.customKey ?? '',
    customVal: data.customVal ?? '',
    extraAttrs: deepClone(data.extraAttrs ?? {}),
  }
}
