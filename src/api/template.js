import axios from 'axios';

const BASE_URL = '/api';

export const templateApi = {
  // 유저의 템플릿 목록 조회 (최대 3개)
  getTemplates: (uid) => axios.get(`${BASE_URL}/TEMPLATE?uid=${uid}`),

  // 템플릿 삭제
  deleteTemplate: (id) => axios.delete(`${BASE_URL}/TEMPLATE/${id}`),

  // 템플릿으로 거래 추가
  addBudgetFromTemplate: (data) => axios.post(`${BASE_URL}/BUDGET`, data),
};
