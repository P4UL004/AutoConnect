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
  TablePagination,
  Paper,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Container,
} from '@mui/material';
import CampoFotos from '../../componentes/CampoFotos';
import { api, extrairMensagemErro } from '../../servicos/api';

const ESTADOS_VEICULO = [
  { valor: 'RASCUNHO', rotulo: 'Rascunho' },
  { valor: 'DISPONIVEL', rotulo: 'Disponível' },
  { valor: 'RESERVADO', rotulo: 'Reservado' },
  { valor: 'EM_MANUTENCAO', rotulo: 'Em Manutenção' },
  { valor: 'EM_TEST_DRIVE', rotulo: 'Em Test-Drive' },
  { valor: 'VENDIDO', rotulo: 'Vendido' },
];

export default function PaginaInventario({ sessao }) {
  const [modo, setModo] = useState('lista'); // 'lista' ou 'formulario'
  const [veiculos, setVeiculos] = useState([]);
  const [totalElementos, setTotalElementos] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [tamanho, setTamanho] = useState(10);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPlaca, setFiltroPlaca] = useState('');
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [versaoLista, setVersaoLista] = useState(0);

  // Estados do formulário
  const [veiculoAtual, setVeiculoAtual] = useState(null);
  const [placa, setPlaca] = useState('');
  const [chassi, setChassi] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [quilometragem, setQuilometragem] = useState('');
  const [laudoCautelar, setLaudoCautelar] = useState('');
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [ativando, setAtivando] = useState(false);

  // Alteração manual de estado (somente Administrador)
  const [novoEstadoManual, setNovoEstadoManual] = useState('');
  const [alterandoEstado, setAlterandoEstado] = useState(false);

  // Notificações
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erroFormulario, setErroFormulario] = useState('');
  const [erroAtivacao, setErroAtivacao] = useState('');
  const [erroLista, setErroLista] = useState('');

  const ehAdmin = sessao?.perfil === 'ADMINISTRADOR';
  const temPermissao = ehAdmin || sessao?.perfil === 'CONSULTOR_VENDAS';

  useEffect(() => {
    if (!temPermissao) return;
    let ativo = true;

    const params = {
      pagina,
      tamanho,
    };
    if (filtroEstado && filtroEstado.trim() !== '') {
      params.estado = filtroEstado.trim();
    }
    if (filtroPlaca && filtroPlaca.trim() !== '') {
      params.placa = filtroPlaca.trim();
    }

    api.get('/api/veiculos', { params })
      .then((resposta) => {
        if (ativo) {
          setVeiculos(resposta.data.conteudo);
          setTotalElementos(resposta.data.totalElementos);
          setCarregandoLista(false);
        }
      })
      .catch((erro) => {
        if (ativo) {
          setErroLista(extrairMensagemErro(erro));
          setCarregandoLista(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [temPermissao, pagina, tamanho, filtroEstado, filtroPlaca, versaoLista]);

  function abrirNovoVeiculo() {
    setVeiculoAtual(null);
    setPlaca('');
    setChassi('');
    setModelo('');
    setAno('');
    setQuilometragem('');
    setLaudoCautelar('');
    setErroFormulario('');
    setErroAtivacao('');
    setNovoEstadoManual('');
    setModo('formulario');
  }

  async function abrirEdicaoVeiculo(veiculo) {
    try {
      const resposta = await api.get(`/api/veiculos/${veiculo.id}`);
      const dados = resposta.data;
      setVeiculoAtual(dados);
      setPlaca(dados.placa || '');
      setChassi(dados.chassi || '');
      setModelo(dados.modelo || '');
      setAno(dados.ano != null ? String(dados.ano) : '');
      setQuilometragem(dados.quilometragem != null ? String(dados.quilometragem) : '');
      setLaudoCautelar(dados.laudoCautelar || '');
      setNovoEstadoManual(dados.estado || '');
      setErroFormulario('');
      setErroAtivacao('');
      setModo('formulario');
    } catch (erro) {
      setErroLista(extrairMensagemErro(erro));
    }
  }

  async function recarregarVeiculoAtual() {
    if (!veiculoAtual?.id) return;
    try {
      const resposta = await api.get(`/api/veiculos/${veiculoAtual.id}`);
      setVeiculoAtual(resposta.data);
      setNovoEstadoManual(resposta.data.estado || '');
    } catch {
      // Ignora erro de recarga
    }
  }

  async function handleSalvarDados(e) {
    e.preventDefault();
    setErroFormulario('');

    const dados = {
      placa: placa.trim(),
      chassi: chassi.trim(),
      modelo: modelo.trim(),
      ano: ano !== '' ? Number(ano) : null,
      quilometragem: quilometragem !== '' ? Number(quilometragem) : null,
      laudoCautelar: laudoCautelar.trim() || null,
    };

    setSalvandoDados(true);
    try {
      if (veiculoAtual?.id) {
        const resposta = await api.put(`/api/veiculos/${veiculoAtual.id}`, dados);
        setVeiculoAtual(resposta.data);
        setMensagemSucesso('Dados do veículo atualizados com sucesso!');
      } else {
        const resposta = await api.post('/api/veiculos', dados);
        setVeiculoAtual(resposta.data);
        setMensagemSucesso('Veículo cadastrado como Rascunho com sucesso! Agora adicione as fotos.');
      }
      setVersaoLista((v) => v + 1);
    } catch (erro) {
      setErroFormulario(extrairMensagemErro(erro));
    } finally {
      setSalvandoDados(false);
    }
  }

  async function handleAtivarVeiculo() {
    if (!veiculoAtual?.id) return;
    setErroAtivacao('');
    setAtivando(true);
    try {
      const resposta = await api.post(`/api/veiculos/${veiculoAtual.id}/ativar`);
      setVeiculoAtual(resposta.data);
      setNovoEstadoManual(resposta.data.estado);
      setMensagemSucesso('Veículo ativado com sucesso! Disponível para venda e test-drive.');
      setVersaoLista((v) => v + 1);
    } catch (erro) {
      setErroAtivacao(extrairMensagemErro(erro));
    } finally {
      setAtivando(false);
    }
  }

  async function handleAlterarEstadoManual() {
    if (!veiculoAtual?.id || !novoEstadoManual) return;
    setErroFormulario('');
    setAlterandoEstado(true);
    try {
      const resposta = await api.patch(`/api/veiculos/${veiculoAtual.id}/estado`, {
        estado: novoEstadoManual,
      });
      setVeiculoAtual(resposta.data);
      setMensagemSucesso(`Estado alterado para ${obterRotuloEstado(resposta.data.estado)}.`);
      setVersaoLista((v) => v + 1);
    } catch (erro) {
      setErroFormulario(extrairMensagemErro(erro));
    } finally {
      setAlterandoEstado(false);
    }
  }

  function obterRotuloEstado(valor) {
    const encontrado = ESTADOS_VEICULO.find((e) => e.valor === valor);
    return encontrado ? encontrado.rotulo : valor;
  }

  // Verificação de permissão
  if (!temPermissao) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', p: 4 }}>
        <Container maxWidth="md">
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
            Inventário de Veículos
          </Typography>

          {modo === 'formulario' && (
            <Button
              variant="outlined"
              onClick={() => {
                setCarregandoLista(true);
                setModo('lista');
                setVersaoLista((v) => v + 1);
              }}
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
              Voltar para Lista
            </Button>
          )}
        </Box>
      </Box>

      {/* Conteúdo Principal */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {modo === 'lista' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Barra de Filtros e Ações */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                backgroundColor: 'background.paper',
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, flex: 1 }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="filtro-estado-rotulo">
                    Estado
                  </InputLabel>
                  <Select
                    labelId="filtro-estado-rotulo"
                    value={filtroEstado}
                    label="Estado"
                    onChange={(e) => {
                      setCarregandoLista(true);
                      setFiltroEstado(e.target.value);
                      setPagina(0);
                    }}
                  >
                    <MenuItem value="">Todos os estados</MenuItem>
                    {ESTADOS_VEICULO.map((est) => (
                      <MenuItem key={est.valor} value={est.valor}>
                        {est.rotulo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  label="Filtrar por placa"
                  placeholder="Ex: ABC"
                  value={filtroPlaca}
                  onChange={(e) => {
                    setCarregandoLista(true);
                    setFiltroPlaca(e.target.value);
                    setPagina(0);
                  }}
                  sx={{ minWidth: 160 }}
                />
              </Box>

              <Button
                variant="contained"
                onClick={abrirNovoVeiculo}
                sx={{
                  px: 3,
                  py: 1,
                }}
              >
                Novo veículo
              </Button>
            </Box>

            {erroLista && (
              <Alert severity="error" variant="outlined">
                {erroLista}
              </Alert>
            )}

            {/* Tabela de Listagem */}
            <TableContainer
              component={Paper}
              sx={{ backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
            >
              <Table aria-label="Tabela de veículos cadastrados">
                <TableHead>
                  <TableRow>
                    <TableCell>Placa</TableCell>
                    <TableCell>Modelo</TableCell>
                    <TableCell>Ano</TableCell>
                    <TableCell>KM</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fotos</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {carregandoLista ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        <CircularProgress size={28} sx={{ mb: 1 }} />
                        <Typography variant="body2">Carregando veículos...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : veiculos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Nenhum veículo encontrado com os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    veiculos.map((v) => (
                      <TableRow key={v.id} sx={{ '&:hover': { backgroundColor: '#F7F9FA' } }}>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>{v.placa}</TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>{v.modelo}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{v.ano}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {v.quilometragem != null ? v.quilometragem.toLocaleString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={obterRotuloEstado(v.estado)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              backgroundColor: v.estado === 'DISPONIVEL' ? '#E8F4F3' : '#EEF1F2',
                              color: v.estado === 'DISPONIVEL' ? 'success.dark' : 'text.secondary',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>
                          {v.quantidadeFotos} foto(s)
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => abrirEdicaoVeiculo(v)}
                            sx={{
                              borderColor: 'divider',
                              color: 'primary.main',
                              fontSize: '0.8rem',
                              '&:hover': { borderColor: 'primary.main', backgroundColor: 'primary.light' },
                            }}
                          >
                            Visualizar / Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={totalElementos}
                page={pagina}
                rowsPerPage={tamanho}
                onPageChange={(_, novaPagina) => {
                  setCarregandoLista(true);
                  setPagina(novaPagina);
                }}
                onRowsPerPageChange={(e) => {
                  setCarregandoLista(true);
                  setTamanho(parseInt(e.target.value, 10));
                  setPagina(0);
                }}
                labelRowsPerPage="Itens por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
                sx={{
                  color: 'text.secondary',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTablePagination-selectIcon': { color: 'text.secondary' },
                }}
              />
            </TableContainer>
          </Box>
        ) : (
          /* Modo Formulário: UMA página com DUAS seções */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Seção 1: Dados do Veículo */}
            <Box
              component="form"
              onSubmit={handleSalvarDados}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography component="h2" variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  1. Dados do Veículo {veiculoAtual?.id && `(#${veiculoAtual.id} - ${obterRotuloEstado(veiculoAtual.estado)})`}
                </Typography>

                {veiculoAtual?.estado && (
                  <Chip
                    label={`Estado: ${obterRotuloEstado(veiculoAtual.estado)}`}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      backgroundColor: veiculoAtual.estado === 'DISPONIVEL' ? '#E8F4F3' : '#EEF1F2',
                      color: veiculoAtual.estado === 'DISPONIVEL' ? 'success.dark' : 'text.secondary',
                    }}
                  />
                )}
              </Box>

              {erroFormulario && (
                <Alert severity="error" variant="outlined" role="alert">
                  {erroFormulario}
                </Alert>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 2.5,
                }}
              >
                <TextField
                  id="campo-placa"
                  label="Placa *"
                  placeholder="Ex: ABC1D23 ou ABC-1234"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  helperText="Mercosul ou antiga"
                />

                <TextField
                  id="campo-chassi"
                  label="Chassi *"
                  placeholder="Ex: 9BWZZZ377VT004251"
                  value={chassi}
                  onChange={(e) => setChassi(e.target.value.toUpperCase())}
                  helperText="17 caracteres sem I, O ou Q"
                />

                <TextField
                  id="campo-modelo"
                  label="Modelo *"
                  placeholder="Ex: Gol 1.0 Trendline"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                />

                <TextField
                  id="campo-ano"
                  label="Ano *"
                  type="number"
                  placeholder="Ex: 2024"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  helperText="De 1950 ao ano atual + 1"
                />

                <TextField
                  id="campo-km"
                  label="Quilometragem (km) *"
                  type="number"
                  placeholder="Ex: 45000"
                  value={quilometragem}
                  onChange={(e) => setQuilometragem(e.target.value)}
                  helperText="Maior ou igual a zero"
                />
              </Box>

              <TextField
                id="campo-laudo"
                label="Laudo Cautelar (opcional)"
                multiline
                rows={3}
                placeholder="Insira as observações da vistoria cautelar (até 2000 caracteres)..."
                value={laudoCautelar}
                onChange={(e) => setLaudoCautelar(e.target.value)}
                helperText={`${laudoCautelar.length}/2000 caracteres`}
              />

              {/* Alteração manual de estado pelo Administrador */}
              {ehAdmin && veiculoAtual?.id && veiculoAtual.estado !== 'RASCUNHO' && (
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: '#F7F9FA',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    Alterar estado manualmente (Administrador):
                  </Typography>

                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <Select
                      value={novoEstadoManual}
                      onChange={(e) => setNovoEstadoManual(e.target.value)}
                    >
                      {ESTADOS_VEICULO.filter((est) => est.valor !== 'RASCUNHO').map((est) => (
                        <MenuItem key={est.valor} value={est.valor}>
                          {est.rotulo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    onClick={handleAlterarEstadoManual}
                    disabled={alterandoEstado || novoEstadoManual === veiculoAtual.estado}
                    sx={{
                      borderColor: 'divider',
                      color: 'primary.main',
                    }}
                  >
                    {alterandoEstado ? 'Alterando...' : 'Salvar novo estado'}
                  </Button>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={salvandoDados}
                  sx={{
                    px: 3,
                    py: 1.25,
                  }}
                >
                  {salvandoDados
                    ? 'Salvando...'
                    : veiculoAtual?.id
                    ? 'Atualizar dados'
                    : 'Salvar e avançar para fotos'}
                </Button>
              </Box>
            </Box>

            {/* Seção 2: Fotos do Veículo (Aparece após ser gravado como Rascunho) */}
            {veiculoAtual?.id ? (
              <Box
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
                  2. Fotos do Veículo
                </Typography>

                {erroAtivacao && (
                  <Alert severity="error" variant="outlined" role="alert">
                    {erroAtivacao}
                  </Alert>
                )}

                <CampoFotos
                  urlBase={`/api/veiculos/${veiculoAtual.id}/fotos`}
                  minimo={2}
                  maximo={10}
                  editavel={veiculoAtual.estado === 'RASCUNHO'}
                  aoMudar={recarregarVeiculoAtual}
                />

                {/* Botão Ativar Veículo: sempre habilitado */}
                <Box
                  sx={{
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {veiculoAtual.estado === 'RASCUNHO'
                        ? 'Para ativar o veículo e disponibilizá-lo para venda e test-drive, envie de 2 a 10 fotos válidas (mínimo 1920x1080).'
                        : `Veículo já ativado no estado ${obterRotuloEstado(veiculoAtual.estado)}.`}
                    </Typography>
                  </Box>

                  {veiculoAtual.estado === 'RASCUNHO' && (
                    <Button
                      variant="contained"
                      onClick={handleAtivarVeiculo}
                      disabled={ativando}
                      sx={{
                        borderRadius: 0,
                        backgroundColor: 'success.main',
                        color: 'common.white',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 4,
                        py: 1.25,
                        '&:hover': { backgroundColor: 'success.dark' },
                      }}
                    >
                      {ativando ? 'Ativando...' : 'Ativar veículo'}
                    </Button>
                  )}
                </Box>
              </Box>
            ) : null}
          </Box>
        )}
      </Container>

      {/* Notificação Snackbar de Sucesso */}
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
