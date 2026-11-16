export const OS_APONTAMENTO_EXEMPLO = {
  numero: 'OS-2026-000142',
  veiculo: 'SUV Turbo 2025 - Placa RTY-2U19',
  tecnico: 'Rafael Oliveira',
};

export const TAREFAS_INICIAIS_HORAS = [
  {
    id: 'TAR-1',
    descricao: 'Diagnóstico eletrônico e leitura de sensores OBD-II',
    horasPadrao: 1.0,
    segundosReais: 2700, // 0.75 h já trabalhadas
    emAndamento: false,
  },
  {
    id: 'TAR-2',
    descricao: 'Substituição de pastilhas e discos de freio dianteiros',
    horasPadrao: 2.0,
    segundosReais: 5400, // 1.50 h já trabalhadas
    emAndamento: true,
  },
  {
    id: 'TAR-3',
    descricao: 'Troca de óleo, filtros e inspeção de fluidos',
    horasPadrao: 1.5,
    segundosReais: 6000, // 1.67 h já trabalhadas
    emAndamento: false,
  },
  {
    id: 'TAR-4',
    descricao: 'Alinhamento 3D e teste de rodagem final',
    horasPadrao: 1.0,
    segundosReais: 1800, // 0.50 h já trabalhadas
    emAndamento: false,
  },
];
