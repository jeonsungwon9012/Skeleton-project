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
          selectedCategory.value.includes('전체') ||
          selectedCategory.value.includes(item.categoryName); // 배열로 체크
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
  const filteredByToday = (list) =>
    computed(() => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const past = list.value
        .filter((item) => new Date(item.date) <= today)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // 이전 날짜 내림차순

      const future = list.value
        .filter(
          (item) => new Date(item.date) > today && item.isRecurring === true,
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // 이후 날짜 오름차순

      return [...past, ...future]; // 이전 날짜 먼저, 이후 날짜 아래
    });

  const upcomingList = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return budgetList.value
      .filter(
        (item) => item.isRecurring === true && new Date(item.date) > today,
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  });

  return {
    budgetList,
    categories,
    loadData,
    filteredByCategory,
    filteredByMonth,
    filteredByType,
    filteredByToday,
    upcomingList,
  };
});
