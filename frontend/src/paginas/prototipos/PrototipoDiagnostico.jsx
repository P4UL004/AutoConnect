import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  MODELOS_PACOTES_ALEATORIOS,
  PACOTES_INICIAIS_OBD,
} from '../../dados/dadosDiagnostico';
import { ESTILO_FUNDO_LISTRAS } from '../Home';

function obterHoraAtual() {
  return new Date().toLocaleTimeString('pt-BR');
}

function corCriticidade(criticidade) {
  if (criticidade === 'Alta') return 'error';
  if (criticidade === 'Média') return 'warning';
  return 'default';
}

export default function PrototipoDiagnostico() {
  const [pacotes, setPacotes] = useState(PACOTES_INICIAIS_OBD);
  const [logPush, setLogPush] = useState([
    {
      id: 'LOG-INIT',
      horario: '09:41:50',
      mensagem: 'Notificação push enviada ao proprietário (simulada) — Picape Diesel 2026 (P0300)',
    },
  ]);

  function handleSimularPacote() {
    const indice = Math.floor(Math.random() * MODELOS_PACOTES_ALEATORIOS.length);
    const modelo = MODELOS_PACOTES_ALEATORIOS[indice];
    const horario = obterHoraAtual();
    const novoPacote = {
      id: `PKT-${Date.now()}`,
      horario,
      ...modelo,
    };

    setPacotes((prev) => [novoPacote, ...prev]);

    if (modelo.criticidade === 'Alta') {
      setLogPush((prev) => [
        {
          id: `LOG-${Date.now()}`,
          horario,
          mensagem: `Notificação push enviada ao proprietário (simulada) — ${modelo.veiculo} (${modelo.codigoDtc})`,
        },
        ...prev,
      ]);
    }
  }

  return (
    <Box component="main" sx={{ ...ESTILO_FUNDO_LISTRAS, p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 1140, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Diagnóstico Remoto OBD-II
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitoramento de códigos DTC e disparo automático de alertas críticos
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" onClick={handleSimularPacote}>
              Simular novo pacote
            </Button>
          </Stack>
        </Stack>


        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Pacotes de Telemetria Recebidos ({pacotes.length})
              </Typography>
            </Box>

            <TableContainer>
              <Table aria-label="Tabela de pacotes de telemetria OBD-II">
                <TableHead>
                  <TableRow>
                    <TableCell>Horário</TableCell>
                    <TableCell>Veículo</TableCell>
                    <TableCell>Código DTC</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Criticidade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pacotes.map((pkt) => (
                    <TableRow key={pkt.id}>
                      <TableCell>{pkt.horario}</TableCell>
                      <TableCell>{pkt.veiculo}</TableCell>
                      <TableCell>
                        <strong>{pkt.codigoDtc}</strong>
                      </TableCell>
                      <TableCell>{pkt.descricao}</TableCell>
                      <TableCell>
                        <Chip
                          label={pkt.criticidade}
                          color={corCriticidade(pkt.criticidade)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Log de Notificações Push
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Disparadas automaticamente para criticidade Alta
              </Typography>
            </Box>

            <List disablePadding>
              {logPush.map((entry, idx) => (
                <Box key={entry.id}>
                  <ListItem sx={{ py: 1.5, px: 2.5 }}>
                    <ListItemText
                      primary={entry.mensagem}
                      secondary={`Registrado às ${entry.horario}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  {idx < logPush.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
