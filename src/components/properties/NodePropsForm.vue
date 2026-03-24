<template>
  <div class="panel-stack">
    <SectionCard title="基本信息">
      <el-form label-position="top" size="small">
        <el-form-item label="名称">
          <el-input :model-value="modelValue.label" @input="emitPatch('label', String($event))" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-input :model-value="modelValue.deviceType" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-select :model-value="modelValue.status" @change="emitPatch('status', $event)">
            <el-option label="运行" value="running" />
            <el-option label="停运" value="stopped" />
            <el-option label="故障" value="fault" />
            <el-option label="检修" value="maintenance" />
          </el-select>
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="位置尺寸">
      <el-form label-position="top" size="small" class="grid-2">
        <el-form-item label="X">
          <el-input-number :model-value="modelValue.x" :step="1" @change="emitPatch('x', Number($event))" />
        </el-form-item>
        <el-form-item label="Y">
          <el-input-number :model-value="modelValue.y" :step="1" @change="emitPatch('y', Number($event))" />
        </el-form-item>
        <el-form-item label="宽度">
          <el-input-number :model-value="modelValue.width" :min="20" :step="1" @change="emitPatch('width', Number($event))" />
        </el-form-item>
        <el-form-item label="高度">
          <el-input-number :model-value="modelValue.height" :min="20" :step="1" @change="emitPatch('height', Number($event))" />
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="外观">
      <el-form label-position="top" size="small">
        <el-form-item label="填充">
          <el-color-picker :model-value="modelValue.fill" @change="emitPatch('fill', $event || '#071830')" />
        </el-form-item>
        <el-form-item label="边框颜色">
          <el-color-picker :model-value="modelValue.stroke" @change="emitPatch('stroke', $event || '#00d4ff')" />
        </el-form-item>
        <el-form-item label="边框宽度">
          <el-slider :min="1" :max="8" :step="0.5" v-model="modelValue.strokeWidth" @input="emitPatch('strokeWidth', Number($event))" />
        </el-form-item>
        <el-form-item label="圆角">
          <el-slider :min="0" :max="20" :step="1" v-model="modelValue.radius" @input="emitPatch('radius', Number($event))" />
        </el-form-item>
        <el-form-item label="透明度">
          <el-slider :min="0.1" :max="1" :step="0.05" v-model="modelValue.opacity" @input="emitPatch('opacity', Number($event))" />
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="标签">
      <el-form label-position="top" size="small">
        <el-form-item label="字号">
          <el-slider :min="8" :max="24" :step="1" v-model="modelValue.fontSize" @change="emitPatch('fontSize', Number($event))" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker :model-value="modelValue.fontColor" @change="emitPatch('fontColor', $event || '#e0f0ff')" />
        </el-form-item>
        <el-form-item label="位置">
          <el-select :model-value="modelValue.labelPos" @change="emitPatch('labelPos', $event)">
            <el-option label="中心" value="center" />
            <el-option label="上方" value="top" />
            <el-option label="下方" value="bottom" />
            <el-option label="左侧" value="left" />
            <el-option label="右侧" value="right" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示标签">
          <el-switch :model-value="modelValue.showLabel" @change="emitPatch('showLabel', $event)" />
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="连接点数量">
      <el-form label-position="top" size="small" class="grid-2">
        <el-form-item label="上">
          <el-input-number :min="0" :max="5" :model-value="localCounts.top" @change="updateCount('top', Number($event))" />
        </el-form-item>
        <el-form-item label="右">
          <el-input-number :min="0" :max="5" :model-value="localCounts.right" @change="updateCount('right', Number($event))" />
        </el-form-item>
        <el-form-item label="下">
          <el-input-number :min="0" :max="5" :model-value="localCounts.bottom" @change="updateCount('bottom', Number($event))" />
        </el-form-item>
        <el-form-item label="左">
          <el-input-number :min="0" :max="5" :model-value="localCounts.left" @change="updateCount('left', Number($event))" />
        </el-form-item>
      </el-form>

      <div class="port-preview-wrap">
        <div
          ref="previewRef"
          class="port-preview"
          @pointermove="onPreviewPointerMove"
          @pointerup="onPreviewPointerUp"
          @pointerleave="onPreviewPointerUp"
        >
          <div class="port-preview__node"></div>
          <div
            v-for="(item, index) in localPortList"
            :key="item.id"
            class="port-dot"
            :style="dotStyle(item)"
            :title="`${item.id} (${item.dir})`"
            @pointerdown="onPortPointerDown($event, index)"
          ></div>
        </div>
      </div>

      <div class="port-list">
        <div v-for="(item, index) in localPortList" :key="item.id" class="port-row">
          <el-input :model-value="item.id" disabled />
          <el-select :model-value="item.dir" @change="updatePort(index, 'dir', $event)">
            <el-option label="上" value="top" />
            <el-option label="右" value="right" />
            <el-option label="下" value="bottom" />
            <el-option label="左" value="left" />
          </el-select>
          <el-select :model-value="item.unit" @change="updatePort(index, 'unit', $event)">
            <el-option label="%" value="%" />
            <el-option label="px" value="px" />
          </el-select>
          <el-input-number style="width:100px;" :controls="false" :model-value="item.pos" :step="1" @change="updatePort(index, 'pos', Number($event))" />
        </div>
      </div>
    </SectionCard>

    <SectionCard title="扩展属性">
      <el-form label-position="top" size="small" class="grid-2">
        <el-form-item label="电压等级">
          <el-input :model-value="modelValue.voltage" @input="emitPatch('voltage', String($event))" />
        </el-form-item>
        <el-form-item label="唯一标识">
          <el-input :model-value="modelValue.runtimeId" @input="emitPatch('runtimeId', String($event))" />
        </el-form-item>
        <el-form-item label="可旋转">
          <el-switch :model-value="modelValue.rotatable" @change="emitPatch('rotatable', $event)" />
        </el-form-item>
        <el-form-item label="可缩放">
          <el-switch :model-value="modelValue.resizable" @change="emitPatch('resizable', $event)" />
        </el-form-item>
        <el-form-item label="锁定">
          <el-switch :model-value="modelValue.locked" @change="emitPatch('locked', $event)" />
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="自定义属性">
      <el-form label-position="top" size="small">
        <el-form-item label="Key">
          <el-input :model-value="modelValue.customKey" @input="emitPatch('customKey', String($event))" />
        </el-form-item>
        <el-form-item label="Value">
          <el-input :model-value="modelValue.customVal" @input="emitPatch('customVal', String($event))" />
        </el-form-item>
      </el-form>
      <JsonAttrsEditor :model-value="modelValue.extraAttrs" @update:model-value="emit('update:extraAttrs', $event)" />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NodeSelectionData, PortCountConfig, PortPositionConfig } from '../../types/graph'
