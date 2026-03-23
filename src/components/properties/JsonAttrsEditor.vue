<template>
  <div class="json-editor">
    <el-input v-model="text" type="textarea" :rows="8" placeholder="请输入 JSON 对象" @blur="emitChange" />
    <div class="json-editor__footer">
      <span :class="['json-editor__status', error ? 'is-error' : 'is-ok']">{{ error || 'JSON 有效' }}</span>
      <el-button size="small" type="primary" @click="emitChange">应用</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ modelValue: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>] }>()

const text = ref(JSON.stringify(props.modelValue ?? {}, null, 2))
const error = ref('')

watch(
  () => props.modelValue,
  (value) => {
    text.value = JSON.stringify(value ?? {}, null, 2)
    error.value = ''
  },
  { deep: true },
)

function emitChange() {
  try {
    const parsed = JSON.parse(text.value || '{}')
    error.value = ''
    emit('update:modelValue', parsed)
  } catch {
    error.value = 'JSON 格式错误'
  }
}
</script>

<style scoped>
.json-editor__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.json-editor__status {
  font-size: 12px;
}
.is-error {
  color: #dc2626;
}
.is-ok {
  color: #16a34a;
}
</style>
