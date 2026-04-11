<template>
  <div class="summary-container">
    <thisMonthSummary />
  </div>

  <div class="dashboard-content">
    <div class="leftSide">
      <bubbleChart />
    </div>

    <div class="rightSide">
      <RecentTransaction />
      <UpcomingTransaction />
    </div>
  </div>
</template>

<script setup>
import thisMonthSummary from '../dashboard/summary.vue';
import bubbleChart from '../dashboard/bubbleChart.vue';
import RecentTransaction from '../dashboard/RecentTransaction.vue';
import UpcomingTransaction from '../dashboard/UpcomingTransaction.vue';
</script>

<style scoped>
/* 대시보드 메인 레이아웃 */
.dashboard-content {
  display: flex;
  gap: 24px;
  width: 100%;
  margin-top: 24px;
  align-items: flex-start;
}

/* 상단 요약 섹션 간격 */
.summary-container {
  width: 100%;
  margin-bottom: 24px;
}

/* 좌측 차트 영역 */
.leftSide {
  flex: 1.2; /* 차트를 조금 더 넓게 배치 */
  background-color: var(--color-white, #ffffff);
  border-radius: 12px;
  /* 가계부의 부드러운 느낌을 위한 그림자 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 20px;
  min-height: 400px;
}

/* 우측 트랜잭션 리스트 영역 */
.rightSide {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px; /* 최근 내역과 예정 내역 사이 간격 */
  min-width: 320px; /* 너무 좁아지지 않게 방지 */
}

/* 각 리스트 컴포넌트에 공통으로 적용될 스타일 (필요시) */
.rightSide > * {
  background-color: var(--color-white, #ffffff);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

/* 반응형 처리: 화면이 작아지면 세로로 배치 */
@media (max-width: 1024px) {
  .dashboard-content {
    flex-direction: column;
  }

  .leftSide,
  .rightSide {
    width: 100%;
    flex: none;
  }
}
</style>
