import type {
  CanvasProps,
  EdgeSelectionData,
  NodeSelectionData,
  PortCountConfig,
  PortDirection,
  PortPositionConfig,
  PortsConfig,
} from '../types/graph'

export const defaultCanvasProps: CanvasProps = {
  background: '#0a1220',
  gridVisible: true,
  gridSize: 20,
  gridColor: '#1a3050',
  gridType: 'dot',
  snapline: true,
  rubberband: true,
  panning: true,
  mousewheel: true,
}

export const defaultPortCounts: PortCountConfig = {
  top: 1,
  right: 1,
  bottom: 1,
  left: 1,
}

export function buildPortList(counts: PortCountConfig, existing: PortPositionConfig[] = []): PortPositionConfig[] {
  const list: PortPositionConfig[] = []
  const build = (dir: PortDirection, count: number) => {
    for (let i = 0; i < count; i++) {
      const id = count === 1 ? dir : `${dir}_${i + 1}`
      const defPos = count === 1 ? 50 : Math.round((((i + 1) * 100) / (count + 1)) * 10) / 10
      const prev = existing.find((p) => p.id === id)
      list.push(prev ? { ...prev } : { id, dir, unit: '%', pos: defPos })
    }
  }

  build('top', counts.top)
  build('right', counts.right)
  build('bottom', counts.bottom)
  build('left', counts.left)

  return list
}

export function makePortsFromList(portList: PortPositionConfig[]): PortsConfig {
  return {
    groups: {
      pin: {
        markup: [{ tagName: 'circle', selector: 'pBody' }],
        attrs: {
          pBody: {
            r: 6,
            magnet: true,
            fill: '#00d4ff',
            stroke: '#ffffff',
            strokeWidth: 1.5,
            cursor: 'crosshair',
            visibility: 'hidden',
          },
        },
        position: { name: 'absolute' },
      },
    },
    items: portList.map((p) => {
      if (p.dir === 'top' || p.dir === 'bottom') {
        return {
          id: p.id,
          group: 'pin',
          args: {
            x: p.unit === '%' ? `${p.pos}%` : p.pos,
            y: p.dir === 'top' ? 0 : '100%',
          },
        }
      }

      return {
        id: p.id,
        group: 'pin',
        args: {
          x: p.dir === 'left' ? 0 : '100%',
          y: p.unit === '%' ? `${p.pos}%` : p.pos,
        },
      }
    }),
  }
}

export const defaultNodeSelectionData: Omit<NodeSelectionData, 'id'> = {
  label: '',
  deviceType: '',
  status: 'running',
  x: 0,
  y: 0,
  width: 70,
  height: 70,
  fill: '#071830',
  stroke: '#00d4ff',
  strokeWidth: 2,
  radius: 4,
  opacity: 1,
  fontSize: 11,
  fontColor: '#e0f0ff',
  labelPos: 'bottom',
  showLabel: true,
  voltage: '10kV',
  devId: '',
  rotatable: true,
  resizable: true,
  locked: false,
  customKey: '',
  customVal: '',
  portCounts: { ...defaultPortCounts },
  portList: buildPortList(defaultPortCounts),
  portsConfig: makePortsFromList(buildPortList(defaultPortCounts)),
  extraAttrs: {},
}

export const defaultEdgeSelectionData: Omit<EdgeSelectionData, 'id'> = {
  label: '',
  lineType: 'overhead',
  color: '#00d4ff',
  width: 2,
  dash: '',
  router: 'orth',
  connector: 'rounded',
  srcMark: 'none',
  tgtMark: 'classic',
  markSize: 8,
  anim: false,
  speed: 2,
  dir: 'forward',
  voltage: '10kV',
  amp: 200,
  len: '',
  impedance: '',
  customKey: '',
  customVal: '',
  extraAttrs: {},
}
