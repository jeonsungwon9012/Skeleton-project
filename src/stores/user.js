import { ref } from 'vue';
import { defineStore } from 'pinia';
import { userApi } from '../api/user';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);

  const fetchUser = async (id) => {
    try {
      const response = await userApi.fetchUser(id);
      if (response.status === 200) {
        user.value = response.data;
      } else {
        alert('유저 조회 실패');
      }
    } catch (error) {
      alert('에러발생 :' + error);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await userApi.createUser(userData);
      if (response.status === 200 || response.status === 201) {
        user.value = response.data;
      } else {
        alert('유저 생성 실패');
      }
    } catch (error) {
      alert('에러발생 :' + error);
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const response = await userApi.updateUser(id, userData);
      if (response.status === 200 || response.status === 204) {
        user.value = response.data;
      } else {
        alert('유저 수정 실패');
      }
    } catch (error) {
      alert('에러발생 :' + error);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await userApi.deleteUser(id);
      if (response.status === 200 || response.status === 204) {
        user.value = null;
      } else {
        alert('유저 삭제 실패');
      }
    } catch (error) {
      alert('에러발생 :' + error);
    }
  };

  return { user, fetchUser, createUser, updateUser, deleteUser };
});
