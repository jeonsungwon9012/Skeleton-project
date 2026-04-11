<template>
  <div class="dashboard-wrapper">
    <thisMonthSummary />
    <div class="mainSide">
      <!-- 좌측: 월 요약 -->
      <div class="leftSide">
        <SummaryCard />
        <bubbleChart />
      </div>

      <div class="rightSide">
        <RecentTransaction />
        <UpcomingTransaction />
      </div>
    </div>
  </div>
</template>

<script setup>
import SummaryCard from '../dashboard/SummaryCard.vue';
import thisMonthSummary from '../dashboard/summary.vue';
import bubbleChart from '../dashboard/bubbleChart.vue';
import RecentTransaction from '../dashboard/RecentTransaction.vue';
import UpcomingTransaction from '../dashboard/UpcomingTransaction.vue';
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  width: 100%;
  align-items: flex-start;
  flex-direction: column;
  gap: 20px; /* 컴포넌트 간 간격 */
}

.mainSide {
  display: flex;
  gap: 24px;
  width: 100%;
}

.leftSide,
.rightSide {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rightSide > * {
  background-color: var(--color-white, #fff);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

@media (max-width: 1024px) {
  .mainSide {
    flex-direction: column;
    gap: 20px;
  }

  .leftSide,
  .rightSide {
    width: 100%;
    min-width: unset;
  }
}
</style>
