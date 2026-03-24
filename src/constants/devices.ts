import type { DeviceCategory, DeviceDefinition } from '../types/graph'
import { deviceSVGMap } from './svgs'

function mk(
  category: string,
  type: string,
  label: string,
  size: { w: number; h: number },
  fill = '#071830',
  stroke = '#00d4ff',
  strokeWidth = 2,
  extra: Partial<DeviceDefinition> = {},
): DeviceDefinition {
  return {
    category,
    type,
    label,
    svg: deviceSVGMap[type] ?? deviceSVGMap.generator,
    size,
    fill,
    stroke,
    strokeWidth,
    ...extra,
  }
}

export const deviceCategories: DeviceCategory[] = [
  {
    name: '电源设备',
    devices: [
      mk('电源设备', 'generator', '发电机', { w: 70, h: 70 }),
      mk('电源设备', 'transformer', '变压器', { w: 80, h: 70 }, '#110800', '#ffaa00'),
    ],
  },
  {
    name: '开关设备',
    devices: [
      mk('开关设备', 'circuit_breaker', '断路器', { w: 65, h: 70 }),
      mk('开关设备', 'disconnector', '隔离开关', { w: 65, h: 70 }, '#071a10', '#00ff9d'),
      mk('开关设备', 'fuse', '熔断器', { w: 65, h: 70 }, '#120a00', '#ffaa00'),
    ],
  },
  {
    name: '传输设备',
    devices: [
      mk('传输设备', 'busbar', '母线', { w: 160, h: 55 }, '#060e1a', '#00d4ff', 2.5),
      mk('传输设备', 'ct', '电流互感器', { w: 65, h: 70 }),
      mk('传输设备', 'pt', '电压互感器', { w: 70, h: 70 }, '#0a0e1a', '#ffaa00'),
    ],
  },
  {
    name: '负载设备',
    devices: [
      mk('负载设备', 'load', '负荷', { w: 65, h: 70 }, '#120a00', '#ffaa00'),
      mk('负载设备', 'motor', '电动机', { w: 65, h: 65 }, '#071a10', '#00ff9d'),
      mk('负载设备', 'capacitor', '电容器', { w: 60, h: 65 }),
      mk('负载设备', 'reactor', '电抗器', { w: 60, h: 65 }, '#0d0a1a', '#a78bfa'),
    ],
  },
  {
    name: '保护设备',
    devices: [
      mk('保护设备', 'arrester', '避雷器', { w: 60, h: 65 }, '#190000', '#ff4444'),
      mk('保护设备', 'ground', '接地', { w: 55, h: 60 }, '#0d1220', '#6a90b8', 1.5),
    ],
  },
  {
    name: '扩展类型',
    devices: [
      mk('扩展类型', 'text_device', '纯文本设备', { w: 140, h: 42 }, '#0d1a30', '#66b6ff', 1.5, { renderKind: 'text' }),
      mk('扩展类型', 'graphic_device', '纯图形设备', { w: 70, h: 70 }, '#0d1a30', '#4ade80', 2, { renderKind: 'graphic' }),
      mk('扩展类型', 'vue_component_node', 'Vue组件节点', { w: 188, h: 96 }, '#0d1a30', '#22d3ee', 2, { renderKind: 'vue' }),
    ],
  },
]

export const deviceList = deviceCategories.flatMap((cat) => cat.devices)

export function getDeviceByType(type: string) {
  return deviceList.find((d) => d.type === type) ?? deviceList[0]
}
