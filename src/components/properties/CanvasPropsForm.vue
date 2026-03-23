<template>
  <SectionCard title="画布属性">
    <el-form label-position="top" size="small">
      <el-form-item label="背景色">
        <el-color-picker :model-value="modelValue.background" @change="update('background', $event || '#0a1220')" />
      </el-form-item>

      <el-form-item label="网格颜色">
        <el-color-picker :model-value="modelValue.gridColor" @change="update('gridColor', $event || '#1a3050')" />
      </el-form-item>

      <el-form-item label="网格类型">
        <el-select :model-value="modelValue.gridType" @change="update('gridType', $event)">
          <el-option label="点阵" value="dot" />
          <el-option label="线" value="line" />
          <el-option label="十字" value="cross" />
        </el-select>
      </el-form-item>

      <el-form-item label="网格大小">
        <el-slider :min="10" :max="60" :step="1" v-model="modelValue.gridSize" @input="update('gridSize', Number($event))" />
      </el-form-item>

      <el-form-item label="开关">
        <div class="switch-list">
          <el-switch :model-value="modelValue.gridVisible" active-text="网格" @change="update('gridVisible', $event)" />
          <el-switch :model-value="modelValue.snapline" active-text="吸附线" @change="update('snapline', $event)" />
          <el-switch :model-value="modelValue.rubberband" active-text="框选" @change="update('rubberband', $event)" />
          <el-switch :model-value="modelValue.panning" active-text="平移" @change="update('panning', $event)" />
          <el-switch :model-value="modelValue.mousewheel" active-text="滚轮缩放" @change="update('mousewheel', $event)" />
        </div>
      </el-form-item>
    </el-form>
  </SectionCard>
</template>

<script setup lang="ts">
import SectionCard from '../common/SectionCard.vue'
import type { CanvasProps } from '../../types/graph'

const props = defineProps<{ modelValue: CanvasProps }>()
const emit = defineEmits<{ 'update:modelValue': [value: CanvasProps] }>()

function update<K extends keyof CanvasProps>(key: K, value: CanvasProps[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<style scoped>
.switch-list {
  display: grid;
  gap: 10px;
}
</style>
