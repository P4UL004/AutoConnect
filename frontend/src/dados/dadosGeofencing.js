export const CONFIG_GEOFENCING = {
  veiculo: 'Sedan Turbo 2026 - Placa QTP-4E21',
  condutor: 'Carlos Mendes (Test-drive)',
  centroX: 200,
  centroY: 200,
  raioCercaPx: 120,
  raioCercaKm: 5.0,
  limiteVelocidadeKmh: 80,
};

export const ROTA_SIMULADA = [
  { x: 200, y: 200, velocidade: 38, setor: 'Pátio Concessionária' },
  { x: 235, y: 185, velocidade: 52, setor: 'Av. Paralela - Trecho Norte' },
  { x: 268, y: 170, velocidade: 64, setor: 'Av. Paralela - Km 4' },
  { x: 295, y: 155, velocidade: 76, setor: 'Acesso Via Expressa' },
  { x: 312, y: 135, velocidade: 88, setor: 'Via Expressa (Excesso de Velocidade)' },
  { x: 335, y: 110, velocidade: 92, setor: 'Rodovia BA-099 (Fora do Perímetro)' },
  { x: 280, y: 160, velocidade: 68, setor: 'Retorno Av. Paralela' },
  { x: 225, y: 190, velocidade: 44, setor: 'Aproximação Concessionária' },
];

export const POSICAO_FORA_CERCA = {
  x: 355,
  y: 95,
  velocidade: 74,
  setor: 'Rodovia Externa - Fora da Cerca (6,8 km)',
};
