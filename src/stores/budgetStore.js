import { defineStore } from 'pinia';

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    budgets: [], // 원본 데이터
    currentMonth: new Date(), // 현재 캘린더 기준 월
    selectedDate: null, // 클릭한 날짜 (DailyList 출력용)
    selectedCategory: null, // 클릭한 카테고리 (필터 및 최신내역 출력용)
  }),

  getters: {
    // 1. 이번 달 데이터만 필터링
    filteredBudgets: (state) => {
      return state.budgets.filter((item) => {
        const d = new Date(item.date);
        return (
          d.getMonth() === state.currentMonth.getMonth() &&
          d.getFullYear() === state.currentMonth.getFullYear()
        );
      });
    },

    // 2. 캘린더 점 (카테고리 필터 영향 받음)
    calendarDots: (state) => {
      if (!state.selectedCategory) return state.filteredBudgets;
      return state.filteredBudgets.filter(
        (item) => item.cid === state.selectedCategory
      );
    },

    // 3. 데일리 리스트 및 최신 내역의 재료 (날짜/카테고리 동시 적용)
    rangeBudgets: (state) => {
      let result = state.budgets;
      if (state.selectedDate) {
        result = result.filter((item) => item.date === state.selectedDate);
      }
      if (state.selectedCategory) {
        result = result.filter((item) => item.cid === state.selectedCategory);
      }
      return result;
    },

    // 4. 수입/지출 합계 객체
    selectedTotal: (getters) => {
      return getters.rangeBudgets.reduce(
        (acc, cur) => {
          if (cur.type === 'income') acc.income += cur.amount;
          else acc.expense += cur.amount;
          return acc;
        },
        { income: 0, expense: 0 }
      );
    },

    // 5. 최신순 내림차순 정렬 (필터링된 데이터를 재사용)
    monthlyRecentTransactions: (getters) => {
      return [...getters.rangeBudgets].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
    },
  },

  actions: {
    // [스왑 로직] 날짜 클릭 시 카테고리 해제
    setRange(date) {
      this.selectedDate = date;
      this.selectedCategory = null;
    },

    // [스왑 로직] 카테고리 클릭 시 날짜 해제
    setCategory(cid) {
      this.selectedCategory = this.selectedCategory === cid ? null : cid;
      this.selectedDate = null;
    },

    changeMonth(diff) {
      const next = new Date(this.currentMonth);
      next.setMonth(next.getMonth() + diff);
      this.currentMonth = next;
      this.selectedDate = null;
      this.selectedCategory = null;
    },
  },
});
