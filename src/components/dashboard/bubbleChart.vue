<template>
  <div class="chart-page">
    <div v-if="store.isLoading" class="loading">로딩중...</div>

    <template v-else>
      <p class="subtitle">카테고리 별 수입/지출</p>
      <!-- 제목 - topCategory → topCountCategory (빈도 기준) -->
      <div class="title-area">
        <h2 class="title">
          {{
            store.topCountCategory
              ? `${store.topCountCategory.img} ${store.topCountCategory.name}에 가장 자주 지출하고 있어요`
              : '이번 달 지출 내역이 없어요'
          }}
        </h2>
        <button class="budget-btn" @click="isBudgetModalOpen = true">
          예산 설정하기
        </button>
      </div>

      <template v-if="store.chartData.length > 0">
        <div class="content">
          <!-- SVG 버블 차트 -->
          <div class="bubble-wrap" ref="bubbleWrapRef">
            <!-- 툴팁 -->
            <div
              v-if="tooltip.visible"
              class="bubble-tooltip"
              :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
            >
              <span class="tooltip-icon">{{ tooltip.data?.img }}</span>
              <div class="tooltip-body">
                <p class="tooltip-name">{{ tooltip.data?.name }}</p>
                <p class="tooltip-amount">
                  {{ tooltip.data?.amount.toLocaleString() }}원
                </p>
                <p class="tooltip-count">
                  {{ store.expenseCountByCategory[tooltip.data?.id] }}회 지출
                </p>
                <p class="tooltip-ratio">전체의 {{ tooltip.data?.ratio }}%</p>
              </div>
            </div>

            <svg
              :viewBox="`0 0 ${svgSize} ${svgSize}`"
              :width="svgSize"
              :height="svgSize"
              style="
                display: block;
                width: 100%;
                height: auto;
                overflow: visible;
              "
            >
              <g
                v-for="(bubble, i) in bubbles"
                :key="bubble.id"
                class="bubble-group"
                @mouseenter="(e) => showTooltip(e, bubble)"
                @mousemove="(e) => moveTooltip(e)"
                @mouseleave="hideTooltip"
              >
                <circle
                  :cx="bubble.cx"
                  :cy="bubble.cy"
                  :r="0"
                  :fill="bubble.color + 'AA'"
                  :stroke="bubble.color"
                  stroke-width="1"
                  class="bubble-circle"
                  :style="{
                    animationDelay: `${i * 80}ms`,
                    '--target-r': bubble.r + 'px',
                  }"
                />
                <text
                  :x="bubble.cx"
                  :y="bubble.cy"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  :font-size="Math.max(11, Math.round(bubble.r * 0.28))"
                  font-weight="500"
                  fill="#444"
                  class="bubble-label"
                  :style="{ animationDelay: `${i * 80 + 300}ms` }"
                  style="pointer-events: none"
                >
                  {{ bubble.ratio }}%
                </text>
              </g>
            </svg>
          </div>

          <!-- 카테고리 리스트 -->
          <div class="category-list">
            <div
              v-for="(item, i) in store.chartData"
              :key="item.id"
              class="category-item"
              :style="{ animationDelay: `${i * 60}ms` }"
            >
              <div class="category-row">
                <span class="category-icon">{{ item.img }}</span>
                <span class="category-name">{{ item.name }}</span>
                <span class="category-amount"
                  >{{ item.amount.toLocaleString() }}원</span
                >
              </div>

              <template v-if="item.goalAmount">
                <div class="progress-bar-wrap">
                  <div
                    class="progress-bar-fill"
                    :style="{
                      '--fill-width':
                        Math.min(
                          Math.round((item.amount / item.goalAmount) * 100),
                          100,
                        ) + '%',
                      backgroundColor: item.color,
                      animationDelay: `${i * 60 + 200}ms`,
                    }"
                  ></div>
                </div>
                <span class="progress-pct" :style="{ color: item.color }">
                  {{
                    Math.min(
                      Math.round((item.amount / item.goalAmount) * 100),
                      100,
                    )
                  }}%
                </span>
              </template>

              <p v-else class="no-budget">설정된 목표 예산이 없어요</p>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="empty-state">
        <p class="empty-icon">📭</p>
        <p class="empty-text">이번 달 지출 내역이 없어요</p>
      </div>
    </template>
  </div>

  <!-- 💡 예산 설정 모달 연결 -->
  <SetBudgetModal
    :current-month-display="currentMonthDisplay"
    :visible="isBudgetModalOpen"
    :categories="budgetStore.categories"
    @close="isBudgetModalOpen = false"
    @save="handleSaveBudget"
  />

  <SuccessModal
    :visible="messageModal.visible"
    :title="messageModal.title"
    :description="messageModal.description"
    :icon="messageModal.icon"
    @close="messageModal.visible = false"
  />
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick, computed } from 'vue';
import { useCategoryStore } from '@/stores/category';
import { useTransactionStore } from '@/stores/budgetStore';
import { useDashboardStore } from '@/stores/dashboard';
import { useUserStore } from '@/stores/userStore'; // 💡 유저 스토어 추가
import SetBudgetModal from '@/components/common/SetBudgetModal.vue';
import SuccessModal from '@/components/common/CompleteModal.vue';

