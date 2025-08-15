import api from './api';

const getAll = async () => {
  const response = await api.get('/food'); // matches your backend route
  return response.data;
};

const createFood = async (foodData) => {
  const response = await api.post('/food', foodData);
  return response.data;
};

const claimFood = async (foodId) => {
  const response = await api.post(`/food/${foodId}/claim`);
  return response.data;
};

export default {
  getAll,
  createFood,
  claimFood
};
