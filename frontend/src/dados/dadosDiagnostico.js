export const PACOTES_INICIAIS_OBD = [
  {
    id: 'PKT-1001',
    horario: '09:14:22',
    veiculo: 'SUV Hybrid 2025 (ABC-1D23)',
    codigoDtc: 'P0420',
    descricao: 'Eficiência do sistema catalisador abaixo do limite (Banco 1)',
    criticidade: 'Média',
  },
  {
    id: 'PKT-1002',
    horario: '09:28:05',
    veiculo: 'Hatch Sport 2024 (XYZ-9K88)',
    codigoDtc: 'P0171',
    descricao: 'Mistura de combustível muito pobre no banco 1',
    criticidade: 'Baixa',
  },
  {
    id: 'PKT-1003',
    horario: '09:41:50',
    veiculo: 'Picape Diesel 2026 (JKL-4M12)',
    codigoDtc: 'P0300',
    descricao: 'Falha de ignição aleatória / múltiplos cilindros detectada',
    criticidade: 'Alta',
  },
];

export const MODELOS_PACOTES_ALEATORIOS = [
  {
    veiculo: 'Sedan Executivo 2026 (QWE-7R45)',
    codigoDtc: 'P0300',
    descricao: 'Falha de ignição múltipla com risco de dano ao catalisador',
    criticidade: 'Alta',
  },
  {
    veiculo: 'SUV Turbo 2025 (RTY-2U19)',
    codigoDtc: 'P0217',
    descricao: 'Superaquecimento crítico do líquido de arrefecimento do motor',
    criticidade: 'Alta',
  },
  {
    veiculo: 'Compacto Flex 2024 (UIO-5P60)',
    codigoDtc: 'P0420',
    descricao: 'Eficiência do catalisador reduzida em regime urbano',
    criticidade: 'Média',
  },
  {
    veiculo: 'Utilitário Cargo 2025 (ASD-8F31)',
    codigoDtc: 'P0115',
    descricao: 'Falha intermitente no circuito do sensor de temperatura',
    criticidade: 'Média',
  },
  {
    veiculo: 'Crossover 2026 (GHJ-3L77)',
    codigoDtc: 'P0456',
    descricao: 'Pequeno vazamento detectado no sistema evaporativo (EVAP)',
    criticidade: 'Baixa',
  },
  {
    veiculo: 'Sedan Touring 2024 (ZXC-6V90)',
    codigoDtc: 'P0500',
    descricao: 'Oscilação no sensor de velocidade do veículo (VSS)',
    criticidade: 'Baixa',
  },
];
