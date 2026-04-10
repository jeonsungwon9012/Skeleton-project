<template>
  <section class="view-placeholder">
    <div class="view-placeholder-card">
      <p class="view-eyebrow">{{ eyebrow }}</p>
      <h1 class="view-title">{{ title }}</h1>
      <p class="view-description">{{ description }}</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: 'Ready',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.view-placeholder {
  min-height: 100vh;
  padding: 32px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top left, rgba(103, 234, 118, 0.22), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f7faf8 100%);
}

.view-placeholder-card {
  max-width: 760px;
  padding: 40px;
  border-radius: 32px;
  background-color: var(--color-white);
  box-shadow: 0 18px 40px rgba(44, 51, 51, 0.08);
}

.view-eyebrow {
  margin: 0 0 10px;
  color: var(--color-sub-100);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.view-title {
  margin: 0 0 14px;
  color: var(--color-deepgray-100);
  font-size: 2.1rem;
}

.view-description {
  margin: 0;
  color: var(--color-deepgray-80);
  font-size: 1rem;
  line-height: 1.7;
}
</style>
