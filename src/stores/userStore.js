import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  // 💡 초기화 시 localStorage에서 유저 정보를 복구합니다.
  const savedUser = localStorage.getItem('user');
  const user = ref(savedUser ? JSON.parse(savedUser) : null);

  const isLoggedIn = computed(() => !!user.value);

  /**
   * 회원가입: 서버(json-server)에 새 유저 정보를 저장합니다.
   * @param {Object} userData - 가입 폼에서 입력받은 정보 (nickname, email, age, gender 등)
   */
  const signup = async (userData) => {
    try {
      // 💡 현재 유저 목록을 가져와서 가장 큰 ID를 찾아 다음 인덱스 결정
      const usersRes = await axios.get('/api/USER');
      const nextId = Math.max(...usersRes.data.map((u) => Number(u.id)), 0) + 1;

      // json-server는 /api/USER로 POST 요청을 보내면 자동으로 db.json에 저장합니다.
      const response = await axios.post('/api/USER', {
        id: nextId,
        ...userData,
        count: 0,
        cid: 1, // 기본 카테고리 ID 설정
        budgetCount: 0,
      });

      // 회원가입 성공 시 해당 유저로 자동 로그인 처리
      user.value = response.data;
      // 💡 로그인 유지를 위해 localStorage에 저장
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('회원가입 및 DB 저장 성공! 👤');
      return response.data;
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      throw error;
    }
  };

  /**
   * 이메일 중복 체크: 에러를 던지지 않고 존재 여부만 반환합니다.
   * @param {string} email
   * @returns {boolean} 중복 여부
   */
  const isEmailDuplicate = async (email) => {
    const res = await axios.get(`/api/USER?email=${email}`);
    return res.data && res.data.length > 0;
  };

  const login = async (email) => {
    try {
      const res = await axios.get(`/api/USER?email=${email}`);
      if (res.data && res.data.length > 0) {
        user.value = res.data[0];
        // 💡 로그인 성공 시 localStorage에 저장
        localStorage.setItem('user', JSON.stringify(user.value));
        return user.value;
      }
      throw new Error('사용자를 찾을 수 없습니다.');
    } catch (err) {
      console.error('로그인 실패:', err);
      throw err;
    }
  };

  const logout = () => {
    user.value = null;
    // 💡 로그아웃 시 저장된 유저 정보 삭제
    localStorage.removeItem('user');
  };

  const fetchUser = async (id) => {
    const res = await axios.get(`/api/USER/${id}`);
    user.value = res.data;
    // 💡 최신 정보 동기화
    localStorage.setItem('user', JSON.stringify(user.value));
  };

  // 💡 [추가] 유저 정보 업데이트
  const updateUser = async (id, userData) => {
    const response = await axios.put(`/api/USER/${id}`, userData);
    user.value = response.data;
    // 💡 수정된 정보 동기화
    localStorage.setItem('user', JSON.stringify(user.value));
    return response.data;
  };

  return {
    user,
    isLoggedIn,
    signup,
    isEmailDuplicate,
    login,
    logout,
    fetchUser,
    updateUser,
  };
});
