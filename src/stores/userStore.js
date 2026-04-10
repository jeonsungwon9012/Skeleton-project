import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from 'axios' // 💡 프록시 설정된 axios 인스턴스

export const useUserStore = defineStore('user', () => {
  // --- [State] ---
  const user = ref(null)        // 유저 정보 (객체)
  const isLoggedIn = ref(false) // 로그인 여부
  const authStatus = ref('idle') // 인증 상태 ('idle', 'loading', 'success', 'error')

  // --- [Getters] ---
  const userCids = computed(() => user.value?.cids || [])
  const userUid = computed(() => user.value?.id || null)

  // --- [Actions] ---

  /**
   * 💡 실제 로그인 처리
   * db.json의 USER 테이블에서 해당 이메일을 가진 유저를 찾음
   */
  async function login(email = 'user1@example.com') {
    authStatus.value = 'loading'
    try {
      // 1. 유저 정보 가져오기 (쿼리 파라미터로 해당 유저 검색)
      const res = await api.get(`/USER?email=${email}`)
      const foundUser = res.data[0]

      if (foundUser) {
        // 2. 유저 정보 저장 및 로그인 처리
        user.value = foundUser
        isLoggedIn.value = true
        authStatus.value = 'success'
        console.log(`${foundUser.nickname}님, 환영합니다! 🍐`)
        return true
      } else {
        throw new Error('유저를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('로그인 실패:', error)
      authStatus.value = 'error'
      isLoggedIn.value = false
      return false
    }
  }

  // 로그아웃 (상태 초기화)
  function logout() {
    user.value = null
    isLoggedIn.value = false
    authStatus.value = 'idle'
    console.log("로그아웃 되었습니다.")
  }

  return { user, isLoggedIn, authStatus, userCids, userUid, login, logout }
})