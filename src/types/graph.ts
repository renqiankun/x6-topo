export type SelectionKind = 'canvas' | 'node' | 'edge' | 'multi'
export type PortDirection = 'top' | 'right' | 'bottom' | 'left'
export type PortUnit = '%' | 'px'
export type DeviceStatus = 'running' | 'stopped' | 'fault' | 'maintenance'
export type LabelPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'
export type EdgeLineType = 'overhead' | 'cable' | 'busbar' | 'control' | 'comm'
export type EdgeRouter = 'normal' | 'orth' | 'manhattan' | 'er'
export type EdgeConnector = 'normal' | 'rounded' | 'smooth'
export type EdgeMarker = 'none' | 'classic' | 'block' | 'open' | 'circle' | 'diamond' | 'square' | 'async'
export type GridType = 'dot' | 'line' | 'cross'

export interface PortItemConfig {
  id: string
  group: 'pin'
  args: {
    x: string | number
    y: string | number
  }
}

export interface PortPositionConfig {
  id: string
  dir: PortDirection
  unit: PortUnit
  pos: number
}

export interface PortCountConfig {
  top: number
  right: number
  bottom: number
  left: number
}

export interface PortsConfig {
  groups: Record<string, any>
  items: PortItemConfig[]
}

export interface CanvasProps {
  background: string
  gridVisible: boolean
  gridSize: number
  gridColor: string
  gridType: GridType
  snapline: boolean
  rubberband: boolean
  panning: boolean
  mousewheel: boolean
}

export interface NodeSelectionData {
  id: string
  label: string
  deviceType: string
  status: DeviceStatus
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  radius: number
  opacity: number
  fontSize: number
  fontColor: string
  labelPos: LabelPosition
  showLabel: boolean
  voltage: string
  devId: string
  rotatable: boolean
  resizable: boolean
  locked: boolean
  customKey: string
  customVal: string
  portCounts: PortCountConfig
  portList: PortPositionConfig[]
  portsConfig: PortsConfig
  extraAttrs: Record<string, any>
}

export interface EdgeSelectionData {
  id: string
  label: string
  lineType: EdgeLineType
  color: string
  width: number
  dash: string
  router: EdgeRouter
  connector: EdgeConnector
  srcMark: EdgeMarker
  tgtMark: EdgeMarker
  markSize: number
  anim: boolean
  speed: number
  dir: 'forward' | 'reverse'
  voltage: string
  amp: number
  len: string
  impedance: string
  customKey: string
  customVal: string
  extraAttrs: Record<string, any>
}

export interface DeviceDefinition {
  type: string
  label: string
  category: string
  svg: string
  size: { w: number; h: number }
  fill: string
  stroke: string
  strokeWidth: number
  defaultVoltage?: string
}

export interface DeviceCategory {
  name: string
  devices: DeviceDefinition[]
}

export interface SerializedTopology {
  version: '1.0' | '2.0'
  canvas: CanvasProps
  graph: any
  meta: {
    exportedAt: string
  }
}
