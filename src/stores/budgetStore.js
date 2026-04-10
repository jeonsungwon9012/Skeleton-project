import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchBudgetData } from '../../api/budgetApi';

export const useTransactionStore = defineStore('transaction', () => {
  const budgetList = ref([]);
  const categories = ref([]);

  // 데이터 불러오기
  const loadData = async () => {
    try {
      const data = await fetchBudgetData();

      const categoryNameMap = new Map();
      const categoryImgMap = new Map();
      const categoryColorMap = new Map();

      data.CATEGORY.forEach((cate) => {
        categoryNameMap.set(cate.id, cate.name);
        categoryImgMap.set(cate.id, cate.img);
        categoryColorMap.set(cate.id, cate.color);
      });

      categories.value = data.CATEGORY;
      budgetList.value = data.BUDGET.map((budget) => ({
        ...budget,
        categoryName: categoryNameMap.get(budget.cid) || '알 수 없음',
        categoryImg: categoryImgMap.get(budget.cid) || '❓',
        categoryColor: categoryColorMap.get(budget.cid) || '#000000',
      }));
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
    }
  };

  // 필터링: 카테고리 + 검색
  const filteredByCategory = (selectedCategory, search) =>
    computed(() =>
      budgetList.value.filter((item) => {
        const matchCategory =
          selectedCategory.value === '전체' ||
          item.categoryName === selectedCategory.value;
        const matchSearch =
          item.detail.includes(search.value) ||
          item.memo.includes(search.value);
        return matchCategory && matchSearch;
      }),
    );

  // 필터링: 월
  const filteredByMonth = (list, currentMonth) =>
    computed(() =>
      list.value.filter(
        (item) => parseInt(item.date.split('-')[1], 10) === currentMonth.value,
      ),
    );

  // 필터링: 타입
  const filteredByType = (list, selectedType) =>
    computed(() =>
      list.value.filter(
        (item) =>
          selectedType.value === '전체' || selectedType.value === item.type,
      ),
    );

  return {
    budgetList,
    categories,
    loadData,
    filteredByCategory,
    filteredByMonth,
    filteredByType,
  };
});