import { buildPortList } from '../../constants/defaults'
import SectionCard from '../common/SectionCard.vue'
import JsonAttrsEditor from './JsonAttrsEditor.vue'

const props = defineProps<{ modelValue: NodeSelectionData }>()
const emit = defineEmits<{
  'update:patch': [value: Partial<NodeSelectionData>]
  'update:ports': [value: { portCounts: PortCountConfig; portList: PortPositionConfig[] }]
  'update:extraAttrs': [value: Record<string, any>]
}>()

const PREVIEW_W = 220
const PREVIEW_H = 140
const previewRef = ref<HTMLDivElement | null>(null)
const draggingIndex = ref<number | null>(null)

const localCounts = ref<PortCountConfig>({ ...props.modelValue.portCounts })
const localPortList = ref<PortPositionConfig[]>(JSON.parse(JSON.stringify(props.modelValue.portList)))

watch(
  () => props.modelValue,
  (value) => {
    localCounts.value = { ...value.portCounts }
    localPortList.value = JSON.parse(JSON.stringify(value.portList))
  },
  { deep: true },
)

function emitPatch<K extends keyof NodeSelectionData>(key: K, value: NodeSelectionData[K]) {
  emit('update:patch', { [key]: value } as Partial<NodeSelectionData>)
}

function emitPorts() {
  emit('update:ports', {
    portCounts: { ...localCounts.value },
    portList: JSON.parse(JSON.stringify(localPortList.value)),
  })
}

function updateCount(key: keyof PortCountConfig, value: number) {
  localCounts.value = { ...localCounts.value, [key]: Math.max(0, Math.min(5, Number.isFinite(value) ? value : 0)) }
  localPortList.value = buildPortList(localCounts.value, localPortList.value)
  emitPorts()
}

function updatePort(index: number, key: keyof PortPositionConfig, value: string | number) {
  const next = [...localPortList.value]
  next[index] = { ...next[index], [key]: value } as PortPositionConfig
  localPortList.value = next
  emitPorts()
}

function valueToPercent(item: PortPositionConfig) {
  if (item.unit === '%') return item.pos
  const base = item.dir === 'top' || item.dir === 'bottom' ? PREVIEW_W : PREVIEW_H
  return (item.pos / Math.max(1, base)) * 100
}

function dotStyle(item: PortPositionConfig) {
  const pct = Math.max(0, Math.min(100, valueToPercent(item)))
  if (item.dir === 'top') return { left: `${pct}%`, top: '0%' }
  if (item.dir === 'bottom') return { left: `${pct}%`, top: '100%' }
  if (item.dir === 'left') return { left: '0%', top: `${pct}%` }
  return { left: '100%', top: `${pct}%` }
}

function onPortPointerDown(event: PointerEvent, index: number) {
  draggingIndex.value = index
  ;(event.target as HTMLElement).setPointerCapture?.(event.pointerId)
}

function onPreviewPointerMove(event: PointerEvent) {
  if (draggingIndex.value === null || !previewRef.value) return
  const item = localPortList.value[draggingIndex.value]
  const rect = previewRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const axisLength = item.dir === 'top' || item.dir === 'bottom' ? rect.width : rect.height
  const raw = item.dir === 'top' || item.dir === 'bottom' ? x : y
  const clamped = Math.max(0, Math.min(axisLength, raw))

  const nextPos = item.unit === '%' ? Number(((clamped / Math.max(1, axisLength)) * 100).toFixed(1)) : Math.round(clamped)
  updatePort(draggingIndex.value, 'pos', nextPos)
}

function onPreviewPointerUp() {
  draggingIndex.value = null
}
</script>

<style scoped>
.panel-stack {
  display: grid;
  gap: 12px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 8px;
}

.port-preview-wrap {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 10px;
}

.port-preview {
  position: relative;
  width: 220px;
  height: 90px;
  border: 1px dashed #2d4a77;
  border-radius: 8px;
  background: #081226;
  touch-action: none;
}

.port-preview__node {
  position: absolute;
  left: 0%;
  top: 0%;
  width: 100%;
  height: 100%;
  border: 1px solid #00d4ff;
  border-radius: 8px;
  background: rgba(0, 212, 255, 0.08);
}

.port-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #00d4ff;
  border: 1px solid #ffffff;
  transform: translate(-50%, -50%);
  cursor: grab;
  z-index: 2;
}

.port-dot:active {
  cursor: grabbing;
}

.port-list {
  display: grid;
  gap: 8px;
  margin-top: 8px;
}

.port-row {
  display: grid;
  grid-template-columns: 1fr 80px 70px 110px;
  gap: 8px;
  align-items: center;
}
</style>
