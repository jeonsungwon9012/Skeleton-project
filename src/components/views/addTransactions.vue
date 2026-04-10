<template>
  <section class="add-transactions-page">
    <Rigister />
  </section>
</template>

<script setup>
import Rigister from '../addTransaction/Register.vue';
</script>

<style scoped>
.add-transactions-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px;
  box-sizing: border-box;
  background-color: var(--color-white);
}
</style>
