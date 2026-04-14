<template>
  <div class="cards">
    <div class="card">
      <div class="card-icon">💸</div>
      <p class="card-label expense">
        {{ compareMode ? '전 달 대비 지출' : '이번 달 지출' }}
      </p>
      <p class="card-value" :class="getTrendClass(summary.expense)">
        <span
          v-if="compareMode && summary.expense !== 0"
          :class="summary.expense > 0 ? 'trend-red' : 'trend-green'"
        >
          {{ summary.expense > 0 ? '▲' : '▼' }}
        </span>
        {{
          compareMode
            ? Math.abs(summary.expense).toLocaleString()
            : summary.expense.toLocaleString()
        }}원
      </p>
    </div>
    <div class="card">
      <div class="card-icon">💰</div>
      <p class="card-label income">
        {{ compareMode ? '전 달 대비 수입' : '이번 달 수입' }}
      </p>
      <p class="card-value" :class="getTrendClass(summary.income)">
        <span
          v-if="compareMode && summary.income !== 0"
          :class="summary.income > 0 ? 'trend-green' : 'trend-red'"
        >
          {{ summary.income > 0 ? '▲' : '▼' }}
        </span>
        {{
          compareMode
            ? Math.abs(summary.income).toLocaleString()
            : summary.income.toLocaleString()
        }}원
      </p>
    </div>
    <div class="card">
      <div class="card-icon">📈</div>
      <p class="card-label net">
        {{ compareMode ? '전 달 대비 순수익' : '이번 달 순수익' }}
      </p>
      <p class="card-value" :class="getTrendClass(summary.net)">
        <span
          v-if="compareMode && summary.net !== 0"
          :class="summary.net > 0 ? 'trend-green' : 'trend-red'"
        >
          {{ summary.net > 0 ? '▲' : '▼' }}
        </span>
        {{
          compareMode
            ? Math.abs(summary.net).toLocaleString()
            : summary.net.toLocaleString()
        }}원
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useTransactionStore } from '@/stores/budgetStore';
import { useDashboardStore } from '@/stores/dashboard';

const props = defineProps({
  compareMode: { type: Boolean, default: false },
});

const store = useTransactionStore();
const dashboard = useDashboardStore();

onMounted(() => store.loadData());

const getTrendClass = (val) => {
  if (!val) return '';
  const amountStr = Math.abs(val).toLocaleString() + '원';
  // 아이콘이 있고 금액이 길 경우를 대비해 가상의 길이를 계산 (아이콘 + 여백 ≈ 2자)
  const totalLength =
    amountStr.length + (props.compareMode && val !== 0 ? 2 : 0);

  if (totalLength > 18) return 'extremely-long';
  if (totalLength > 15) return 'very-long';
  if (totalLength > 12) return 'long';
  return '';
};

const summary = computed(() => {
  const current = store.getMonthlySummary(
    dashboard.currentYear,
    dashboard.currentMonth,
  );

  if (!props.compareMode) return current;

  // 이전 달 계산 로직
  let prevYear = dashboard.currentYear;
  let prevMonth = dashboard.currentMonth - 1;

  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  const prev = store.getMonthlySummary(prevYear, prevMonth);

  return {
    expense: current.expense - prev.expense,
    income: current.income - prev.income,
    net: current.net - prev.net,
  };
});
</script>

<style scoped>
.cards {
  display: flex;
  gap: 24px;
}

.card {
  flex: 1;
  min-width: 0;
  background: #fff;
  border: 1.5px solid #f0f0f0;
  border-radius: 16px;
  padding: 20px 16px;
  position: relative;
  transition: box-shadow 0.2s;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

.card-icon {
  font-size: 22px;
  margin-bottom: 12px;
}

.card-label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.card-label.expense {
  color: #e74c3c;
}

.card-label.income {
  color: #4caf50;
}

.card-label.net {
  color: #3498db;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
  word-break: keep-all;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: font-size 0.2s ease;
}

.card-value.long {
  font-size: 18px;
}

.card-value.very-long {
  font-size: 14px;
}

.card-value.extremely-long {
  font-size: 12px;
}

.trend-red {
  color: #e74c3c;
  font-size: 0.8em;
  margin-right: 4px;
}

.trend-green {
  color: #4caf50;
  font-size: 0.8em;
  margin-right: 4px;
}

@media (max-width: 768px) {
  .cards {
    flex-direction: column;
    gap: 12px;
  }

  .card {
    border-radius: 20px;
    padding: 16px 18px;
    box-shadow: 0 10px 24px rgba(44, 51, 51, 0.06);
  }

  .card-icon {
    font-size: 18px;
    margin-bottom: 8px;
  }

  .card-label {
    font-size: 12px;
    margin-bottom: 6px;
  }

  .card-value {
    font-size: 18px;
  }

  .card-value.long {
    font-size: 15px;
  }

  .card-value.very-long {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .card-value {
    font-size: 16px; /* 기본 폰트 크기 더 작게 */
  }

  .card-value.long {
    font-size: 14px;
  }

  .card-value.very-long {
    font-size: 12px;
  }

  .card-value.extremely-long {
    font-size: 10px; /* 가장 작은 폰트 크기 */
  }
}
</style>
