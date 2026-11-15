import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
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
  OS_APONTAMENTO_EXEMPLO,
  TAREFAS_INICIAIS_HORAS,
} from '../../dados/dadosHoras';
import { ESTILO_FUNDO_LISTRAS } from '../Home';

function formatarCronometro(totalSegundos) {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return [horas, minutos, segundos].map((v) => String(v).padStart(2, '0')).join(':');
}

function calcularEficiencia(horasPadrao, segundosReais) {
  if (!segundosReais || segundosReais <= 0) return 100;
  const horasReais = segundosReais / 3600;
  return (horasPadrao / horasReais) * 100;
}

export default function PrototipoHoras({ onVoltar }) {
  const navigate = useNavigate();
  const [tarefas, setTarefas] = useState(TAREFAS_INICIAIS_HORAS);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTarefas((prev) =>
        prev.map((tarefa) =>
          tarefa.emAndamento
            ? { ...tarefa, segundosReais: tarefa.segundosReais + 1 }
            : tarefa
        )
      );
    }, 1000);

    return () => {
      clearInterval(intervalo);
    };
  }, []);

  function alternarCronometro(id) {
    setTarefas((prev) =>
      prev.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, emAndamento: !tarefa.emAndamento } : tarefa
      )
    );
  }

  const totalHorasPadrao = tarefas.reduce((acc, t) => acc + t.horasPadrao, 0);
  const totalSegundosReais = tarefas.reduce((acc, t) => acc + t.segundosReais, 0);
  const totalHorasReais = totalSegundosReais / 3600;
  const eficienciaGeral = calcularEficiencia(totalHorasPadrao, totalSegundosReais);

  function voltar() {
    if (typeof onVoltar === 'function') {
      onVoltar();
    } else {
      navigate('/');
    }
  }

  return (
    <Box component="main" sx={{ ...ESTILO_FUNDO_LISTRAS, p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 1060, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Apontamento de Horas e Eficiência Técnica (RF-09)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {OS_APONTAMENTO_EXEMPLO.numero} • {OS_APONTAMENTO_EXEMPLO.veiculo} • Técnico:{' '}
              {OS_APONTAMENTO_EXEMPLO.tecnico}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={voltar}>
            Voltar para Home
          </Button>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          Protótipo visual - dados simulados
        </Alert>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
            mb: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            <Typography variant="caption" color="text.secondary">
              Horas Padrão Faturadas
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {totalHorasPadrao.toFixed(2).replace('.', ',')} h
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            <Typography variant="caption" color="text.secondary">
              Horas Reais Trabalhadas
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {totalHorasReais.toFixed(2).replace('.', ',')} h ({formatarCronometro(totalSegundosReais)})
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            <Typography variant="caption" color="text.secondary">
              Índice de Eficiência Geral
            </Typography>
            <Typography
              variant="h5"
              color={eficienciaGeral >= 100 ? 'success.main' : 'warning.main'}
              sx={{ fontWeight: 600 }}
            >
              {eficienciaGeral.toFixed(1).replace('.', ',')}%
            </Typography>
          </Paper>
        </Box>

        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <TableContainer>
            <Table aria-label="Tabela de tarefas e cronômetros da OS">
              <TableHead>
                <TableRow>
                  <TableCell>Tarefa da OS</TableCell>
                  <TableCell align="right">Horas Padrão</TableCell>
                  <TableCell align="right">Tempo Real</TableCell>
                  <TableCell align="right">Eficiência</TableCell>
                  <TableCell align="right">Cronômetro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tarefas.map((tarefa) => {
                  const eficiencia = calcularEficiencia(
                    tarefa.horasPadrao,
                    tarefa.segundosReais
                  );
                  return (
                    <TableRow key={tarefa.id}>
                      <TableCell>{tarefa.descricao}</TableCell>
                      <TableCell align="right">
                        {tarefa.horasPadrao.toFixed(2).replace('.', ',')} h
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatarCronometro(tarefa.segundosReais)}</strong> (
                        {(tarefa.segundosReais / 3600).toFixed(2).replace('.', ',')} h)
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${eficiencia.toFixed(1).replace('.', ',')}%`}
                          color={eficiencia >= 100 ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant={tarefa.emAndamento ? 'outlined' : 'contained'}
                          color={tarefa.emAndamento ? 'warning' : 'primary'}
                          onClick={() => alternarCronometro(tarefa.id)}
                        >
                          {tarefa.emAndamento ? 'Pausar' : 'Iniciar'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
}
