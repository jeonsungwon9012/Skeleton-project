import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchAllDashboardData } from '../api/budget';
import { templateApi } from '../api/template';
import { categoryApi } from '../api/category';
import { useUserStore } from './userStore';
import axios from 'axios';

export const useTransactionStore = defineStore('transaction', () => {
  const userStore = useUserStore();
  const budgetList = ref([]);
  const categories = ref([]);
  const templates = ref([]);
  const users = ref([]);

  // --- [공통 상태] ---
  const currentUid = computed(() => userStore.user?.id);
  const currentMonth = ref(new Date()); // Date 객체 (캘린더용)
  const currentMonthNum = ref(new Date().getMonth() + 1); // 숫자 (리스트용)

  // --- [필터 상태] ---
  const selectedDates = ref([]); // 캘린더 선택 날짜
  const selectedCategories = ref([]); // 카테고리 ID 배열 (Number)
  const selectedType = ref('전체'); // '전체', 'income', 'expense'
  const searchQuery = ref(''); // 검색어
  const isScheduledOnly = ref(false); // 예정 내역 필터

  // --- [Getters] ---

  const myBudgets = computed(() => {
    return budgetList.value.filter(
      (b) => Number(b.uid) === Number(currentUid.value),
    );
  });

  const categoryMap = computed(() => {
    return categories.value.reduce((acc, cat) => {
      acc[String(cat.id)] = cat;
      return acc;
    }, {});
  });

  // 캘린더용 점(Dots) 데이터
  const calendarDots = computed(() => {
    return myBudgets.value.filter((item) => {
      const matchCat =
        selectedCategories.value.length === 0 ||
        selectedCategories.value.includes(Number(item.cid));
      const matchType =
        selectedType.value === '전체' || item.type === selectedType.value;
      return matchCat && matchType;
    });
  });

  // 캘린더 선택 날짜/카테고리 기반 상세 내역
  const rangeBudgets = computed(() => {
    return myBudgets.value.filter((item) => {
      const matchDate =
        selectedDates.value.length === 0 ||
        selectedDates.value.includes(item.date);
      const matchCat =
        selectedCategories.value.length === 0 ||
        selectedCategories.value.includes(Number(item.cid));
      const matchType =
        selectedType.value === '전체' || item.type === selectedType.value;
      const isFuture = new Date(item.date) > new Date();
      const matchScheduled = !isScheduledOnly.value || isFuture;
      const matchSearch =
        !searchQuery.value ||
        item.detail.includes(searchQuery.value) ||
        (item.memo && item.memo.includes(searchQuery.value));

      return (
        matchDate && matchCat && matchType && matchScheduled && matchSearch
      );
    });
  });

  const selectedTotal = computed(() => {
    return rangeBudgets.value.reduce(
      (acc, cur) => {
        if (cur.type === 'income') acc.income += cur.amount;
        else acc.expense += cur.amount;
        return acc;
      },
      { income: 0, expense: 0 },
    );
  });

  // 데이터 불러오기
  const loadData = async (uid = currentUid.value) => {
    if (!uid) return;

    try {
      const [budgetRes, categoryRes, templateRes, userRes] = await Promise.all([
        axios.get(`/api/BUDGET?uid=${uid}`),
        categoryApi.getCategories(),
        templateApi.getTemplates(uid),
        axios.get('/api/USER'),
      ]);

      const rawCategories = categoryRes.data || [];
      categories.value = rawCategories.filter(
        (c) => c.isBasic || String(c.uid) === String(uid),
      );

      budgetList.value = budgetRes.data.map((budget) => {
        const cat = categoryMap.value[String(budget.cid)];
        return {
          ...budget,
          categoryName: cat?.name || '알 수 없음',
          categoryImg: cat?.img || '❓',
          categoryColor: cat?.color || '#000000',
        };
      });
      templates.value = templateRes.data || [];
      users.value = userRes.data || [];
    } catch (err) {
      console.error('데이터 로딩 실패:', err);
    }
  };

  // fetchData는 loadData의 별칭으로 유지 (캘린더 호환성)
  const fetchData = loadData;

  // --- [캘린더 전용 Actions] ---
  function changeMonth(diff) {
    const next = new Date(currentMonth.value);
    next.setMonth(next.getMonth() + diff);
    currentMonth.value = next;
    currentMonthNum.value = next.getMonth() + 1;
    resetFilters();
  }

  function toggleDate(date, isShiftPressed = false) {
    if (isShiftPressed) {
      const index = selectedDates.value.indexOf(date);
      if (index > -1) selectedDates.value.splice(index, 1);
      else selectedDates.value.push(date);
    } else {
      selectedDates.value =
        selectedDates.value[0] === date && selectedDates.value.length === 1
          ? []
          : [date];
    }
    selectedCategories.value = [];
    isScheduledOnly.value = false;
  }

  function toggleCategory(cid) {
    const numCid = Number(cid);
    const index = selectedCategories.value.indexOf(numCid);
    if (index > -1) selectedCategories.value.splice(index, 1);
    else selectedCategories.value.push(numCid);
    selectedDates.value = [];
    isScheduledOnly.value = false;
  }

  function resetFilters() {
    selectedType.value = '전체';
    selectedCategories.value = [];
    isScheduledOnly.value = false;
    selectedDates.value = [];
    searchQuery.value = '';
  }

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

  // 필터링: 월 (currentMonthNum이 숫자이므로 안전하게 비교)
  const filteredByMonth = (list, monthNum) =>
    computed(() => {
      const target = monthNum?.value || monthNum;
      return list.value.filter(
        (item) => parseInt(item.date.split('-')[1], 10) === Number(target),
      );
    });

  // 필터링: 타입
  const filteredByType = (list, selectedType) =>
    computed(() =>
      list.value.filter(
        (item) =>
          selectedType.value === '전체' || selectedType.value === item.type,
      ),
    );

  function setTransactionType(type) {
    selectedType.value = type;
  }

  function toggleScheduled() {
    isScheduledOnly.value = !isScheduledOnly.value;
  }

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

  // 💡 더 유연한 요약 함수 (연도 대응)
  const getMonthlySummary = (yearOrMonth, month) => {
    let targetMonth;
    if (month === undefined) {
      const now = new Date();
      targetMonth = `${now.getFullYear()}-${String(yearOrMonth).padStart(2, '0')}`;
    } else {
      targetMonth = `${yearOrMonth}-${String(month).padStart(2, '0')}`;
    }
    const summary = myBudgets.value
      .filter((b) => b.date.startsWith(targetMonth))
      .reduce(
        (acc, cur) => {
          const amount = Number(cur.amount) || 0;
          if (cur.type === 'income') acc.income += amount;
          else acc.expense += amount;
          return acc;
        },
        { income: 0, expense: 0 },
      );
    return {
      ...summary,
      net: summary.income - summary.expense,
      total: summary.income - summary.expense,
    };
  };

  // 💡 [추가] 유저별 템플릿 개수 확인
  const getTemplateCountByUser = (uid = currentUid.value) =>
    templates.value.filter((t) => Number(t.uid) === Number(uid)).length;

  // 💡 [추가] 거래 내역 추가
  const addBudget = async (payload) => {
    // 💡 현재 목록에서 가장 큰 ID + 1 (숫자 형식)
    const nextId =
      Math.max(
        0,
        ...budgetList.value.map((b) => parseInt(b.id)).filter((n) => !isNaN(n)),
      ) + 1;

    const response = await axios.post('/api/BUDGET', {
      id: nextId,
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
      (b) => Number(b.id) === Number(id),
    );
    if (index !== -1) budgetList.value[index] = response.data;
    return response.data;
  };

  // 💡 [추가] 카테고리 추가
  const addCategory = async (payload) => {
    const nextId =
      Math.max(...categories.value.map((c) => Number(c.id)), 0) + 1;
    const response = await categoryApi.createCategory({
      id: nextId,
      ...payload,
    });
    categories.value.push(response.data);
    return response.data;
  };

  // 💡 [추가] 거래 내역 삭제
  const deleteBudget = async (id) => {
    await axios.delete(`/api/BUDGET/${id}`);
    // 로컬 상태 업데이트
    budgetList.value = budgetList.value.filter(
      (b) => Number(b.id) !== Number(id),
    );
    return true;
  };

  // 💡 [추가] 템플릿 추가
  const addTemplate = async (payload) => {
    const nextId =
      Math.max(
        0,
        ...templates.value.map((t) => parseInt(t.id)).filter((n) => !isNaN(n)),
      ) + 1;

    const response = await axios.post('/api/TEMPLATE', {
      id: nextId,
      ...payload,
      uid: Number(currentUid.value),
    });
    templates.value.push(response.data);
    return response.data;
  };

  // 💡 [추가] 템플릿 수정
  const editTemplate = async (id, payload) => {
    const response = await axios.put(`/api/TEMPLATE/${id}`, payload);
    const index = templates.value.findIndex((t) => String(t.id) === String(id));
    if (index !== -1) templates.value[index] = response.data;
    return response.data;
  };

  return {
    budgetList,
    budgets: budgetList, // 하위 호환성을 위한 별칭 추가
    myBudgets,
    categories,
    categoryMap,
    templates,
    currentMonth,
    currentMonthNum,
    selectedDates,
    selectedCategories,
    selectedType,
    searchQuery,
    isScheduledOnly,
    calendarDots,
    rangeBudgets,
    selectedTotal,
    loadData,
    fetchData,
    filteredByCategory,
    filteredByMonth,
    filteredByType,
    filteredByToday,
    upcomingList,
    getMonthlySummary,
    getTemplateCountByUser,
    addBudget,
    addCategory,
    editBudget,
    deleteBudget,
    addTemplate,
    editTemplate,
    changeMonth,
    toggleDate,
    toggleCategory,
    setTransactionType,
    toggleScheduled,
    resetFilters,
  };
});
