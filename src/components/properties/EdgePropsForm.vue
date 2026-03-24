<template>
  <div class="panel-stack">
    <SectionCard title="基本信息">
      <el-form label-position="top" size="small">
        <el-form-item label="名称">
          <el-input :model-value="modelValue.label" @input="update('label', String($event))" />
        </el-form-item>
        <el-form-item label="线路类型">
          <el-select :model-value="modelValue.lineType" @change="update('lineType', $event)">
            <el-option label="架空线" value="overhead" />
            <el-option label="电缆" value="cable" />
            <el-option label="母线" value="busbar" />
            <el-option label="控制线" value="control" />
            <el-option label="通信线" value="comm" />
          </el-select>
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="线条样式">
      <el-form label-position="top" size="small">
        <el-form-item label="颜色">
          <el-color-picker :model-value="modelValue.color" @change="update('color', $event || '#00d4ff')" />
        </el-form-item>
        <el-form-item label="宽度">
          <el-slider :min="1" :max="8" :step="0.5" show-input :model-value="modelValue.width" @input="updateWidth" />
        </el-form-item>
        <el-form-item label="虚线">
          <el-input :model-value="modelValue.dash" placeholder="例如 8 4" @input="update('dash', String($event))" />
        </el-form-item>
        <el-form-item label="路由">
          <el-select :model-value="modelValue.router" @change="update('router', $event)">
            <el-option label="normal" value="normal" />
            <el-option label="orth" value="orth" />
            <el-option label="manhattan" value="manhattan" />
            <el-option label="er" value="er" />
          </el-select>
        </el-form-item>
        <el-form-item label="连接器">
          <el-select :model-value="modelValue.connector" @change="update('connector', $event)">
            <el-option label="normal" value="normal" />
            <el-option label="rounded" value="rounded" />
            <el-option label="smooth" value="smooth" />
          </el-select>
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="箭头">
      <el-form label-position="top" size="small">
        <el-form-item label="起点">
          <el-select :model-value="modelValue.srcMark" @change="update('srcMark', $event)">
            <el-option label="none" value="none" />
            <el-option label="classic" value="classic" />
            <el-option label="block" value="block" />
            <el-option label="open" value="open" />
            <el-option label="circle" value="circle" />
            <el-option label="diamond" value="diamond" />
            <el-option label="square" value="square" />
            <el-option label="async" value="async" />
          </el-select>
        </el-form-item>
        <el-form-item label="终点">
          <el-select :model-value="modelValue.tgtMark" @change="update('tgtMark', $event)">
            <el-option label="none" value="none" />
            <el-option label="classic" value="classic" />
            <el-option label="block" value="block" />
            <el-option label="open" value="open" />
            <el-option label="circle" value="circle" />
            <el-option label="diamond" value="diamond" />
            <el-option label="square" value="square" />
            <el-option label="async" value="async" />
          </el-select>
        </el-form-item>
        <el-form-item label="箭头尺寸">
          <el-slider :min="4" :max="20" :step="1" :model-value="modelValue.markSize" @input="update('markSize', Number($event))" />
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="动画">
      <el-form label-position="top" size="small">
        <el-form-item label="启用动画">
          <el-switch :model-value="modelValue.anim" @change="update('anim', $event)" />
        </el-form-item>
        <el-form-item label="速度">
          <el-slider :min="0.5" :max="6" :step="0.1" :model-value="modelValue.speed" @input="update('speed', Number($event))" />
        </el-form-item>
        <el-form-item label="方向">
          <el-radio-group :model-value="modelValue.dir" @change="update('dir', $event)">
            <el-radio-button label="forward">正向</el-radio-button>
            <el-radio-button label="reverse">反向</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="扩展属性">
      <el-form label-position="top" size="small">
        <el-form-item label="电压等级">
          <el-input :model-value="modelValue.voltage" @input="update('voltage', String($event))" />
        </el-form-item>
        <el-form-item label="唯一标识">
          <el-input :model-value="modelValue.runtimeId" @input="update('runtimeId', String($event))" />
        </el-form-item>
        <el-form-item label="电流(A)">
          <el-input-number :model-value="modelValue.amp" :min="0" :step="10" @change="update('amp', Number($event))" />
        </el-form-item>
        <el-form-item label="长度">
          <el-input :model-value="modelValue.len" @input="update('len', String($event))" />
        </el-form-item>
        <el-form-item label="阻抗">
          <el-input :model-value="modelValue.impedance" @input="update('impedance', String($event))" />
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="自定义属性">
      <el-form label-position="top" size="small">
        <el-form-item label="Key">
          <el-input :model-value="modelValue.customKey" @input="update('customKey', String($event))" />
        </el-form-item>
        <el-form-item label="Value">
          <el-input :model-value="modelValue.customVal" @input="update('customVal', String($event))" />
        </el-form-item>
      </el-form>
      <JsonAttrsEditor :model-value="modelValue.extraAttrs" @update:model-value="emit('update:extraAttrs', $event)" />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import SectionCard from '../common/SectionCard.vue'
import JsonAttrsEditor from './JsonAttrsEditor.vue'
import type { EdgeSelectionData } from '../../types/graph'

const props = defineProps<{ modelValue: EdgeSelectionData }>()
const emit = defineEmits<{
  'update:modelValue': [value: EdgeSelectionData]
  'update:extraAttrs': [value: Record<string, any>]
}>()
function update<K extends keyof EdgeSelectionData>(key: K, value: EdgeSelectionData[K]) {
  emit('update:modelValue', { ...props.modelValue,[key]: value })
}

function updateWidth(value: number | [number, number] | string) {
  const raw = Array.isArray(value) ? value[0] : value
  const next = Number(raw)
  if (!Number.isFinite(next)) return
  update('width', next)
}
</script>

<style scoped>
.panel-stack {
  display: grid;
  gap: 12px;
}
</style>
