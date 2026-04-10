import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from 'axios' // 생 axios 사용

export const useBudgetStore = defineStore('budget', () => {
  // --- [State] ---
  const budgets = ref([])
  const categories = ref([])
  const users = ref([])
  const currentUid = ref("1")

  const currentMonth = ref(new Date())
  const selectedDates = ref([])
  const selectedCategories = ref([])
  const selectedType = ref('all')
  const isScheduledOnly = ref(false)

  // --- [Getters] ---

  /**
   * 💡 [추가] 카테고리 ID를 키로 하는 매핑 객체
   * 리스트나 달력에서 cid만 가지고 아이콘(img)과 색상(color)을 바로 찾을 때 유용함
   */
  const categoryMap = computed(() => {
    return categories.value.reduce((acc, cat) => {
      acc[Number(cat.id)] = cat
      return acc
    }, {})
  })

  const myBudgets = computed(() => {
    return budgets.value.filter(b => String(b.uid) === String(currentUid.value))
  })

  // 달력 점 표시용 (아이콘 정보가 포함된 카테고리 맵을 나중에 컴포넌트에서 활용)
  const calendarDots = computed(() => {
    return myBudgets.value.filter(item => {
      const matchCat = selectedCategories.value.length === 0 || selectedCategories.value.includes(Number(item.cid))
      const matchType = selectedType.value === 'all' || item.type === selectedType.value
      return matchCat && matchType
    })
  })

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

  // 🚩 [중요] 경로 앞에 /api를 붙여서 Vite 프록시를 타게 만듭니다.
  async function fetchData() {
    try {
      const [resB, resC, resU] = await Promise.all([
        api.get('/api/BUDGET'),
        api.get('/api/CATEGORY'),
        api.get('/api/USER')
      ])
      budgets.value = resB.data
      categories.value = resC.data // 여기서 img, name, color 등이 다 들어옴
      users.value = resU.data
      console.log("DB 데이터 로드 성공 🍐")
    } catch (error) {
      console.error("데이터 로드 실패:", error)
    }
  }

  async function addBudget(payload) {
    try {
      const res = await api.post('/api/BUDGET', {
        ...payload,
        uid: Number(currentUid.value)
      })
      budgets.value.push(res.data)
      return res.data
    } catch (error) {
      console.error("저장 실패:", error)
    }
  }

  function changeMonth(diff) {
    const next = new Date(currentMonth.value)
    next.setMonth(next.getMonth() + diff)
    currentMonth.value = next
    resetFilters()
  }

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
    selectedType.value = 'all'
    selectedCategories.value = []
    isScheduledOnly.value = false
    selectedDates.value = []
  }

  return {
    budgets, categories, currentMonth, selectedDates, selectedCategories, selectedType, isScheduledOnly,
    categoryMap, calendarDots, rangeBudgets, selectedTotal,
    fetchData, addBudget, toggleDate, toggleCategory, setTransactionType, toggleScheduled, resetFilters, changeMonth
  }
})