import axios from 'axios';

const API_URL = '/api/foods';

const getAll = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const createFood = async (foodData) => {
  const response = await axios.post(API_URL, foodData);
  return response.data;
};

const claimFood = async (foodId) => {
  const response = await axios.post(`${API_URL}/${foodId}/claim`);
  return response.data;
};

export default {
  getAll,
  createFood,
  claimFood
};