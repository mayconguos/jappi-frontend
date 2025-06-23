import axios from 'axios';
import { getApiBaseUrl } from '@/utils/getApiBaseUrl';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default api;