import axios from 'axios';

const BASE_URL = '/api';

export const reactionApi = {
  // reactionMessages 전체 조회
  getReactionMessages: () => axios.get(`${BASE_URL}/reactionMessages`),
};
