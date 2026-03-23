<template>
  <div class="toolbar">
    <div class="toolbar__actions">
      <el-button-group>
        <el-button size="small" @click="emit('undo')">撤销</el-button>
        <el-button size="small" @click="emit('redo')">重做</el-button>
      </el-button-group>

      <el-button-group>
        <el-button size="small" @click="emit('copy')">复制</el-button>
        <el-button size="small" @click="emit('paste')">粘贴</el-button>
        <el-button size="small" @click="emit('delete')">删除</el-button>
      </el-button-group>

      <el-button-group>
        <el-button size="small" @click="emit('group')">组合</el-button>
        <el-button size="small" @click="emit('ungroup')">解组</el-button>
        <el-button size="small" @click="emit('selectAll')">全选</el-button>
      </el-button-group>

      <el-button-group>
        <el-button size="small" @click="emit('zoomIn')">放大</el-button>
        <el-button size="small" @click="emit('zoomOut')">缩小</el-button>
        <el-button size="small" @click="emit('fit')">适应</el-button>
        <el-button size="small" @click="emit('center')">居中</el-button>
      </el-button-group>

      <el-button-group>
        <el-button size="small" @click="emit('demo')">示例</el-button>
        <el-button size="small" @click="emit('clear')">清空</el-button>
        <el-button size="small" @click="emit('export')">导出</el-button>
        <el-button size="small" @click="emit('import')">导入</el-button>
      </el-button-group>
    </div>

    <div class="toolbar__status">
      <span>N {{ nodeCount }}</span>
      <span>E {{ edgeCount }}</span>
      <span>Z {{ zoomPct }}%</span>
      <span>({{ mousePos.x }}, {{ mousePos.y }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  nodeCount: number
  edgeCount: number
  zoomPct: number
  mousePos: { x: number; y: number }
}>()

const emit = defineEmits<{
  undo: []
  redo: []
  copy: []
  paste: []
  delete: []
  group: []
  ungroup: []
  selectAll: []
  zoomIn: []
  zoomOut: []
  fit: []
  center: []
  demo: []
  clear: []
  export: []
  import: []
}>()
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #1d2a44;
  background: #0f1b2f;
}

.toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar__status {
  display: flex;
  gap: 12px;
  color: #93a7c2;
  font-size: 12px;
}
</style>
