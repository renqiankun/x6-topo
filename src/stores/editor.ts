import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SelectionKind } from '../types/graph'

export const useEditorStore = defineStore('editor', () => {
  const selectionKind = ref<SelectionKind>('canvas')
  const selectedCellId = ref<string | null>(null)
  const selectedCellIds = ref<string[]>([])

  function setSelection(kind: SelectionKind, id: string | null = null, ids: string[] = []) {
    selectionKind.value = kind
    selectedCellId.value = id
    selectedCellIds.value = ids
  }

  return {
    selectionKind,
    selectedCellId,
    selectedCellIds,
    setSelection,
  }
})