const store = useCategoryStore();
const budgetStore = useTransactionStore();
const dashboard = useDashboardStore();
const userStore = useUserStore(); // 💡 스토어 인스턴스 생성

const bubbleWrapRef = ref(null);
const svgSize = 300;

const tooltip = ref({ visible: false, x: 0, y: 0, data: null });
const isBudgetModalOpen = ref(false);
const messageModal = ref({
  visible: false,
  title: '',
  description: '',
  icon: '',
});

const currentMonthDisplay = computed(() => {
  return `${dashboard.currentYear}년 ${dashboard.currentMonth}월`;
});

const handleSaveBudget = async (data) => {
  const currentUid = userStore.user?.id;
  // 💡 대시보드에 표시된 연-월 정보 추출
  const month = `${dashboard.currentYear}-${String(dashboard.currentMonth).padStart(2, '0')}`;

  try {
    await budgetStore.saveTargetBudget({
      uid: Number(currentUid),
      month: month,
      cid: Number(data.cid),
      targetBudget: Number(data.amount),
    });

    isBudgetModalOpen.value = false;
    // 저장 후 최신 통계 데이터를 다시 불러와 차트 갱신
    await store.fetchAll(currentUid);
  } catch (error) {
    messageModal.value = {
      visible: true,
      icon: '❌',
      title: '저장 실패',
      description: '예산 저장 중 오류가 발생했습니다.',
    };
  }
};

const showTooltip = (e, bubble) => {
  tooltip.value = { visible: true, x: 0, y: 0, data: bubble };
  moveTooltip(e);
};

