import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8081' });

// Anexa o token em todo pedido
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o token vencer ou for inválido, volta ao login
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const ehLogin = erro.config?.url === '/api/auth/login';
    if (erro.response?.status === 401 && !ehLogin) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(erro);
  }
);

export default api;