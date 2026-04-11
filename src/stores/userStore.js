import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  console.log('🍍 userStore initialized');

  // 현재 로그인한 유저 정보
  // 초기값 설정 시 localStorage에 저장된 정보가 있으면 불러옴
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);

  // 로그인 여부 확인 (유저 정보가 있으면 true)
  const isLoggedIn = computed(
    () => user.value !== null && user.value.id !== undefined,
  );

  /**
   * 로그인 처리 액션
   * @param {string} email
   * @returns {Promise<boolean>} 로그인 성공 여부
   */
  const login = async (email) => {
    console.log('🔑 Attempting login with:', email);
    try {
      // json-server에서 해당 이메일을 가진 유저를 검색합니다.
      const response = await axios.get('/api/USER', {
        params: { email },
      });

      if (response.data && response.data.length > 0) {
        // 유저 정보를 스토어에 저장
        user.value = response.data[0];
        // 새로고침 시 유지를 위해 localStorage에 저장
        localStorage.setItem('user', JSON.stringify(user.value));
        // 다른 컴포넌트에서 감지할 수 있도록 userId 별도 저장 (필요 시)
        localStorage.setItem('userId', String(user.value.id));
        return true;
      }
      console.warn('❌ User not found with email:', email);
      return false;
    } catch (error) {
      console.error('🔥 Login API error:', error);
      throw error; // 에러를 던져서 컴포넌트에서 인지할 수 있게 함
    }
  };

  /**
   * ID로 유저 정보 조회 (프로필 수정 등에서 사용)
   */
  const fetchUser = async (id) => {
    try {
      const response = await axios.get(`/api/USER/${id}`);
      user.value = response.data;
      return response.data;
    } catch (error) {
      console.error('유저 정보 로드 실패:', error);
      return null;
    }
  };

  /**
   * 유저 정보 업데이트
   */
  const updateUser = async (id, payload) => {
    try {
      const response = await axios.put(`/api/USER/${id}`, payload);
      user.value = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('유저 정보 수정 실패:', error);
      throw error;
    }
  };

  /**
   * 신규 유저 생성 (회원가입)
   */
  const createUser = async (userData) => {
    try {
      const response = await axios.post('/api/USER', userData);
      user.value = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('유저 생성 실패:', error);
      throw error;
    }
  };

  /**
   * 유저 삭제 (탈퇴)
   */
  const deleteUser = async (id) => {
    try {
      await axios.delete(`/api/USER/${id}`);
      logout();
      return true;
    } catch (error) {
      console.error('유저 삭제 실패:', error);
      throw error;
    }
  };

  const logout = () => {
    user.value = null;
    // 저장된 유저 정보 삭제
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  };

  return {
    user,
    isLoggedIn,
    login,
    fetchUser,
    updateUser,
    createUser,
    deleteUser,
    logout,
  };
});
