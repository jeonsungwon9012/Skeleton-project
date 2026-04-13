import axios from 'axios';

const BASEURL = '/api/USER';

export const userApi = {
  // 유저 조회
  fetchUser(id) {
    return axios.get(`${BASEURL}/${id}`);
  },

  // 유저 생성
  createUser(userData) {
    return axios.post(BASEURL, userData);
  },

  // 유저 수정
  updateUser(id, userData) {
    return axios.put(`${BASEURL}/${id}`, userData);
  },

  // 유저 삭제
  deleteUser(id) {
    return axios.delete(`${BASEURL}/${id}`);
  },
};
