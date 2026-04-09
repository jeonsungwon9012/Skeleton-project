<script setup>
const props = defineProps(['date']);
const formattedDate = props.date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
</script>

<template>
  <div class="detail-card">
    <header class="detail-header">
      <span class="caption">Selected Date</span>
      <h4 class="h4">{{ formattedDate }}</h4>
    </header>

    <div class="list-container">
      <div class="item">
        <div class="category-icon bg-mint"></div>
        <div class="item-info">
          <p class="subtitle-m">지하철 요금</p>
          <p class="caption">교통/차량</p>
        </div>
        <span class="amount body-l">-1,500원</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-card {
  background: var(--color-white);
  padding: 24px;
  border-radius: 20px;
  box-shadow: var(--drop--shadow);
}
.detail-header { margin-bottom: 24px; }
.list-container { display: flex; flex-direction: column; gap: 16px; }
.item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--color-deepgray-10); }
.category-icon { width: 40px; height: 40px; border-radius: 12px; }
.bg-mint { background-color: var(--category-mint); }
.item-info { flex: 1; }
.amount { font-weight: 700; color: var(--color-sub-100); }
</style>