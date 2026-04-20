import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchAllDashboardData } from '../api/budget';
import { templateApi } from '../api/template';
import { categoryApi } from '../api/category';
import { useUserStore } from './userStore';
import { useDashboardStore } from './dashboard';
import axios from 'axios';

export const useTransactionStore = defineStore('transaction', () => {
  const userStore = useUserStore();
  const budgetList = ref([]);
  const categories = ref([]);
  const templates = ref([]);
  const monthlySummaryMessages = ref([]);
  const users = ref([]);

  // --- [공통 상태] ---
  const currentUid = computed(() => userStore.user?.id);
  const currentMonth = ref(new Date()); // Date 객체 (캘린더용)
  const currentMonthNum = ref(new Date().getMonth() + 1); // 숫자 (리스트용)

  // --- [필터 상태] ---
  const selectedDates = ref([]); // 캘린더 선택 날짜
  const selectedCategories = ref([]); // 카테고리 ID 배열 (Number)
  const selectedType = ref('all'); // 'all', 'income', 'expense'
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
    const now = Date.now();

    // 💡 날짜 데이터에 시간(HH:mm)이 포함되면서 캘린더 컴포넌트의 날짜 비교 로직(YYYY-MM-DD)이 깨지는 것을 방지합니다.
    return myBudgets.value
      .filter((item) => {
        const dateStr = item.date.split(' ')[0];
        const isCurrentMonth = dateStr.startsWith(
          `${currentMonth.value.getFullYear()}-${String(currentMonth.value.getMonth() + 1).padStart(2, '0')}`,
        );

        const itemTime = new Date(item.date.replace(' ', 'T')).getTime();
        const isScheduled = itemTime > now;

        const matchScheduled = !isScheduledOnly.value || isScheduled;
        return isCurrentMonth && matchScheduled;
      })
      .map((item) => ({
        ...item,
        // 시간 정보를 제외한 순수 날짜 정보(10자리)만 전달하여 캘린더 매칭률을 높입니다.
        date: item.date.substring(0, 10),
        isScheduled: new Date(item.date.replace(' ', 'T')).getTime() > now,
      }));
  });

  // 캘린더 선택 날짜/카테고리 기반 상세 내역
  const rangeBudgets = computed(() => {
    const now = Date.now();

    const filtered = myBudgets.value
      .filter((item) => {
        const itemTime = new Date(item.date.replace(' ', 'T')).getTime();
        const isScheduled = itemTime > now;

        const matchDate =
          selectedDates.value.length === 0 ||
          selectedDates.value.includes(item.date.substring(0, 10));
        const matchCat =
          selectedCategories.value.length === 0 ||
          selectedCategories.value.includes(Number(item.cid));
        const matchType =
          selectedType.value === 'all' || item.type === selectedType.value;

        const matchScheduled = !isScheduledOnly.value || isScheduled;
        const matchSearch =
          !searchQuery.value ||
          item.detail.includes(searchQuery.value) ||
          (item.memo && item.memo.includes(searchQuery.value));

        return (
          matchDate && matchCat && matchType && matchScheduled && matchSearch
        );
      })
      .map((item) => ({
        ...item,
        isScheduled: new Date(item.date.replace(' ', 'T')).getTime() > now,
      }));

    const past = filtered
      .filter((item) => !item.isScheduled)
      .sort(
        (a, b) =>
          new Date(b.date.replace(' ', 'T')) -
          new Date(a.date.replace(' ', 'T')),
      );
    const future = filtered
      .filter((item) => item.isScheduled)
      .sort(
        (a, b) =>
          new Date(a.date.replace(' ', 'T')) -
          new Date(b.date.replace(' ', 'T')),
      );

    return [...past, ...future];
  });

  const monthlyRecentTransactions = computed(() => rangeBudgets.value);

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
      const [budgetRes, categoryRes, templateRes, userRes, summaryMsgRes] =
        await Promise.all([
          axios.get(`/api/BUDGET?uid=${uid}`),
          categoryApi.getCategories(),
          templateApi.getTemplates(uid),
          axios.get('/api/USER'),
          axios.get('/api/monthlySummaryMessages'),
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
      monthlySummaryMessages.value = summaryMsgRes.data || [];
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

  function toggleDate(date, isCtrlPressed = false, isShiftPressed = false) {
    // 1. Shift + 클릭: 범위 선택
    if (isShiftPressed && selectedDates.value.length > 0) {
      const startStr = selectedDates.value[selectedDates.value.length - 1];
      const endStr = date;

      const start = new Date(startStr);
      const end = new Date(endStr);
      const dateList = [];

      const startTime = Math.min(start, end);
      const endTime = Math.max(start, end);

      for (
        let d = new Date(startTime);
        d <= new Date(endTime);
        d.setDate(d.getDate() + 1)
      ) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dateList.push(`${y}-${m}-${day}`);
      }

      // 기존 선택에 추가하는 것이 아니라 새로운 범위로 교체 (일반적인 OS 동작 방식)
      selectedDates.value = dateList;
    }
    // 2. Ctrl(또는 Command) + 클릭: 개별 토글 다중 선택
    else if (isCtrlPressed) {
      const index = selectedDates.value.indexOf(date);
      if (index > -1) selectedDates.value.splice(index, 1);
      else selectedDates.value.push(date);
    }
    // 3. 일반 클릭: 단일 선택
    else {
      selectedDates.value = [date];
    }
  }

  function toggleCategory(cid) {
    const numCid = Number(cid);
    const index = selectedCategories.value.indexOf(numCid);
    if (index > -1) selectedCategories.value.splice(index, 1);
    else selectedCategories.value.push(numCid);
  }

  function resetFilters() {
    selectedType.value = 'all';
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
          cats.includes(Number(item.cid));
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
          selectedType.value === 'all' || selectedType.value === item.type,
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
      const now = new Date().getTime(); // 현재 시각을 밀리초로 고정

      const past = list.value
        .filter((item) => {
          const itemTime = new Date(item.date.replace(' ', 'T')).getTime();
          return itemTime <= now;
        })
        .sort(
          (a, b) =>
            new Date(b.date.replace(' ', 'T')) -
            new Date(a.date.replace(' ', 'T')),
        )
        .map((item) => ({ ...item, isScheduled: false })); // 속성 명시적 추가

      const future = list.value
        .filter((item) => new Date(item.date.replace(' ', 'T')).getTime() > now)
        .sort(
          (a, b) =>
            new Date(a.date.replace(' ', 'T')) -
            new Date(b.date.replace(' ', 'T')),
        )
        .map((item) => ({ ...item, isScheduled: true })); // 속성 명시적 추가

      return [...past, ...future]; // 이전 날짜 먼저, 이후 날짜 아래
    });

  const upcomingList = computed(() => {
    const now = new Date().getTime();

    return myBudgets.value
      .filter(
        (item) =>
          item.isRecurring === true &&
          new Date(item.date.replace(' ', 'T')).getTime() > now,
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

  // 💡 [변경] 이번 달과 저번 달의 카테고리별 수입/지출 차이 분석 메시지
  const topMonthlyMessage = computed(() => {
    const dashboardStore = useDashboardStore();
    const currYear = dashboardStore.currentYear;
    const currMonth = dashboardStore.currentMonth;

    // 1. 이전 달 계산
    let prevYear = currYear;
    let prevMonth = currMonth - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const currPrefix = `${currYear}-${String(currMonth).padStart(2, '0')}`;
    const prevPrefix = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    // 2. 카테고리별 수입/지출 합산 함수
    const aggregate = (prefix) => {
      const totals = { income: {}, expense: {} };
      myBudgets.value.forEach((b) => {
        if (b.date.startsWith(prefix)) {
          const type = b.type;
          const cid = String(b.cid);
          totals[type][cid] =
            (totals[type][cid] || 0) + (Number(b.amount) || 0);
        }
      });
      return totals;
    };

    const currData = aggregate(currPrefix);
    const prevData = aggregate(prevPrefix);

    // 3. 모든 참여 카테고리 ID 추출
    const allCids = new Set([
      ...Object.keys(currData.income),
      ...Object.keys(currData.expense),
      ...Object.keys(prevData.income),
      ...Object.keys(prevData.expense),
    ]);

    let maxDiff = -1;
    let winner = null; // { cid, type, diff }

    allCids.forEach((cid) => {
      ['income', 'expense'].forEach((type) => {
        const currVal = currData[type][cid] || 0;
        const prevVal = prevData[type][cid] || 0;
        const diff = currVal - prevVal;
        const absDiff = Math.abs(diff);

        if (absDiff > maxDiff && absDiff !== 0) {
          maxDiff = absDiff;
          winner = { cid, type, diff };
        }
      });
    });

    if (!winner) {
      return `${currMonth}월은 아직 조용하네요! 똑딱과 함께 가계부를 써보세요.`;
    }

    // 4. 결과 메시지 조립
    const category = categoryMap.value[winner.cid];
    const categoryName = category ? `${category.img} ${category.name}` : '기타';
    const typeLabel = winner.type === 'expense' ? '지출' : '수입';
    const trend = winner.diff > 0 ? '늘었어요' : '줄었어요';

    return `이번달은 ${categoryName} ${typeLabel}이 가장 많이 ${trend}`;
  });

  // 💡 [추가] 유저별 템플릿 개수 확인
  const getTemplateCountByUser = (uid = currentUid.value) =>
    templates.value.filter((t) => Number(t.uid) === Number(uid)).length;

  // 💡 [추가] 거래 내역 추가
  const addBudget = async (payload) => {
    // 전체 내역을 가져와서 가장 큰 ID를 찾아 다음 인덱스 결정 (순차적 숫자 ID 보장)
    const allRes = await axios.get('/api/BUDGET');
    const nextId =
      Math.max(
        0,
        ...allRes.data.map((b) => Number(b.id)).filter((n) => !isNaN(n)),
      ) + 1;

    const response = await axios.post('/api/BUDGET', {
      id: nextId,
      ...payload,
      uid: Number(payload.uid || currentUid.value),
      cid: Number(payload.cid),
    });

    // 현재 로드된 유저의 목록에 해당하는 경우에만 로컬 상태 업데이트
    if (Number(response.data.uid) === Number(currentUid.value)) {
      budgetList.value.push(response.data);
    }
    return response.data;
  };

  // 💡 [추가] 거래 내역 수정
  const editBudget = async (id, payload) => {
    const response = await axios.put(`/api/BUDGET/${id}`, {
      ...payload,
      uid: Number(payload.uid),
      cid: Number(payload.cid),
    });
    const index = budgetList.value.findIndex(
      (b) => String(b.id) === String(id),
    );
    if (index !== -1) budgetList.value[index] = response.data;
    return response.data;
  };

  // 💡 [추가] 카테고리 추가
  const addCategory = async (payload) => {
    const allRes = await axios.get('/api/CATEGORY');
    const nextId =
      Math.max(
        0,
        ...allRes.data.map((c) => Number(c.id)).filter((n) => !isNaN(n)),
      ) + 1;

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
    const allRes = await axios.get('/api/TEMPLATE');
    const nextId =
      Math.max(
        0,
        ...allRes.data.map((t) => Number(t.id)).filter((n) => !isNaN(n)),
      ) + 1;

    const response = await axios.post('/api/TEMPLATE', {
      id: nextId,
      ...payload,
      uid: Number(currentUid.value),
      cid: Number(payload.cid),
    });
    templates.value.push(response.data);
    return response.data;
  };

  // 💡 [추가] 템플릿 수정
  const editTemplate = async (id, payload) => {
    const response = await axios.put(`/api/TEMPLATE/${id}`, {
      ...payload,
      uid: Number(payload.uid),
      cid: Number(payload.cid),
    });
    const index = templates.value.findIndex((t) => String(t.id) === String(id));
    if (index !== -1) templates.value[index] = response.data;
    return response.data;
  };

  // 💡 [추가] 목표 예산 저장/수정
  const saveTargetBudget = async (payload) => {
    try {
      const { uid, month, cid } = payload;
      // 1. 해당 유저/월/카테고리에 이미 예산이 설정되어 있는지 확인
      const res = await axios.get(
        `/api/targetBudget?uid=${uid}&month=${month}&cid=${cid}`,
      );

      if (res.data.length > 0) {
        // 2. 이미 있으면 업데이트 (PUT)
        const existing = res.data[0];
        await axios.put(`/api/targetBudget/${existing.id}`, {
          ...payload,
          id: Number(existing.id),
        });
      } else {
        // 3. 없으면 새로 생성 (POST)
        const allRes = await axios.get('/api/targetBudget');
        const nextId =
          Math.max(
            0,
            ...allRes.data.map((t) => Number(t.id)).filter((n) => !isNaN(n)),
          ) + 1;
        await axios.post('/api/targetBudget', {
          ...payload,
          id: Number(nextId),
        });
      }
    } catch (err) {
      console.error('예산 저장 실패:', err);
      throw err;
    }
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
    monthlyRecentTransactions,
    topMonthlyMessage,
    monthlySummaryMessages,
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
    saveTargetBudget,
    changeMonth,
    toggleDate,
    toggleCategory,
    setTransactionType,
    toggleScheduled,
    resetFilters,
  };
});
