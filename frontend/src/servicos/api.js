import axios from 'axios';

const CHAVE_TOKEN = 'autoconnect_token';
const CHAVE_NOME = 'autoconnect_nome';
const CHAVE_PERFIL = 'autoconnect_perfil';

export const api = axios.create({
  baseURL: 'http://localhost:8081',
});

/**
 * Guarda a sessão do usuário no localStorage.
 * Aceita um objeto ({ token, nome, perfil }) ou os parâmetros individuais.
 */
export function guardarSessao(dadosOuToken, nome, perfil) {
  if (!dadosOuToken) return;

  if (typeof dadosOuToken === 'object') {
    const { token: t, nome: n, perfil: p } = dadosOuToken;
    if (t) localStorage.setItem(CHAVE_TOKEN, t);
    if (n) localStorage.setItem(CHAVE_NOME, n);
    if (p) localStorage.setItem(CHAVE_PERFIL, p);
  } else {
    localStorage.setItem(CHAVE_TOKEN, dadosOuToken);
    if (nome) localStorage.setItem(CHAVE_NOME, nome);
    if (perfil) localStorage.setItem(CHAVE_PERFIL, perfil);
  }
}

/**
 * Lê a sessão salva no localStorage.
 * Retorna null se não houver token armazenado.
 */
export function obterSessao() {
  const token = localStorage.getItem(CHAVE_TOKEN);
  const nome = localStorage.getItem(CHAVE_NOME);
  const perfil = localStorage.getItem(CHAVE_PERFIL);

  if (!token) {
    return null;
  }

  return {
    token,
    nome: nome || '',
    perfil: perfil || '',
  };
}

/**
 * Limpa todos os dados da sessão do localStorage e dispara o evento de logout.
 */
export function limparSessao() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_NOME);
  localStorage.removeItem(CHAVE_PERFIL);
  window.dispatchEvent(new CustomEvent('autoconnect:deslogar'));
}

// Interceptor de requisição: adiciona Authorization: Bearer <token> quando houver token salvo
api.interceptors.request.use(
  (config) => {
    const sessao = obterSessao();
    if (sessao?.token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${sessao.token}`;
    }
    return config;
  },
  (erro) => Promise.reject(erro)
);

// Interceptor de resposta: em 401 (exceto na rota de login), limpa a sessão e volta para o login
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const url = erro.config?.url || '';
    const ehRotaLogin = url.includes('/api/auth/login') || url.includes('/auth/login');

    if (erro.response?.status === 401 && !ehRotaLogin) {
      limparSessao();
    }
    return Promise.reject(erro);
  }
);

/**
 * Extrai a mensagem de erro padronizada do backend ou da conexão.
 */
export function extrairMensagemErro(erro) {
  if (!erro?.response) {
    return 'Não foi possível conectar ao servidor.';
  }
  if (erro.response.status === 403) {
    return 'Acesso negado.';
  }
  return erro.response.data?.mensagem || 'Erro ao processar a solicitação.';
}

export default api;
