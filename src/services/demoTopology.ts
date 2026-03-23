import type { Graph } from '@antv/x6'
import { addDeviceNode, patchEdgeStyle } from './x6GraphService'
import { defaultEdgeSelectionData } from '../constants/defaults'

export function loadDemoTopology(graph: Graph) {
  graph.clearCells()

  const g1 = addDeviceNode(graph, 'generator', 120, 140)
  const t1 = addDeviceNode(graph, 'transformer', 300, 130)
  const b1 = addDeviceNode(graph, 'busbar', 510, 135)
  const cb1 = addDeviceNode(graph, 'circuit_breaker', 760, 130)
  const load1 = addDeviceNode(graph, 'load', 970, 85)
  const motor1 = addDeviceNode(graph, 'motor', 970, 215)
  const cap1 = addDeviceNode(graph, 'capacitor', 760, 270)

  const e1 = graph.addEdge({ source: { cell: g1.id, port: 'right' }, target: { cell: t1.id, port: 'left' } })
  const e2 = graph.addEdge({ source: { cell: t1.id, port: 'right' }, target: { cell: b1.id, port: 'left' } })
  const e3 = graph.addEdge({ source: { cell: b1.id, port: 'right' }, target: { cell: cb1.id, port: 'left' } })
  const e4 = graph.addEdge({ source: { cell: cb1.id, port: 'top' }, target: { cell: load1.id, port: 'left' } })
  const e5 = graph.addEdge({ source: { cell: cb1.id, port: 'bottom' }, target: { cell: motor1.id, port: 'left' } })
  const e6 = graph.addEdge({ source: { cell: cb1.id, port: 'bottom' }, target: { cell: cap1.id, port: 'top' } })

  patchEdgeStyle(graph, e1.id, { ...defaultEdgeSelectionData, id: e1.id, label: '主馈线', lineType: 'overhead', color: '#00d4ff', width: 2.5 })
  patchEdgeStyle(graph, e2.id, { ...defaultEdgeSelectionData, id: e2.id, lineType: 'cable', color: '#22c55e', width: 2.5 })
  patchEdgeStyle(graph, e3.id, { ...defaultEdgeSelectionData, id: e3.id, lineType: 'busbar', color: '#f59e0b', width: 3 })
  patchEdgeStyle(graph, e4.id, { ...defaultEdgeSelectionData, id: e4.id, lineType: 'overhead', color: '#00d4ff', anim: true, speed: 2, dir: 'forward' })
  patchEdgeStyle(graph, e5.id, { ...defaultEdgeSelectionData, id: e5.id, lineType: 'overhead', color: '#a78bfa', anim: true, speed: 1.5, dir: 'reverse' })
  patchEdgeStyle(graph, e6.id, { ...defaultEdgeSelectionData, id: e6.id, lineType: 'control', color: '#ef4444', dash: '4 4' })
}
