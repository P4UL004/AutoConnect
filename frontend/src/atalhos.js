export const PERFIS = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  CONSULTOR_VENDAS: 'CONSULTOR_VENDAS',
  CONSULTOR_TECNICO: 'CONSULTOR_TECNICO',
  CLIENTE: 'CLIENTE',
};

export const ROTULOS_PERFIL = {
  ADMINISTRADOR: 'Administrador',
  CONSULTOR_VENDAS: 'Consultor de Vendas',
  CONSULTOR_TECNICO: 'Consultor Técnico',
  CLIENTE: 'Cliente',
};

export const ATALHOS = [
  {
    id: 'inventario',
    titulo: 'Inventário',
    descricao: 'Consulta, cadastro e gestão de veículos disponíveis no estoque.',
    rota: '/inventario',
    prototipo: false,
    perfis: [PERFIS.ADMINISTRADOR, PERFIS.CONSULTOR_VENDAS],
  },
  {
    id: 'test-drive',
    titulo: 'Test-drive',
    descricao: 'Agendamento, acompanhamento e histórico de test-drives.',
    rota: '/test-drive',
    prototipo: false,
    perfis: [PERFIS.ADMINISTRADOR, PERFIS.CONSULTOR_VENDAS, PERFIS.CLIENTE],
  },
  {
    id: 'ordens-servico',
    titulo: 'Ordens de Serviço',
    descricao: 'Abertura, acompanhamento de execução e histórico de oficinas.',
    rota: '/ordens-servico',
    prototipo: false,
    perfis: [PERFIS.ADMINISTRADOR, PERFIS.CONSULTOR_TECNICO, PERFIS.CLIENTE],
  },
  {
    id: 'geofencing',
    titulo: 'Geofencing (RF-03)',
    descricao: 'Monitoramento geográfico em tempo real e alertas de perímetro e velocidade.',
    rota: '/prototipos/geofencing',
    prototipo: true,
    perfis: [PERFIS.ADMINISTRADOR, PERFIS.CONSULTOR_VENDAS],
  },
  {
    id: 'credito',
    titulo: 'Crédito (RF-04)',
    descricao: 'Simulação de financiamento, validação de CPF e propostas pré-aprovadas.',
    rota: '/prototipos/credito',
    prototipo: true,
    perfis: [PERFIS.ADMINISTRADOR, PERFIS.CONSULTOR_VENDAS, PERFIS.CLIENTE],
  },
  {
    id: 'diagnostico-obd',
    titulo: 'Diagnóstico OBD-II (RF-06)',
    descricao: 'Recepção de pacotes de telemetria, códigos DTC e alertas críticos.',
    rota: '/prototipos/diagnostico',
    prototipo: true,
    perfis: [PERFIS.ADMINISTRADOR, PERFIS.CONSULTOR_TECNICO],
  },
  {
    id: 'orcamento-remoto',
    titulo: 'Orçamento remoto (RF-07)',
    descricao: 'Envio de link temporário e aprovação item a item pelo cliente.',
    rota: '/prototipos/orcamento-remoto',
    prototipo: true,
    perfis: [PERFIS.ADMINISTRADOR, PERFIS.CONSULTOR_TECNICO, PERFIS.CLIENTE],
  },
  {
    id: 'estoque-pecas',
    titulo: 'Estoque de peças (RF-08)',
    descricao: 'Controle de saldo, reservas em OS e solicitações automáticas de compra.',
    rota: '/prototipos/estoque',
    prototipo: true,
    perfis: [PERFIS.ADMINISTRADOR, PERFIS.CONSULTOR_TECNICO],
  },
  {
    id: 'apontamento-horas',
    titulo: 'Apontamento de horas (RF-09)',
    descricao: 'Cronômetro por tarefa da OS e cálculo em tempo real de eficiência.',
    rota: '/prototipos/horas',
    prototipo: true,
    perfis: [PERFIS.ADMINISTRADOR, PERFIS.CONSULTOR_TECNICO],
  },
  {
    id: 'painel-bi',
    titulo: 'Painel BI (RF-10)',
    descricao: 'Indicadores gerenciais, gráficos de desempenho e exportação CSV/PDF.',
    rota: '/prototipos/painel-bi',
    prototipo: true,
    perfis: [PERFIS.ADMINISTRADOR],
  },
];

export function normalizarPerfil(perfil) {
  if (!perfil) return '';
  return String(perfil).trim().toUpperCase().replace(/^ROLE_/, '');
}

export function rotuloPerfil(perfil) {
  const chave = normalizarPerfil(perfil);
  return ROTULOS_PERFIL[chave] || perfil || 'Usuário';
}

export function obterAtalhosPorPerfil(perfil) {
  const chave = normalizarPerfil(perfil);
  return ATALHOS.filter((item) => item.perfis.includes(chave));
}

export function perfilTemAcessoRota(perfil, pathname) {
  if (!pathname || pathname === '/') return true;
  const chave = normalizarPerfil(perfil);
  if (!chave) return false;

  const atalhoCorrespondente = ATALHOS.find(
    (item) => pathname === item.rota || pathname.startsWith(`${item.rota}/`)
  );

  if (!atalhoCorrespondente) {
    return false;
  }

  return atalhoCorrespondente.perfis.includes(chave);
}

export function obterIniciais(nome) {
  const texto = String(nome || '').trim();
  if (!texto) return 'AC';

  const partes = texto.split(/\s+/).filter(Boolean);
  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}
