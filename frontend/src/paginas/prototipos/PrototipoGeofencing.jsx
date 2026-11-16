import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  CONFIG_GEOFENCING,
  POSICAO_FORA_CERCA,
  ROTA_SIMULADA,
} from '../../dados/dadosGeofencing';
import { ESTILO_FUNDO_LISTRAS } from '../Home';

function tocarBipAlerta(audioCtxRef) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignora bloqueio de áudio automático pelo navegador
  }
}

function calcularDistanciaPx(ponto) {
  const dx = ponto.x - CONFIG_GEOFENCING.centroX;
  const dy = ponto.y - CONFIG_GEOFENCING.centroY;
  return Math.hypot(dx, dy);
}

export default function PrototipoGeofencing({ onVoltar }) {
  const navigate = useNavigate();
  const [indiceRota, setIndiceRota] = useState(0);
  const [posicaoManual, setPosicaoManual] = useState(null);
  const audioCtxRef = useRef(null);

  const pontoAtual = posicaoManual || ROTA_SIMULADA[indiceRota];
  const distanciaPx = calcularDistanciaPx(pontoAtual);
  const distanciaKm = (
    (distanciaPx / CONFIG_GEOFENCING.raioCercaPx) *
    CONFIG_GEOFENCING.raioCercaKm
  ).toFixed(2);
  const foraDaCerca = distanciaPx > CONFIG_GEOFENCING.raioCercaPx;
  const acimaVelocidade = pontoAtual.velocidade > CONFIG_GEOFENCING.limiteVelocidadeKmh;
  const emAlerta = foraDaCerca || acimaVelocidade;

  useEffect(() => {
    const intervalo = setInterval(() => {
      setPosicaoManual((manualAtual) => {
        if (manualAtual) {
          return manualAtual;
        }
        setIndiceRota((prev) => {
          const proximoIndice = (prev + 1) % ROTA_SIMULADA.length;
          const proximoPonto = ROTA_SIMULADA[proximoIndice];
          const saiu = calcularDistanciaPx(proximoPonto) > CONFIG_GEOFENCING.raioCercaPx;
          const rapido = proximoPonto.velocidade > CONFIG_GEOFENCING.limiteVelocidadeKmh;
          if (saiu || rapido) {
            tocarBipAlerta(audioCtxRef);
          }
          return proximoIndice;
        });
        return null;
      });
    }, 5000);

    return () => {
      clearInterval(intervalo);
    };
  }, []);

  function handleForcarSaida() {
    setPosicaoManual(POSICAO_FORA_CERCA);
    tocarBipAlerta(audioCtxRef);
  }

  function handleReiniciar() {
    setPosicaoManual(null);
    setIndiceRota(0);
  }

  function voltar() {
    if (typeof onVoltar === 'function') {
      onVoltar();
    } else {
      navigate('/');
    }
  }

  const motivosAlerta = [];
  if (foraDaCerca) {
    motivosAlerta.push(
      `Veículo fora da cerca eletrônica (${distanciaKm} km do centro; limite ${CONFIG_GEOFENCING.raioCercaKm} km)`
    );
  }
  if (acimaVelocidade) {
    motivosAlerta.push(
      `Velocidade acima do limite (${pontoAtual.velocidade} km/h; máximo ${CONFIG_GEOFENCING.limiteVelocidadeKmh} km/h)`
    );
  }

  return (
    <Box component="main" sx={{ ...ESTILO_FUNDO_LISTRAS, p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 1020, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Geofencing e Telemetria de Test-drive
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {CONFIG_GEOFENCING.veiculo} • {CONFIG_GEOFENCING.condutor}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={voltar}>
            Voltar para Home
          </Button>
        </Stack>


        {emAlerta && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Alerta:</strong> {motivosAlerta.join(' | ')}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '430px 1fr' },
            gap: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5, alignSelf: 'flex-start' }}>
              Mapa Esquemático da Cerca Eletrônica (atualização a cada 5s)
            </Typography>

            <Box
              component="svg"
              viewBox="0 0 400 400"
              role="img"
              aria-label="Mapa SVG mostrando a cerca circular e a posição atual do veículo"
              sx={{
                width: '100%',
                maxWidth: 380,
                height: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#181C26',
              }}
            >
              {/* Grade de referência */}
              {[80, 160, 200, 240, 320].map((pos) => (
                <g key={pos}>
                  <line
                    x1={pos}
                    y1={0}
                    x2={pos}
                    y2={400}
                    stroke="#2B3245"
                    strokeWidth="1"
                  />
                  <line
                    x1={0}
                    y1={pos}
                    x2={400}
                    y2={pos}
                    stroke="#2B3245"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* Cerca eletrônica */}
              <circle
                cx={CONFIG_GEOFENCING.centroX}
                cy={CONFIG_GEOFENCING.centroY}
                r={CONFIG_GEOFENCING.raioCercaPx}
                fill={foraDaCerca ? 'rgba(255, 138, 128, 0.12)' : 'rgba(58, 84, 156, 0.22)'}
                stroke={foraDaCerca ? '#FF8A80' : '#5C7CFA'}
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />

              {/* Centro (Concessionária) */}
              <circle
                cx={CONFIG_GEOFENCING.centroX}
                cy={CONFIG_GEOFENCING.centroY}
                r={5}
                fill="#B8BFD1"
              />
              <text
                x={CONFIG_GEOFENCING.centroX + 8}
                y={CONFIG_GEOFENCING.centroY + 4}
                fill="#B8BFD1"
                fontSize="11"
              >
                Concessionária
              </text>

              {/* Ponto do veículo */}
              <circle
                cx={pontoAtual.x}
                cy={pontoAtual.y}
                r={13}
                fill={emAlerta ? 'rgba(255, 138, 128, 0.3)' : 'rgba(105, 219, 124, 0.25)'}
              />
              <circle
                cx={pontoAtual.x}
                cy={pontoAtual.y}
                r={7}
                fill={emAlerta ? '#FF8A80' : '#69DB7C'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <text
                x={Math.min(pontoAtual.x + 10, 315)}
                y={Math.max(pontoAtual.y - 10, 18)}
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="bold"
              >
                {pontoAtual.velocidade} km/h
              </text>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Telemetria em Tempo Real
                </Typography>
                <Chip
                  label={emAlerta ? 'ALERTA ATIVO' : 'DENTRO DOS PARÂMETROS'}
                  color={emAlerta ? 'error' : 'success'}
                  size="small"
                />
              </Stack>

              <Divider />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 2,
                }}
              >
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    Velocidade Simulada
                  </Typography>
                  <Typography
                    variant="h4"
                    color={acimaVelocidade ? 'error.main' : 'text.primary'}
                    sx={{ fontWeight: 600 }}
                  >
                    {pontoAtual.velocidade} km/h
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Limite: {CONFIG_GEOFENCING.limiteVelocidadeKmh} km/h
                  </Typography>
                </Box>

                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    Distância do Centro
                  </Typography>
                  <Typography
                    variant="h4"
                    color={foraDaCerca ? 'error.main' : 'text.primary'}
                    sx={{ fontWeight: 600 }}
                  >
                    {distanciaKm} km
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Raio da cerca: {CONFIG_GEOFENCING.raioCercaKm} km
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  Localização Atual Simulada
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {pontoAtual.setor}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Coordenadas SVG: ({pontoAtual.x}, {pontoAtual.y})
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleForcarSaida}
                >
                  Forçar saída da cerca (demonstração)
                </Button>
                <Button variant="outlined" onClick={handleReiniciar}>
                  Reiniciar
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
