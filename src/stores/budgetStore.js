import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchAllDashboardData } from '../api/budget';
import { templateApi } from '../api/template';
import { useUserStore } from './userStore';
import axios from 'axios';

export const useTransactionStore = defineStore('transaction', () => {
  const userStore = useUserStore();
  const budgetList = ref([]);
  const categories = ref([]);
  const templates = ref([]);

  const currentUid = computed(() => userStore.user?.id);

  // 💡 [추가] 로그인한 유저의 내역만 필터링하는 반응형 객체
  const myBudgets = computed(() => {
    return budgetList.value.filter(
      (b) => String(b.uid) === String(currentUid.value),
    );
  });

  // 데이터 불러오기
  const loadData = async () => {
    const uid = currentUid.value;
    if (!uid) return;

    try {
      const [data, tData] = await Promise.all([
        fetchAllDashboardData(uid),
        templateApi.getTemplates(uid),
      ]);

      const categoryNameMap = new Map();
      const categoryImgMap = new Map();
      const categoryColorMap = new Map();

      data.CATEGORY.forEach((cate) => {
        const cid = String(cate.id);
        categoryNameMap.set(cid, cate.name);
        categoryImgMap.set(cid, cate.img);
        categoryColorMap.set(cid, cate.color);
      });

      categories.value = data.CATEGORY;
      budgetList.value = data.BUDGET.map((budget) => {
        const cidKey = String(budget.cid);
        return {
          ...budget,
          categoryName: categoryNameMap.get(cidKey) || '알 수 없음',
          categoryImg: categoryImgMap.get(cidKey) || '❓',
          categoryColor: categoryColorMap.get(cidKey) || '#000000',
        };
      });
      templates.value = tData.data || [];
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
    }
  };

  // 필터링: 카테고리 + 검색
  const filteredByCategory = (selectedCategory, search) =>
    computed(() => {
      const cats = selectedCategory?.value || [];
      const searchVal = search?.value || '';

      return myBudgets.value.filter((item) => {
        const matchCategory =
          cats.length === 0 ||
          cats.includes('전체') ||
          cats.includes(item.categoryName);
        const matchSearch =
          item.detail.includes(searchVal) ||
          (item.memo && item.memo.includes(searchVal));
        return matchCategory && matchSearch;
      });
    });

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

    return myBudgets.value
      .filter(
        (item) => item.isRecurring === true && new Date(item.date) > today,
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  });

  const getMonthlySummary = (month) => {
    const monthlyList = myBudgets.value.filter(
      (item) => parseInt(item.date.split('-')[1], 10) === month,
    );

    const expense = monthlyList
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    const income = monthlyList
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      expense,
      income,
      net: income - expense,
    };
  };

  // 💡 [추가] 유저별 템플릿 개수 확인
  const getTemplateCountByUser = (uid = currentUid.value) =>
    templates.value.filter((t) => String(t.uid) === String(uid)).length;

  // 💡 [추가] 거래 내역 추가
  const addBudget = async (payload) => {
    const response = await axios.post('/api/BUDGET', {
      ...payload,
      uid: Number(currentUid.value),
    });
    budgetList.value.push(response.data);
    return response.data;
  };

  // 💡 [추가] 거래 내역 수정
  const editBudget = async (id, payload) => {
    const response = await axios.put(`/api/BUDGET/${id}`, payload);
    const index = budgetList.value.findIndex(
      (b) => String(b.id) === String(id),
    );
    if (index !== -1) budgetList.value[index] = response.data;
    return response.data;
  };

  // 💡 [추가] 템플릿 추가
  const addTemplate = async (payload) => {
    const response = await axios.post('/api/TEMPLATE', {
      ...payload,
      uid: Number(currentUid.value),
    });
    templates.value.push(response.data);
    return response.data;
  };

  return {
    budgetList,
    categories,
    templates,
    loadData,
    filteredByCategory,
    filteredByMonth,
    filteredByType,
    filteredByToday,
    upcomingList,
    getMonthlySummary,
    getTemplateCountByUser,
    addBudget,
    editBudget,
    addTemplate,
  };
});
