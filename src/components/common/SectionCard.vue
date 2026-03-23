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
  background: linear-gradient(180deg, rgba(15, 31, 53, 0.92) 0%, rgba(10, 23, 42, 0.92) 100%);
  border: 1px solid #1f3658;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.24);
}
.section-card__header {
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5ecff4;
  border-bottom: 1px solid #1b3354;
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.08), rgba(0, 212, 255, 0));
}
.section-card__body {
  padding: 14px;
}
</style>
