import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import api from 'axios'; // 생 axios 사용
import { useUserStore } from './userStore';

export const useBudgetStore = defineStore('budget', () => {
  const userStore = useUserStore();

  // --- [State] ---
  const budgets = ref([]);
  const categories = ref([]);
  const users = ref([]);
  const currentUid = computed(() => userStore.user?.id);

  const currentMonth = ref(new Date());
  const selectedDates = ref([]);
  const selectedCategories = ref([]);
  const searchQuery = ref(''); // 검색어 상태 추가
  const selectedType = ref('all');
  const isScheduledOnly = ref(false);

  // --- [Getters] ---

  /**
   * 💡 [추가] 카테고리 ID를 키로 하는 매핑 객체
   * 리스트나 달력에서 cid만 가지고 아이콘(img)과 색상(color)을 바로 찾을 때 유용함
   */
  const categoryMap = computed(() => {
    return categories.value.reduce((acc, cat) => {
      acc[Number(cat.id)] = cat;
      return acc;
    }, {});
  });

  const myBudgets = computed(() => {
    return budgets.value.filter(
      (b) => String(b.uid) === String(currentUid.value),
    );
  });

  // 달력 점 표시용 (아이콘 정보가 포함된 카테고리 맵을 나중에 컴포넌트에서 활용)
  const calendarDots = computed(() => {
    return myBudgets.value.filter((item) => {
      const matchCat =
        selectedCategories.value.length === 0 ||
        selectedCategories.value.includes(Number(item.cid));
      const matchType =
        selectedType.value === 'all' || item.type === selectedType.value;
      return matchCat && matchType;
    });
  });

  const rangeBudgets = computed(() => {
    return myBudgets.value.filter((item) => {
      const matchDate =
        selectedDates.value.length === 0 ||
        selectedDates.value.includes(item.date);
      const matchCat =
        selectedCategories.value.length === 0 ||
        selectedCategories.value.includes(Number(item.cid));
      const matchType =
        selectedType.value === 'all' || item.type === selectedType.value;
      const isFuture = new Date(item.date) > new Date();
      const matchScheduled = !isScheduledOnly.value || isFuture;

      // 검색어 필터링 추가 (상세내역 또는 메모)
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

  // 예정된 내역 (다가오는 지출 5개) - budgetStore.js의 기능 통합
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

  // --- [Actions] ---

  // 🚩 [중요] 경로 앞에 /api를 붙여서 Vite 프록시를 타게 만듭니다.
  async function fetchData() {
    const uid = currentUid.value;
    if (!uid) return;

    try {
      const [resB, resC, resU] = await Promise.all([
        api.get('/api/BUDGET'),
        api.get(`/api/BUDGET?uid=${uid}`),
        api.get('/api/CATEGORY'),
        api.get('/api/USER'),
      ]);
      budgets.value = resB.data;
      categories.value = resC.data; // 여기서 img, name, color 등이 다 들어옴
      users.value = resU.data;
      console.log('DB 데이터 로드 성공 🍐');
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  }

  // 💡 [추가] budgetStore.js와 맞춤: 카테고리 추가 기능
  async function addCategory(payload) {
    const res = await api.post('/api/CATEGORY', payload);
    categories.value.push({
      ...res.data,
      id: String(res.data.id),
    });
    return res.data;
  }

  async function addBudget(payload) {
    try {
      const res = await api.post('/api/BUDGET', {
        ...payload,
        uid: Number(currentUid.value),
      });
      budgets.value.push(res.data);
      return res.data;
    } catch (error) {
      console.error('저장 실패:', error);
    }
  }

  function changeMonth(diff) {
    const next = new Date(currentMonth.value);
    next.setMonth(next.getMonth() + diff);
    currentMonth.value = next;
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

  function setTransactionType(type) {
    selectedType.value = type;
  }
  function toggleScheduled() {
    isScheduledOnly.value = !isScheduledOnly.value;
  }
  function resetFilters() {
    selectedType.value = 'all';
    selectedCategories.value = [];
    isScheduledOnly.value = false;
    selectedDates.value = [];
  }

  /**
   * 💡 [통합] 카테고리 필터링 함수
   * budgetStore.js의 방식(배열/검색어)을 지원하도록 개선
   */
  function filteredByCategory(selectedCats = [], search = '') {
    return myBudgets.value.filter((item) => {
      const catName = categoryMap.value[item.cid]?.name || '';
      const matchCategory =
        selectedCats.length === 0 ||
        selectedCats.includes('전체') ||
        selectedCats.includes(catName);
      const matchSearch =
        !search ||
        item.detail.includes(search) ||
        (item.memo && item.memo.includes(search));
      return matchCategory && matchSearch;
    });
  }

  /**
   * 💡 [통합] 월간 요약 함수
   * 인자가 하나(월)면 현재 연도 기준, 두 개면 연/월 기준으로 작동
   */
  function getMonthlySummary(yearOrMonth, month) {
    let targetMonth;
    if (month === undefined) {
      const now = new Date();
      targetMonth = `${now.getFullYear()}-${String(yearOrMonth).padStart(2, '0')}`;
    } else {
      targetMonth = `${yearOrMonth}-${String(month).padStart(2, '0')}`;
    }

    return myBudgets.value
      .filter((b) => b.date.startsWith(targetMonth))
      .reduce(
        (acc, cur) => {
          if (cur.type === 'income') acc.income += cur.amount;
          else acc.expense += cur.amount;
          return acc;
        },
        { income: 0, expense: 0 },
      );
  }

  return {
    budgets,
    categories,
    currentMonth,
    selectedDates,
    selectedCategories,
    selectedType,
    isScheduledOnly,
    searchQuery,
    categoryMap,
    calendarDots,
    rangeBudgets,
    selectedTotal,
    upcomingList,
    fetchData,
    addBudget,
    addCategory,
    toggleDate,
    toggleCategory,
    setTransactionType,
    toggleScheduled,
    resetFilters,
    changeMonth,
    filteredByCategory, // 💡 return 객체에 추가
    getMonthlySummary, // 💡 return 객체에 추가
  };
});
