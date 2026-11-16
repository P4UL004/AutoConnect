import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import {
  ITENS_INICIAIS_ORCAMENTO,
  OS_ORCAMENTO_EXEMPLO,
} from '../../dados/dadosOrcamentoRemoto';
import { ESTILO_FUNDO_LISTRAS } from '../Home';

const SEGUNDOS_48H = 48 * 3600;

function formatarContagem48h(totalSegundos) {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return [horas, minutos, segundos].map((v) => String(v).padStart(2, '0')).join(':');
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function PrototipoOrcamentoRemoto({ onVoltar }) {
  const navigate = useNavigate();
  const [aba, setAba] = useState(0);
  const [itens, setItens] = useState(ITENS_INICIAIS_ORCAMENTO);
  const [linkGerado, setLinkGerado] = useState('');
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  useEffect(() => {
    if (!linkGerado) return undefined;

    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(intervalo);
    };
  }, [linkGerado]);

  function handleEnviarLink() {
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLinkGerado(`https://autoconnect.app/orcamento/${OS_ORCAMENTO_EXEMPLO.numero}-${token}`);
    setSegundosRestantes(SEGUNDOS_48H);
  }

  function alterarStatusItem(id, novoStatus) {
    setItens((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: novoStatus } : item))
    );
  }

  const totalGeral = itens.reduce((acc, item) => acc + item.valor, 0);
  const totalAprovado = itens
    .filter((item) => item.status === 'APROVADO')
    .reduce((acc, item) => acc + item.valor, 0);
  const totalRejeitado = itens
    .filter((item) => item.status === 'REJEITADO')
    .reduce((acc, item) => acc + item.valor, 0);

  function voltar() {
    if (typeof onVoltar === 'function') {
      onVoltar();
    } else {
      navigate('/');
    }
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
              Orçamento Remoto de OS
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {OS_ORCAMENTO_EXEMPLO.numero} • {OS_ORCAMENTO_EXEMPLO.veiculo}
            </Typography>
          </Box>
          <Button variant="outlined" onClick={voltar}>
            Voltar para Home
          </Button>
        </Stack>


        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Cliente: {OS_ORCAMENTO_EXEMPLO.cliente} ({OS_ORCAMENTO_EXEMPLO.telefone})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sintomas: {OS_ORCAMENTO_EXEMPLO.sintomas}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" color="text.secondary">
                Total Aprovado pelo Cliente
              </Typography>
              <Typography variant="h5" color="success.main" sx={{ fontWeight: 600 }}>
                {formatarMoeda(totalAprovado)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={aba}
            onChange={(_, novaAba) => setAba(novaAba)}
            aria-label="Alternar visão entre Técnico e Cliente"
            sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
          >
            <Tab label="Visão do Técnico" id="tab-tecnico" aria-controls="painel-tecnico" />
            <Tab label="Visão do Cliente" id="tab-cliente" aria-controls="painel-cliente" />
          </Tabs>

          {aba === 0 && (
            <Box role="tabpanel" id="painel-tecnico" aria-labelledby="tab-tecnico" sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Itens Orçados na Ordem de Serviço
                  </Typography>
                  <Button variant="contained" onClick={handleEnviarLink}>
                    Enviar link ao cliente
                  </Button>
                </Stack>

                {linkGerado && (
                  <Alert severity="success">
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        Link enviado ao cliente: <strong>{linkGerado}</strong>
                      </Typography>
                      <Typography variant="body2">
                        Validade do link (contador regressivo 48h):{' '}
                        <strong>{formatarContagem48h(segundosRestantes)}</strong>
                      </Typography>
                    </Stack>
                  </Alert>
                )}

                <TableContainer>
                  <Table aria-label="Itens do orçamento na visão do técnico">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell>Status Cliente</TableCell>
                        <TableCell align="right">Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itens.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.tipo}</TableCell>
                          <TableCell>{item.descricao}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              size="small"
                              color={
                                item.status === 'APROVADO'
                                  ? 'success'
                                  : item.status === 'REJEITADO'
                                    ? 'error'
                                    : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell align="right">{formatarMoeda(item.valor)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider />

                <Stack direction="row" justifyContent="flex-end" spacing={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total Orçado: <strong>{formatarMoeda(totalGeral)}</strong>
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Total Aprovado: <strong>{formatarMoeda(totalAprovado)}</strong>
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}

          {aba === 1 && (
            <Box role="tabpanel" id="painel-cliente" aria-labelledby="tab-cliente" sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Aprove ou rejeite individualmente cada item do seu orçamento
                </Typography>

                <TableContainer>
                  <Table aria-label="Aprovação de itens pelo cliente">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Valor</TableCell>
                        <TableCell>Decisão</TableCell>
                        <TableCell align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itens.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.tipo}</TableCell>
                          <TableCell>{item.descricao}</TableCell>
                          <TableCell align="right">{formatarMoeda(item.valor)}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              size="small"
                              color={
                                item.status === 'APROVADO'
                                  ? 'success'
                                  : item.status === 'REJEITADO'
                                    ? 'error'
                                    : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant={item.status === 'APROVADO' ? 'contained' : 'outlined'}
                                color="success"
                                onClick={() => alterarStatusItem(item.id, 'APROVADO')}
                              >
                                Aprovar
                              </Button>
                              <Button
                                size="small"
                                variant={item.status === 'REJEITADO' ? 'contained' : 'outlined'}
                                color="error"
                                onClick={() => alterarStatusItem(item.id, 'REJEITADO')}
                              >
                                Rejeitar
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider />

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                >
                  <Stack direction="row" spacing={3}>
                    <Typography variant="body2" color="text.secondary">
                      Rejeitado: <strong>{formatarMoeda(totalRejeitado)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Geral: <strong>{formatarMoeda(totalGeral)}</strong>
                    </Typography>
                  </Stack>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                    Total Aprovado: {formatarMoeda(totalAprovado)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
