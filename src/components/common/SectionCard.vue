<template>
  <section class="section-card">
    <header v-if="title" class="section-card__header">{{ title }}</header>
    <div class="section-card__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<style scoped>
.section-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.section-card__header {
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #eef2f7;
}
.section-card__body {
  padding: 14px;
}
</style>
