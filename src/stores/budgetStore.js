import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from 'axios'// 이전에 만든 axios 인스턴스

export const useBudgetStore = defineStore('budget', () => {
  // --- [State] ---
  const budgets = ref([])      // BUDGET 테이블 데이터
  const categories = ref([])   // CATEGORY 테이블 데이터
  const users = ref([])        // USER 테이블 데이터
  const currentUid = ref("1")  // 현재 로그인한 유저 ID (테스트용으로 1번 고정)

  const currentMonth = ref(new Date())
  const selectedDates = ref([])
  const selectedCategories = ref([])
  const selectedType = ref('all')
  const isScheduledOnly = ref(false)

  // --- [Getters] ---

  // 현재 유저의 데이터만 필터링함
  const myBudgets = computed(() => {
    return budgets.value.filter(b => b.uid === Number(currentUid.value) || b.uid === currentUid.value)
  })

  // 달력 점 표시용 (현재 유저 + 카테고리/타입 필터)
  const calendarDots = computed(() => {
    return myBudgets.value.filter(item => {
      const matchCat = selectedCategories.value.length === 0 || selectedCategories.value.includes(Number(item.cid))
      const matchType = selectedType.value === 'all' || item.type === selectedType.value
      return matchCat && matchType
    })
  })

  // 상세 리스트 출력용 (모든 필터 통합)
  const rangeBudgets = computed(() => {
    return myBudgets.value.filter(item => {
      const matchDate = selectedDates.value.length === 0 || selectedDates.value.includes(item.date)
      const matchCat = selectedCategories.value.length === 0 || selectedCategories.value.includes(Number(item.cid))
      const matchType = selectedType.value === 'all' || item.type === selectedType.value

      const isFuture = new Date(item.date) > new Date()
      const matchScheduled = !isScheduledOnly.value || isFuture

      return matchDate && matchCat && matchType && matchScheduled
    })
  })

  const selectedTotal = computed(() => {
    return rangeBudgets.value.reduce((acc, cur) => {
      if (cur.type === 'income') acc.income += cur.amount
      else acc.expense += cur.amount
      return acc
    }, { income: 0, expense: 0 })
  })

  // --- [Actions] ---

  // 초기 데이터 로드 (DB와 연결)
  async function fetchData() {
    try {
      const [resB, resC, resU] = await Promise.all([
        api.get('/BUDGET'),
        api.get('/CATEGORY'),
        api.get('/USER')
      ])
      budgets.value = resB.data
      categories.value = resC.data
      users.value = resU.data
      console.log("DB 데이터 로드 성공 🍐")
    } catch (error) {
      console.error("데이터 로드 실패:", error)
    }
  }

  // 가계부 내역 추가 (DB 저장)
  async function addBudget(payload) {
    try {
      const res = await api.post('/BUDGET', {
        ...payload,
        uid: Number(currentUid.value) // 유저 ID 강제 할당
      })
      budgets.value.push(res.data)
      return res.data
    } catch (error) {
      console.error("저장 실패:", error)
    }
  }
// 월 이동 (이전달/다음달)
  function changeMonth(diff) {
    const next = new Date(currentMonth.value)
    next.setMonth(next.getMonth() + diff)
    currentMonth.value = next

    // 달이 바뀌면 선택값들 초기화함
    resetFilters()
  }
  // 필터 관련 액션들 (기존 로직 유지)
  function toggleDate(date, isShiftPressed = false) {
    if (isShiftPressed) {
      const index = selectedDates.value.indexOf(date)
      if (index > -1) selectedDates.value.splice(index, 1)
      else selectedDates.value.push(date)
    } else {
      selectedDates.value = (selectedDates.value[0] === date && selectedDates.value.length === 1) ? [] : [date]
    }
    selectedCategories.value = []; isScheduledOnly.value = false;
  }

  function toggleCategory(cid) {
    const numCid = Number(cid)
    const index = selectedCategories.value.indexOf(numCid)
    if (index > -1) selectedCategories.value.splice(index, 1)
    else selectedCategories.value.push(numCid)
    selectedDates.value = []; isScheduledOnly.value = false;
  }

  function setTransactionType(type) { selectedType.value = type }
  function toggleScheduled() { isScheduledOnly.value = !isScheduledOnly.value }
  function resetFilters() {
    selectedType.value = 'all'; selectedCategories.value = [];
    isScheduledOnly.value = false; selectedDates.value = [];
  }

  return {
    budgets, categories, currentMonth, selectedDates, selectedCategories, selectedType, isScheduledOnly,
    calendarDots, rangeBudgets, selectedTotal,
    fetchData, addBudget, toggleDate, toggleCategory, setTransactionType, toggleScheduled, resetFilters,changeMonth
  }
})