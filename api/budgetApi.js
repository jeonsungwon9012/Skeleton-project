import axios from 'axios';

export const fetchBudgetData = async () => {
  const res = await axios.get('http://localhost:3000/api/data');
  return res.data;
};
