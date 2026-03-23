import type { Graph } from '@antv/x6'
import { defaultCanvasProps } from '../constants/defaults'
import type { CanvasProps, SerializedTopology } from '../types/graph'

export function exportTopology(graph: Graph, canvas: CanvasProps): string {
  const payload: SerializedTopology = {
    version: '2.0',
    canvas,
    graph: graph.toJSON(),
    meta: {
      exportedAt: new Date().toISOString(),
    },
  }

  return JSON.stringify(payload, null, 2)
}

function migrateV1ToV2(payload: any): SerializedTopology {
  return {
    version: '2.0',
    canvas: {
      ...defaultCanvasProps,
      ...(payload.canvas || {}),
      gridColor: payload.canvas?.gridColor ?? defaultCanvasProps.gridColor,
      gridType: payload.canvas?.gridType ?? defaultCanvasProps.gridType,
      rubberband: payload.canvas?.rubberband ?? defaultCanvasProps.rubberband,
    },
    graph: payload.graph,
    meta: {
      exportedAt: payload.meta?.exportedAt || new Date().toISOString(),
    },
  }
}

export function parseTopology(raw: string): SerializedTopology {
  const payload = JSON.parse(raw)

  if (!payload?.canvas || !payload?.graph || !Array.isArray(payload?.graph?.cells)) {
    throw new Error('拓扑文件格式无效')
  }

  if (payload.version === '2.0') {
    return payload as SerializedTopology
  }

  if (payload.version === '1.0') {
    return migrateV1ToV2(payload)
  }

  throw new Error('仅支持 version=1.0 或 2.0 的拓扑文件')
}
