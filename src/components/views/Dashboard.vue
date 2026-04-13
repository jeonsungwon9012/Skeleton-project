<template>
  <div class="dashboard-wrapper">
    <ThisMonthSummary />
    <div class="main-side">
      <div class="left-side">
        <SummaryCard />
        <BubbleChart />
      </div>

      <div class="right-side">
        <RecentTransaction />
        <UpcomingTransaction />
      </div>
    </div>
  </div>
</template>

<script setup>
import SummaryCard from '../dashboard/SummaryCard.vue';
import ThisMonthSummary from '../dashboard/summary.vue';
import BubbleChart from '../dashboard/bubbleChart.vue';
import RecentTransaction from '../dashboard/RecentTransaction.vue';
import UpcomingTransaction from '../dashboard/UpcomingTransaction.vue';
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  width: 100%;
  align-items: flex-start;
  flex-direction: column;
  gap: 20px;
}

.main-side {
  display: flex;
  gap: 24px;
  width: 100%;
}

.left-side,
.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.right-side > * {
  background-color: var(--color-white, #fff);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

@media (max-width: 1024px) {
  .main-side {
    flex-direction: column;
    gap: 20px;
  }

  .left-side,
  .right-side {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .dashboard-wrapper {
    gap: 16px;
    padding: 0 12px 20px;
    box-sizing: border-box;
  }

  .main-side,
  .left-side,
  .right-side {
    gap: 16px;
  }

  .right-side > * {
    border-radius: 20px;
    box-shadow: 0 10px 26px rgba(44, 51, 51, 0.08);
    padding: 16px;
  }
}
</style>
