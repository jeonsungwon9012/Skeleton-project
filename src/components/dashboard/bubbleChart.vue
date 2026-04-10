<template>
  <div class="chart-page">
    <div v-if="store.isLoading" class="loading">로딩중...</div>

    <template v-else>
      <p class="subtitle">카테고리 별 수입/지출</p>
      <!-- 제목 - topCategory → topCountCategory (빈도 기준) -->
      <h2 class="title">
        {{
          store.topCountCategory
            ? `${store.topCountCategory.img} ${store.topCountCategory.name}에 가장 자주 지출하고 있어요`
            : '이번 달 지출 내역이 없어요'
        }}
      </h2>

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
            style="display: block; width: 100%; height: auto; overflow: visible"
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
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useCategoryStore } from '@/stores/category';

const store = useCategoryStore();
const bubbleWrapRef = ref(null);
const svgSize = 300;

const tooltip = ref({ visible: false, x: 0, y: 0, data: null });

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
  const uid = localStorage.getItem('userId') || '1';
  await store.fetchAll(uid);
  await nextTick();
  refreshBubbles();
});

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
  margin: 0 0 0.3rem;
}

.title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 2rem;
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
