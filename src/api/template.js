import axios from 'axios';

const BASE_URL = '/api';

export const templateApi = {
  // 유저의 템플릿 목록 조회 (최대 3개)
  getTemplates: (uid) => axios.get(`${BASE_URL}/TEMPLATE?uid=${uid}`),
};
