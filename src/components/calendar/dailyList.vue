<script setup>
import { computed } from 'vue';
import { useBudgetStore } from '@/stores/budgetStore2.js';

const props = defineProps({
  items: { type: Array, default: () => [] },
  dates: { type: Array, default: () => [] },
  total: { type: Object, default: () => ({ income: 0, expense: 0 }) },
});

const emit = defineEmits(['add-click', 'edit-click', 'delete-click']);
const budgetStore = useBudgetStore();

const formattedDate = computed(() => {
  if (!props.dates[0]) return '';
  const date = new Date(props.dates[0]);
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
});

const firstDateItems = computed(() => {
  if (!props.dates[0]) return [];
  const filtered = props.items.filter(
    (item) => item.date.substring(0, 10) === props.dates[0],
  );

  const now = new Date();
  const past = filtered
    .filter((item) => new Date(item.date) <= now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const future = filtered
    .filter((item) => new Date(item.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return [...past, ...future];
});

const firstDateTotal = computed(() =>
  firstDateItems.value.reduce(
    (acc, cur) => {
      if (cur.type === 'income') acc.income += cur.amount;
      else acc.expense += cur.amount;
      return acc;
    },
    { income: 0, expense: 0 },
  ),
);

const groupedItems = computed(() =>
  firstDateItems.value.reduce((acc, cur) => {
    const categoryName = budgetStore.categoryMap[cur.cid]?.name || '기타';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(cur);
    return acc;
  }, {}),
);

const topCategoryName = computed(() => {
  if (firstDateItems.value.length === 0) return null;
  const expenseItems = firstDateItems.value.filter(
    (item) => item.type === 'expense',
  );
  if (expenseItems.length === 0) return null;

  const totals = expenseItems.reduce((acc, cur) => {
    const catName = budgetStore.categoryMap[cur.cid]?.name || '기타';
    acc[catName] = (acc[catName] || 0) + cur.amount;
    return acc;
  }, {});

  return Object.keys(totals).reduce((a, b) => (totals[a] > totals[b] ? a : b));
});

const formatPrice = (price) => `${price?.toLocaleString()} 원`;

const goToAdd = () => {
  emit('add-click', props.dates[0]);
};
</script>

<template>
  <div class="daily-list-card">
    <header class="list-header">
      <h2 class="date-title h3">{{ formattedDate }}</h2>
      <p v-if="topCategoryName" class="status-msg body-m">
        {{ topCategoryName }}에 평소보다 많이 썼네요!
      </p>
    </header>

    <div class="summary-chips">
      <div class="chip expense body-m">
        <div class="chip-label">
          <span class="chip-icon">💸</span>
          <span>총 지출</span>
        </div>
        <span class="amount">{{ formatPrice(firstDateTotal.expense) }}</span>
      </div>
      <div class="chip income body-m">
        <div class="chip-label">
          <span class="chip-icon">💰</span>
          <span>총 수입</span>
        </div>
        <span class="amount">{{ formatPrice(firstDateTotal.income) }}</span>
      </div>
    </div>

    <hr class="divider" />

    <div class="list-content">
      <h3 class="section-title subtitle-m">카테고리 별 내역</h3>

      <div
        v-for="(list, categoryName) in groupedItems"
        :key="categoryName"
        class="category-group"
      >
        <div
          class="category-badge subtitle-s"
          :style="{ color: budgetStore.categoryMap[list[0].cid]?.color }"
        >
          <span class="emoji">{{
            budgetStore.categoryMap[list[0].cid]?.img || '🏷️'
          }}</span>
          {{ categoryName }}
        </div>

        <ul class="transaction-items">
          <li v-for="item in list" :key="item.id" class="item-row">
            <div class="item-left">
              <div
                class="cat-icon-circle"
                :style="{
                  backgroundColor:
                    budgetStore.categoryMap[item.cid]?.color + '20',
                }"
              >
                {{ budgetStore.categoryMap[item.cid]?.img || '🏷️' }}
              </div>
              <span class="item-name body-m">{{ item.detail }}</span>
            </div>
            <div class="item-right">
              <span
                class="item-amount body-m"
                :class="item.type === 'expense' ? 'negative' : 'positive'"
              >
                {{ item.type === 'expense' ? '-' : '+' }}
                {{ Number(item.amount).toLocaleString() }}원
              </span>

              <div class="action-icons">
                <svg
                  class="icon-btn pencil"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  @click="emit('edit-click', item)"
                >
                  <path
                    d="M14.3632 5.65156L15.8431 4.17157C16.6242 3.39052 17.8905 3.39052 18.6716 4.17157L20.0858 5.58579C20.8668 6.36683 20.8668 7.63316 20.0858 8.41421L18.6058 9.8942M14.3632 5.65156L4.74749 15.2672C4.41542 15.5993 4.21079 16.0376 4.16947 16.5054L3.92738 19.2459C3.87261 19.8659 4.39148 20.3848 5.0115 20.33L7.75191 20.0879C8.21972 20.0466 8.65806 19.8419 8.99013 19.5099L18.6058 9.8942M14.3632 5.65156L18.6058 9.8942"
                  />
                </svg>
                <svg
                  class="icon-btn trash"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  @click="emit('delete-click', item.id)"
                >
                  <path
                    d="M20 9L18.005 20.3463C17.8369 21.3026 17.0062 22 16.0353 22H7.96474C6.99379 22 6.1631 21.3026 5.99496 20.3463L4 9H20Z"
                  />
                  <path
                    d="M21 6H15.375M3 6H8.625M8.625 6V4C8.625 2.89543 9.52043 2 10.625 2H13.375C14.4796 2 15.375 2.89543 15.375 4V6M8.625 6H15.375"
                  />
                </svg>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <button class="add-btn btn-m" @click="goToAdd">
      이 날짜로 가계부 추가하기
      <span class="plus-circle">+</span>
    </button>
  </div>
</template>

<style scoped>
.daily-list-card {
  background-color: var(--color-gray-10);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 600px;
  box-shadow: var(--drop--shadow);
}

.list-header {
  margin-bottom: 24px;
}

.date-title {
  color: var(--color-deepgray-100);
  margin-bottom: 4px;
}

.status-msg {
  color: var(--color-deepgray-60);
}

.summary-chips {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.chip {
  background: var(--color-white);
  padding: 12px 20px;
  border-radius: 99px;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.chip.expense .amount {
  color: var(--color-red, #e74c3c);
  font-weight: 600;
}

.chip.income .amount {
  color: #2ecc71;
  font-weight: 600;
}

.chip-label {
  display: flex;
  align-items: center;
  gap: 6px; /* 아이콘과 텍스트 사이 간격 */
}

.chip-icon {
  font-size: 1.2em; /* 아이콘 크기 조정 */
  line-height: 1;
}

.divider {
  border: 0;
  border-top: 1px solid var(--color-deepgray-10);
  margin-bottom: 24px;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.section-title {
  margin-bottom: 16px;
  color: var(--color-deepgray-100);
}

.category-group {
  margin-bottom: 28px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-white);
  padding: 6px 16px;
  border-radius: 99px;
  margin-bottom: 12px;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.cat-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.item-amount.negative {
  color: var(--color-red, #e74c3c);
  font-weight: 600;
}

.item-amount.positive {
  color: #2ecc71;
  font-weight: 600;
}

.action-icons {
  display: flex;
  gap: 8px;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.item-row:hover .action-icons {
  opacity: 1;
}

.icon-btn {
  cursor: pointer;
  transition: transform 0.2s;
}

.icon-btn.pencil:hover {
  color: var(--color-primary);
  transform: scale(1.2);
}

.icon-btn.trash:hover {
  color: #e74c3c;
  transform: scale(1.2);
}

.add-btn {
  margin-top: 16px;
  background-color: var(--color-white);
  border: none;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.plus-circle {
  width: 28px;
  height: 28px;
  background-color: var(--color-deepgray-100);
  color: var(--color-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-content::-webkit-scrollbar {
  width: 4px;
}

.list-content::-webkit-scrollbar-thumb {
  background: var(--color-deepgray-20);
  border-radius: 10px;
}

@media (max-width: 768px) {
  .daily-list-card {
    height: auto;
    min-height: 0;
    border-radius: 24px;
    padding: 20px 18px 24px;
    background-color: var(--color-white);
    box-shadow: 0 10px 26px rgba(44, 51, 51, 0.08);
  }

  .date-title {
    font-size: 1.45rem;
  }

  .status-msg,
  .section-title,
  .item-name,
  .item-amount,
  .chip {
    font-size: 0.9rem;
  }

  .summary-chips {
    gap: 10px;
  }

  .chip {
    padding: 10px 14px;
  }

  .list-content {
    overflow: visible;
    padding-right: 0;
  }

  .item-row {
    gap: 10px;
    align-items: flex-start;
  }

  .item-right {
    gap: 8px;
  }

  .action-icons {
    opacity: 1;
  }

  .add-btn {
    margin-top: 14px;
    background: linear-gradient(180deg, #dff9dd 0%, #d6f6d5 100%);
  }

  .chip-label {
    gap: 4px;
  }

  .plus-circle {
    background-color: var(--color-primary);
    color: #17311d;
  }
}
</style>
