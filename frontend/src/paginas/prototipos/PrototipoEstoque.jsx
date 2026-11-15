import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
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
import { PECAS_INICIAIS_ESTOQUE } from '../../dados/dadosEstoque';
import { ESTILO_FUNDO_LISTRAS } from '../Home';

export default function PrototipoEstoque({ onVoltar }) {
  const navigate = useNavigate();
  const [pecas, setPecas] = useState(PECAS_INICIAIS_ESTOQUE);
  const [solicitacoesCompra, setSolicitacoesCompra] = useState([]);
  const [mensagemAcao, setMensagemAcao] = useState('');

  function verificarESolicitarCompra(listaAtualizada) {
    const horario = new Date().toLocaleTimeString('pt-BR');
    setSolicitacoesCompra((prev) => {
      const codigosJaSolicitados = new Set(prev.map((s) => s.codigo));
      const novas = [];

      listaAtualizada.forEach((peca) => {
        const disponivel = peca.saldo - peca.reservado;
        if (disponivel <= peca.minimo && !codigosJaSolicitados.has(peca.codigo)) {
          novas.push({
            id: `SC-${peca.codigo}-${Date.now()}`,
            codigo: peca.codigo,
            nome: peca.nome,
            disponivel,
            minimo: peca.minimo,
            quantidadeSugerida: peca.minimo * 2,
            horario,
          });
        }
      });

      return novas.length > 0 ? [...novas, ...prev] : prev;
    });
  }

  function handleOrcarOs() {
    const atualizadas = pecas.map((peca) => {
      const disponivel = peca.saldo - peca.reservado;
      const incremento = Math.min(peca.qtdPorOs, disponivel);
      return {
        ...peca,
        reservado: peca.reservado + incremento,
      };
    });

    setPecas(atualizadas);
    verificarESolicitarCompra(atualizadas);
    setMensagemAcao('OS orçada: peças reservadas no estoque (reservado aumentado).');
  }

  function handleFinalizarOs() {
    const atualizadas = pecas.map((peca) => {
      const baixa = Math.min(peca.reservado, peca.qtdPorOs);
      return {
        ...peca,
        saldo: Math.max(0, peca.saldo - baixa),
        reservado: Math.max(0, peca.reservado - baixa),
      };
    });

    setPecas(atualizadas);
    verificarESolicitarCompra(atualizadas);
    setMensagemAcao('OS finalizada: baixa definitiva realizada no saldo e na reserva.');
  }

  function handleResetar() {
    setPecas(PECAS_INICIAIS_ESTOQUE);
    setSolicitacoesCompra([]);
    setMensagemAcao('Estoque restaurado para os saldos iniciais.');
  }

  function voltar() {
    if (typeof onVoltar === 'function') {
      onVoltar();
    } else {
      navigate('/');
    }
  }

  return (
    <Box component="main" sx={{ ...ESTILO_FUNDO_LISTRAS, p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Controle de Estoque e Reposição de Peças (RF-08)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reserva automática em orçamento, baixa na finalização e gatilho de compra
            </Typography>
          </Box>
          <Button variant="outlined" onClick={voltar}>
            Voltar para Home
          </Button>
        </Stack>

        <Alert severity="info" sx={{ mb: 2 }}>
          Protótipo visual - dados simulados
        </Alert>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={handleOrcarOs}>
            Orçar OS
          </Button>
          <Button variant="contained" color="secondary" onClick={handleFinalizarOs}>
            Finalizar OS
          </Button>
          <Button variant="outlined" onClick={handleResetar}>
            Resetar
          </Button>
        </Stack>

        {mensagemAcao && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {mensagemAcao}
          </Alert>
        )}

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
            <TableContainer>
              <Table aria-label="Tabela de estoque de peças">
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Peça</TableCell>
                    <TableCell align="right">Saldo</TableCell>
                    <TableCell align="right">Reservado</TableCell>
                    <TableCell align="right">Disponível</TableCell>
                    <TableCell align="right">Mínimo</TableCell>
                    <TableCell>Situação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pecas.map((peca) => {
                    const disponivel = peca.saldo - peca.reservado;
                    const abaixoOuNoMinimo = disponivel <= peca.minimo;

                    return (
                      <TableRow
                        key={peca.codigo}
                        sx={{
                          bgcolor: abaixoOuNoMinimo
                            ? 'rgba(255, 138, 128, 0.14)'
                            : 'transparent',
                        }}
                      >
                        <TableCell>
                          <strong>{peca.codigo}</strong>
                        </TableCell>
                        <TableCell>{peca.nome}</TableCell>
                        <TableCell align="right">{peca.saldo}</TableCell>
                        <TableCell align="right">{peca.reservado}</TableCell>
                        <TableCell align="right">
                          <strong>{disponivel}</strong>
                        </TableCell>
                        <TableCell align="right">{peca.minimo}</TableCell>
                        <TableCell>
                          <Chip
                            label={abaixoOuNoMinimo ? 'Reposição' : 'OK'}
                            color={abaixoOuNoMinimo ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                Solicitações de compra geradas ({solicitacoesCompra.length})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Geradas quando saldo disponível ≤ ponto mínimo
              </Typography>
            </Box>

            {solicitacoesCompra.length === 0 ? (
              <Box sx={{ p: 2.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma solicitação de compra gerada ainda. Clique em &quot;Orçar OS&quot; para
                  simular reservas.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {solicitacoesCompra.map((sol, idx) => (
                  <Box key={sol.id}>
                    <ListItem sx={{ py: 1.5, px: 2.5 }}>
                      <ListItemText
                        primary={`${sol.codigo} - ${sol.nome}`}
                        secondary={`Disponível: ${sol.disponivel} (mín. ${sol.minimo}) • Pedido sugerido: +${sol.quantidadeSugerida} un. (${sol.horario})`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                    </ListItem>
                    {idx < solicitacoesCompra.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