const moveTooltip = (e) => {
  const rect = bubbleWrapRef.value?.getBoundingClientRect();
  if (!rect) return;
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // 툴팁이 오른쪽 밖으로 나가면 왼쪽에 표시
  tooltip.value.x = x + 140 > rect.width ? x - 145 : x + 12;
  tooltip.value.y = y - 10;
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

const placeBubbles = (data) => {
  const placed = [];
  for (const d of data) {
    const maxAmount = Math.max(...data.map((x) => x.amount));
    const r = Math.max(
      12,
      Math.round((d.amount / maxAmount) * (svgSize * 0.32)),
    );
    let cx,
      cy,
      attempts = 0;
    do {
      cx = Math.random() * (svgSize - r * 2) + r;
      cy = Math.random() * (svgSize - r * 2) + r;
      attempts++;
    } while (
      attempts < 50 &&
      placed.some((p) => {
        const dist = Math.sqrt((cx - p.cx) ** 2 + (cy - p.cy) ** 2);
        return dist < (r + p.r) * 0.3;
      })
    );
    placed.push({ ...d, cx, cy, r });
  }
  return placed;
};

const bubbles = ref([]);

const refreshBubbles = () => {
  if (store.chartData.length) {
    bubbles.value = placeBubbles(store.chartData);
  }
};

onMounted(async () => {
  // 💡 이제 하드코딩된 기본값 '1'을 사용하지 않고, 로그인된 유저 ID만 사용합니다.
  const currentUid = userStore.user?.id;
  await store.fetchAll(currentUid);
  await nextTick();
  refreshBubbles();
});

// chartData가 바뀌면 버블 재배치 (기존 watch 유지)
watch(() => store.chartData, refreshBubbles, { deep: true });

onUnmounted(() => {});
</script>

<style scoped>
.chart-page {
  width: 100%;
  padding: 1.5rem 0;
}

.loading {
  text-align: center;
  color: var(--color-deepgray-40, #aaa);
  padding: 3rem;
}

.subtitle {
  font-size: 0.85rem;
  color: var(--color-deepgray-50, #888);
  margin: 0 2rem 0.3rem;
}

.title-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 2rem 2rem;
}

.title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
}

.budget-btn {
  padding: 10px 18px;
  border-radius: 12px;
  background-color: var(--color-primary);
  color: var(--color-white, #fff);
  border: none;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.budget-btn:hover {
  opacity: 0.85;
}

.content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin: 2rem;
}

.bubble-wrap {
  flex: 1;
  min-width: 0;
  position: relative;
  max-width: 40%;
}

/* 툴팁 */
.bubble-tooltip {
  position: absolute;
  z-index: 10;
  background: white;
  border: 0.5px solid #e0e0e0;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: tooltipFadeIn 0.15s ease;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-icon {
  font-size: 1.5rem;
  line-height: 1;
  margin-top: 2px;
}

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tooltip-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text, #222);
}

.tooltip-amount {
  font-size: 0.85rem;
  margin: 0;
  color: var(--color-text, #222);
}

.tooltip-count {
  font-size: 0.8rem;
  margin: 0;
  color: #888;
}

.tooltip-ratio {
  font-size: 0.8rem;
  margin: 0;
  color: #888;
}

/* 버블 hover */
.bubble-group {
  cursor: pointer;
}

.bubble-group:hover .bubble-circle {
  filter: brightness(1.1);
  stroke-width: 2;
}

@keyframes bubblePop {
  0% {
    r: 0;
    opacity: 0;
  }
  70% {
    r: calc(var(--target-r) * 1.1);
    opacity: 1;
  }
  100% {
    r: var(--target-r);
    opacity: 1;
  }
}

.bubble-circle {
  animation: bubblePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  transition:
    filter 0.15s ease,
    stroke-width 0.15s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bubble-label {
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.category-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px; /* 왼쪽 SVG 차트 높이(svgSize)와 동일하게 제한 */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

/* 스크롤바 커스텀 스타일 (프로젝트 내 다른 리스트와 통일) */
.category-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  opacity: 0;
  animation: slideIn 0.4s ease forwards;
  margin-bottom: 0.4rem;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-icon {
  font-size: 1.2rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
}

.category-name {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
}

.category-amount {
  font-size: 0.95rem;
  font-weight: 600;
}

.progress-bar-wrap {
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 99px;
  overflow: hidden;
}

@keyframes fillBar {
  from {
    width: 0;
  }
  to {
    width: var(--fill-width);
  }
}

.progress-bar-fill {
  height: 100%;
  border-radius: 99px;
  width: 0;
  animation: fillBar 0.6s ease forwards;
}

.progress-pct {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: right;
}

.no-budget {
  font-size: 0.8rem;
  color: #aaa;
  margin: 0;
}

@media (max-width: 600px) {
  .content {
    flex-direction: column;
  }
}
</style>
