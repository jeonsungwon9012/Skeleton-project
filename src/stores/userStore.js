import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const user = ref(null)
  const isLoggedIn = ref(false)
  const authStatus = ref('idle')

  // --- Getters ---
  const userCids = computed(() => user.value?.cids || [])

  // --- Actions ---
  async function login(loginData) {
    authStatus.value = 'loading'
    try {
      // 가상의 API 통신
      user.value = { uid: 'sooyeon_10', name: '김소연', cids: [1, 2, 3, 4] }
      isLoggedIn.value = true
      authStatus.value = 'success'
    } catch (error) {
      authStatus.value = 'error'
    }
  }

  function logout() {
    user.value = null
    isLoggedIn.value = false
    authStatus.value = 'idle'
  }

  return { user, isLoggedIn, authStatus, userCids, login, logout }
})