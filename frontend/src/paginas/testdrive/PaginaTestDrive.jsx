import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Container,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { api, extrairMensagemErro } from '../../servicos/api';

export default function PaginaTestDrive({ sessao, onVoltar }) {
  const [modo, setModo] = useState('lista'); // 'lista' ou 'formulario'
  const [agendamentos, setAgendamentos] = useState([]);
  const [veiculosDisponiveis, setVeiculosDisponiveis] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [termoTexto, setTermoTexto] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);

  // Formulário de agendamento
  const [veiculoId, setVeiculoId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [cnhNumero, setCnhNumero] = useState('');
  const [cnhCategoria, setCnhCategoria] = useState('B');
  const [cnhValidade, setCnhValidade] = useState('');
  const [aceiteTermo, setAceiteTermo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState('');

  // Cancelamento
  const [dialogCancelarAberto, setDialogCancelarAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [cancelando, setCancelando] = useState(false);
  const [erroCancelamento, setErroCancelamento] = useState('');

  // Notificações
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erroLista, setErroLista] = useState('');

  const perfil = sessao?.perfil;
  const ehCliente = perfil === 'CLIENTE';
  const temPermissao = ehCliente || perfil === 'CONSULTOR_VENDAS' || perfil === 'ADMINISTRADOR';

  useEffect(() => {
    if (!temPermissao) return;
    let ativo = true;

    const promessas = [
      api.get('/api/test-drives'),
      api.get('/api/veiculos/disponiveis'),
      api.get('/api/test-drives/termo'),
    ];

    if (!ehCliente) {
      promessas.push(api.get('/api/clientes'));
    }

    Promise.all(promessas)
      .then(([respAgendamentos, respVeiculos, respTermo, respClientes]) => {
        if (ativo) {
          setAgendamentos(respAgendamentos.data || []);
          setVeiculosDisponiveis(respVeiculos.data || []);
          setTermoTexto(respTermo.data?.texto || '');
          if (respClientes) {
            setClientes(respClientes.data || []);
          }
          setCarregando(false);
        }
      })
      .catch((erro) => {
        if (ativo) {
          setErroLista(extrairMensagemErro(erro));
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [temPermissao, ehCliente, versao]);

  function abrirNovoAgendamento() {
    setVeiculoId('');
    setClienteId('');
    setDataHora('');
    setCnhNumero('');
    setCnhCategoria('B');
    setCnhValidade('');
    setAceiteTermo(false);
    setErroFormulario('');
    setModo('formulario');
  }

  async function handleAgendar(e) {
    e.preventDefault();
    setErroFormulario('');

    const payload = {
      veiculoId: veiculoId ? Number(veiculoId) : null,
      dataHora: dataHora ? dataHora : null,
      cnhNumero: cnhNumero.trim(),
      cnhCategoria: cnhCategoria,
      cnhValidade: cnhValidade ? cnhValidade : null,
      aceiteTermo: aceiteTermo,
    };

    if (!ehCliente) {
      payload.clienteId = clienteId ? Number(clienteId) : null;
    }

    setSalvando(true);
    try {
      await api.post('/api/test-drives', payload);
      setMensagemSucesso('Test-drive agendado com sucesso!');
      setVersao((v) => v + 1);
      setModo('lista');
    } catch (erro) {
      setErroFormulario(extrairMensagemErro(erro));
    } finally {
      setSalvando(false);
    }
  }

  function abrirDialogCancelar(ag) {
    setAgendamentoSelecionado(ag);
    setMotivoCancelamento('');
    setErroCancelamento('');
    setDialogCancelarAberto(true);
  }

  function fecharDialogCancelar() {
    setDialogCancelarAberto(false);
    setAgendamentoSelecionado(null);
    setMotivoCancelamento('');
    setErroCancelamento('');
  }

  async function handleConfirmarCancelamento() {
    if (!agendamentoSelecionado || motivoCancelamento.trim().length < 5) return;

    setCancelando(true);
    setErroCancelamento('');
    try {
      await api.post(`/api/test-drives/${agendamentoSelecionado.id}/cancelar`, {
        motivo: motivoCancelamento.trim(),
      });
      setMensagemSucesso('Agendamento cancelado com sucesso!');
      setVersao((v) => v + 1);
      fecharDialogCancelar();
    } catch (erro) {
      setErroCancelamento(extrairMensagemErro(erro));
    } finally {
      setCancelando(false);
    }
  }

  function formatarDataHora(valor) {
    if (!valor) return '-';
    try {
      const data = new Date(valor);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return valor;
    }
  }

  // Verificação de permissão
  if (!temPermissao) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', p: 4 }}>
        <Container maxWidth="md">
          <Button
            variant="outlined"
            onClick={onVoltar}
            sx={{ mb: 3 }}
          >
            Voltar
          </Button>
          <Alert severity="error" variant="outlined">
            Acesso negado.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cabeçalho */}
      <Box
        component="header"
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: { xs: 2, sm: 4 },
          py: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" component="h1" sx={{ color: 'text.primary', fontWeight: 600 }}>
            Agendamento de Test-Drive
          </Typography>

          <Button
            variant="outlined"
            onClick={
              modo === 'formulario'
                ? () => {
                    setCarregando(true);
                    setModo('lista');
                    setVersao((v) => v + 1);
                  }
                : onVoltar
            }
            sx={{
              color: 'primary.main',
              borderColor: 'divider',
              fontWeight: 600,
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.light',
              },
            }}
          >
            {modo === 'formulario' ? 'Voltar para Lista' : 'Voltar para a Home'}
          </Button>
        </Box>
      </Box>

      {/* Conteúdo Principal */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {modo === 'lista' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Barra de Ações */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'background.paper',
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                {ehCliente ? 'Seus agendamentos de test-drive' : 'Todos os agendamentos'}
              </Typography>

              <Button
                variant="contained"
                onClick={abrirNovoAgendamento}
                sx={{
                  px: 3,
                  py: 1,
                }}
              >
                Agendar test-drive
              </Button>
            </Box>

            {erroLista && (
              <Alert severity="error" variant="outlined">
                {erroLista}
              </Alert>
            )}

            {/* Tabela de Agendamentos */}
            <TableContainer
              component={Paper}
              sx={{ backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
            >
              <Table aria-label="Tabela de agendamentos de test-drive">
                <TableHead>
                  <TableRow>
                    <TableCell>Veículo</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Data e Hora</TableCell>
                    <TableCell>CNH</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {carregando ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        <CircularProgress size={28} sx={{ mb: 1 }} />
                        <Typography variant="body2">Carregando agendamentos...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : agendamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Nenhum agendamento encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agendamentos.map((ag) => {
                      const cancelado = ag.estado === 'CANCELADO';
                      return (
                        <TableRow key={ag.id} sx={{ '&:hover': { backgroundColor: '#F7F9FA' } }}>
                          <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>
                            {ag.veiculoModelo}
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                              Placa: {ag.veiculoPlaca}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ color: 'text.primary' }}>
                            {ag.clienteNome}
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                              {ag.clienteEmail}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ color: 'text.primary' }}>
                            {formatarDataHora(ag.dataHora)}
                          </TableCell>

                          <TableCell sx={{ color: 'text.secondary' }}>
                            {ag.cnhNumero} ({ag.cnhCategoria})
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={cancelado ? 'Cancelado' : 'Agendado'}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                backgroundColor: cancelado ? '#EEF1F2' : '#E8F4F3',
                                color: cancelado ? 'text.secondary' : 'success.dark',
                              }}
                            />
                            {cancelado && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                                  <strong>Motivo:</strong> {ag.motivoCancelamento}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                  Por: {ag.canceladoPor} em {formatarDataHora(ag.canceladoEm)}
                                </Typography>
                              </Box>
                            )}
                          </TableCell>

                          <TableCell align="right">
                            {!cancelado ? (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => abrirDialogCancelar(ag)}
                                sx={{
                                  borderColor: 'error.main',
                                  color: 'error.main',
                                  fontSize: '0.8rem',
                                  '&:hover': {
                                    borderColor: 'error.dark',
                                    backgroundColor: 'rgba(195, 78, 82, 0.08)',
                                  },
                                }}
                              >
                                Cancelar
                              </Button>
                            ) : (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Encerrado
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          /* Modo Formulário: Agendar Test-Drive */
          <Box
            component="form"
            onSubmit={handleAgendar}
            noValidate
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              p: { xs: 2.5, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Typography component="h2" variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
              Agendar Novo Test-Drive
            </Typography>

            {erroFormulario && (
              <Alert severity="error" variant="outlined" role="alert">
                {erroFormulario}
              </Alert>
            )}

            {/* Aviso se não houver veículos disponíveis */}
            {veiculosDisponiveis.length === 0 && (
              <Alert severity="warning" variant="outlined">
                Nenhum veículo disponível; ative um veículo no Inventário.
              </Alert>
            )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2.5,
              }}
            >
              {/* Seleção de Cliente (somente Vendas e Admin) */}
              {!ehCliente && (
                <FormControl size="small" fullWidth sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <InputLabel id="campo-cliente-rotulo">
                    Cliente *
                  </InputLabel>
                  <Select
                    labelId="campo-cliente-rotulo"
                    value={clienteId}
                    label="Cliente *"
                    onChange={(e) => setClienteId(e.target.value)}
                  >
                    <MenuItem value="">Selecione um cliente</MenuItem>
                    {clientes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nome} ({c.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Seleção de Veículo Disponível */}
              <FormControl size="small" fullWidth>
                <InputLabel id="campo-veiculo-rotulo">
                  Veículo Disponível *
                </InputLabel>
                <Select
                  labelId="campo-veiculo-rotulo"
                  value={veiculoId}
                  label="Veículo Disponível *"
                  onChange={(e) => setVeiculoId(e.target.value)}
                  disabled={veiculosDisponiveis.length === 0}
                >
                  <MenuItem value="">Selecione um veículo</MenuItem>
                  {veiculosDisponiveis.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.modelo} - Placa: {v.placa} ({v.ano})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Data e Hora */}
              <TextField
                id="campo-data-hora"
                label="Data e Hora do Test-Drive *"
                type="datetime-local"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Hoje ou data futura"
              />

              {/* Número da CNH */}
              <TextField
                id="campo-cnh-numero"
                label="Número da CNH *"
                placeholder="Ex: 12345678901"
                value={cnhNumero}
                onChange={(e) => setCnhNumero(e.target.value)}
                helperText="11 dígitos numéricos"
              />

              {/* Categoria da CNH */}
              <FormControl size="small" fullWidth>
                <InputLabel id="campo-cnh-cat-rotulo">
                  Categoria da CNH *
                </InputLabel>
                <Select
                  labelId="campo-cnh-cat-rotulo"
                  value={cnhCategoria}
                  label="Categoria da CNH *"
                  onChange={(e) => setCnhCategoria(e.target.value)}
                >
                  <MenuItem value="B">Categoria B</MenuItem>
                  <MenuItem value="C">Categoria C</MenuItem>
                  <MenuItem value="D">Categoria D</MenuItem>
                  <MenuItem value="E">Categoria E</MenuItem>
                </Select>
              </FormControl>

              {/* Validade da CNH */}
              <TextField
                id="campo-cnh-validade"
                label="Validade da CNH *"
                type="date"
                value={cnhValidade}
                onChange={(e) => setCnhValidade(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Não pode estar vencida na data marcada"
              />
            </Box>

            {/* Termo de Responsabilidade */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Termo de Responsabilidade:
              </Typography>

              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: '#F7F9FA',
                  maxHeight: 140,
                  overflowY: 'auto',
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {termoTexto || 'Carregando termo de responsabilidade...'}
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    id="checkbox-termo"
                    checked={aceiteTermo}
                    onChange={(e) => setAceiteTermo(e.target.checked)}
                    sx={{ color: 'text.secondary', '&.Mui-checked': { color: 'primary.main' } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    Declaro que li e aceito eletronicamente o termo de responsabilidade acima. *
                  </Typography>
                }
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={salvando || veiculosDisponiveis.length === 0}
                sx={{
                  px: 4,
                  py: 1.25,
                }}
              >
                {salvando ? 'Agendando...' : 'Confirmar agendamento'}
              </Button>
            </Box>
          </Box>
        )}
      </Container>

      {/* Dialog de Cancelamento com Motivo Obrigatório */}
      <Dialog
        open={dialogCancelarAberto}
        onClose={fecharDialogCancelar}
        PaperProps={{
          sx: {
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            minWidth: { xs: 300, sm: 480 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Cancelar Agendamento de Test-Drive</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {erroCancelamento && (
            <Alert severity="error" variant="outlined">
              {erroCancelamento}
            </Alert>
          )}

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Veículo: <strong>{agendamentoSelecionado?.veiculoModelo}</strong> (Placa: {agendamentoSelecionado?.veiculoPlaca})
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Data agendada: <strong>{formatarDataHora(agendamentoSelecionado?.dataHora)}</strong>
          </Typography>

          <TextField
            id="campo-motivo-cancelamento"
            label="Motivo do cancelamento *"
            placeholder="Informe o motivo detalhado do cancelamento..."
            multiline
            rows={3}
            value={motivoCancelamento}
            onChange={(e) => setMotivoCancelamento(e.target.value)}
            helperText={`${motivoCancelamento.trim().length} de no mínimo 5 caracteres`}
            sx={{
              mt: 1,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={fecharDialogCancelar}
            disabled={cancelando}
            sx={{
              color: 'text.primary',
              borderColor: 'divider',
            }}
          >
            Voltar
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirmarCancelamento}
            disabled={cancelando || motivoCancelamento.trim().length < 5}
            sx={{
              backgroundColor: 'error.main',
              '&:hover': { backgroundColor: 'error.dark' },
            }}
          >
            {cancelando ? 'Cancelando...' : 'Confirmar cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de Sucesso */}
      <Snackbar
        open={!!mensagemSucesso}
        autoHideDuration={5000}
        onClose={() => setMensagemSucesso('')}
        message={mensagemSucesso}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
