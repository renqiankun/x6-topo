<template>
  <el-dialog
    v-model="visible"
    title="拓扑预览"
    width="90vw"
    top="4vh"
    class="preview-dialog"
    destroy-on-close
  >
    <div class="preview-layout">
      <TopologyPreviewCanvas
        :topology-json="topologyJson"
        :data-json="runtimeText"
        @error="errorMessage = $event"
      />

      <aside class="preview-layout__panel">
        <div class="preview-panel__group">
          <div class="preview-panel__title">数据 JSON（实时生效，支持注释）</div>
          <el-input
            :model-value="runtimeText"
            type="textarea"
            :autosize="{ minRows: 18, maxRows: 24 }"
            @input="handleRuntimeTextInput"
          />
        </div>

        <div class="preview-panel__group">
          <div class="preview-panel__title">画布 JSON（只读）</div>
          <el-input
            :model-value="topologyText"
            type="textarea"
            :autosize="{ minRows: 7, maxRows: 12 }"
            readonly
          />
        </div>

        <div class="preview-panel__hint">
          支持字段：通用 `label/hide/opacity/status`；设备常用 `bgColor/borderColor/strokeWidth/fontColor/fontSize/showLabel`；
          线常用 `lineColor/lineWidth/lineDash/lineAnim/lineAnimSpeed/lineAnimDir`。
        </div>
        <div v-if="errorMessage" class="preview-panel__error">{{ errorMessage }}</div>
      </aside>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TopologyPreviewCanvas from './TopologyPreviewCanvas.vue'

type TopologyInput = string | Record<string, unknown> | null
type RuntimeInput = string | Record<string, unknown> | null

const props = defineProps<{
  modelValue: boolean
  topologyJson: TopologyInput
  dataJson: RuntimeInput
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:dataJson': [value: string]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const runtimeText = ref('')
const topologyText = ref('')
const errorMessage = ref('')

function handleRuntimeTextInput(value: string | number) {
  runtimeText.value = String(value)
  emit('update:dataJson', runtimeText.value)
}

watch(
  () => props.dataJson,
  (value) => {
    runtimeText.value = typeof value === 'string' ? value : JSON.stringify(value || {}, null, 2)
  },
  { immediate: true, deep: true },
)

watch(
  () => props.topologyJson,
  (value) => {
    topologyText.value = typeof value === 'string' ? value : JSON.stringify(value || {}, null, 2)
  },
  { immediate: true, deep: true },
)
</script>

<style scoped>
.preview-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 14px;
  min-height: 72vh;
}

.preview-layout__panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-panel__group {
  display: grid;
  gap: 6px;
}

.preview-panel__title {
  font-size: 12px;
  color: #8fb7d8;
}

.preview-panel__hint {
  color: #8fb7d8;
  font-size: 12px;
  white-space: pre-wrap;
}

.preview-panel__error {
  color: #ef4444;
  font-size: 12px;
  white-space: pre-wrap;
}

@media (max-width: 1200px) {
  .preview-layout {
    grid-template-columns: 1fr;
  }
}
</style>
