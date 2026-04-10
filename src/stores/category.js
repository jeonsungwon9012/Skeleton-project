// ================================================================
// stores/category.js
// 카테고리별 지출 분석 스토어
// - 카테고리 목록, 목표 예산, 실제 지출 내역을 관리
// - 이달의 지출 통계 및 차트용 데이터를 computed로 제공
// ================================================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { categoryApi } from '@/api/category';

export const useCategoryStore = defineStore('category', () => {
  // 전체 카테고리 목록 (CATEGORY 테이블)
  const categories = ref([]);
  // 유저별 카테고리 목표 예산 (CATEGORY_BUDGET 테이블)
  const categoryBudgets = ref([]);
  // 유저의 전체 지출 내역 (BUDGET 테이블)
  const budgets = ref([]);
  // API 호출 중 여부 (로딩 UI 제어용)
  const isLoading = ref(false);

  // 이번 달 지출 내역만 필터링 (type === 'expense' && 날짜가 이번 달)
  const currentMonthBudgets = computed(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return budgets.value.filter((b) => {
      return b.type === 'expense' && b.date.startsWith(`${year}-${month}`);
    });
  });

  // 카테고리 ID별 이번 달 지출 금액 합산 → { cid: 총액 }
  const expenseByCategory = computed(() => {
    const map = {};
    for (const b of currentMonthBudgets.value) {
      map[b.cid] = (map[b.cid] || 0) + b.amount;
    }
    return map;
  });

  // 이번 달 전체 지출 총액
  const totalExpense = computed(() =>
    Object.values(expenseByCategory.value).reduce((a, b) => a + b, 0),
  );

  // 이번 달 지출 금액이 가장 큰 카테고리 객체 반환
  const topExpenseCategory = computed(() => {
    const map = expenseByCategory.value;
    const topCid = Object.keys(map).sort((a, b) => map[b] - map[a])[0];
    return categories.value.find((c) => c.id === topCid) || null;
  });

  // 카테고리 ID별 이번 달 지출 횟수 → { cid: 횟수 }
  const expenseCountByCategory = computed(() => {
    const map = {};
    for (const b of currentMonthBudgets.value) {
      map[b.cid] = (map[b.cid] || 0) + 1;
    }
    return map;
  });

  // 이번 달 지출 횟수가 가장 많은 카테고리 객체 반환
  const topCountCategory = computed(() => {
    const map = expenseCountByCategory.value;
    const topCid = Object.keys(map).sort((a, b) => map[b] - map[a])[0];
    return categories.value.find((c) => c.id === String(topCid)) || null;
  });

  // 버블 차트 및 카테고리 리스트용 데이터
  // - 이번 달 지출이 있는 카테고리만 포함
  // - 각 항목에 amount(지출액), ratio(전체 대비 %), goalAmount(목표 예산) 추가
  // - 지출액 내림차순 정렬
  const chartData = computed(() => {
    const map = expenseByCategory.value;
    const total = totalExpense.value;
    return categories.value
      .filter((c) => map[c.id])
      .map((c) => ({
        ...c,
        amount: map[c.id],
        ratio: total > 0 ? Math.round((map[c.id] / total) * 100) : 0,
        goalAmount:
          categoryBudgets.value.find((b) => String(b.cid) === String(c.id))
            ?.amount || null,
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  // 카테고리 목록 / 목표 예산 / 지출 내역을 병렬로 fetch
  // uid: 현재 로그인한 유저 ID (localStorage에서 읽어 전달)
  const fetchAll = async (uid) => {
    isLoading.value = true;
    try {
      const [catRes, budgetRes, expenseRes] = await Promise.all([
        categoryApi.getCategories(),
        categoryApi.getCategoryBudgets(uid),
        categoryApi.getBudgets(uid),
      ]);
      categories.value = catRes.data.map((c) => ({ ...c, id: String(c.id) }));
      categoryBudgets.value = budgetRes.data;
      budgets.value = expenseRes.data;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    categories, // 전체 카테고리 목록
    categoryBudgets, // 유저별 카테고리 목표 예산
    budgets, // 유저의 전체 지출 내역
    isLoading, // 로딩 상태
    expenseByCategory, // { cid: 이번 달 지출 총액 }
    totalExpense, // 이번 달 전체 지출 총액
    topExpenseCategory, // 이번 달 지출액 1위 카테고리
    expenseCountByCategory, // { cid: 이번 달 지출 횟수 }
    topCountCategory, // 이번 달 지출 빈도 1위 카테고리
    chartData, // 차트/리스트 렌더링용 가공 데이터
    fetchAll, // 전체 데이터 fetch (uid 필요)
  };
});
