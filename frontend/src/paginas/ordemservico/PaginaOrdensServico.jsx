import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { api, extrairMensagemErro, obterSessao } from '../../servicos/api';
import CampoFotos from '../../componentes/CampoFotos';

const ROTULOS_ESTADO = {
  RASCUNHO: 'Rascunho',
  ABERTA: 'Aberta',
  ORCADA: 'Orçada',
  APROVADA: 'Aprovada',
  EM_EXECUCAO: 'Em execução',
  EM_CONTROLE_QUALIDADE: 'Em controle de qualidade',
  FINALIZADA: 'Finalizada',
};

// Proxima acao do tecnico em cada estado (ORCADA depende do cliente)
const PROXIMA_ACAO = {
  RASCUNHO: { rotulo: 'Abrir OS', caminho: 'abrir' },
  ABERTA: { rotulo: 'Enviar orçamento', caminho: 'orcamento' },
  APROVADA: { rotulo: 'Iniciar execução', caminho: 'iniciar-execucao' },
  EM_EXECUCAO: { rotulo: 'Enviar para controle de qualidade', caminho: 'controle-qualidade' },
  EM_CONTROLE_QUALIDADE: { rotulo: 'Finalizar OS', caminho: 'finalizar' },
};

const FORMATO_MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function moeda(valor) {
  return FORMATO_MOEDA.format(Number(valor || 0));
}

function dataHora(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '-';
}

function rotuloEstado(estado) {
  return ROTULOS_ESTADO[estado] || estado;
}

/* ------------------------------------------------------------------ */
/* Dialog: nova OS (tecnico / administrador)                          */
/* ------------------------------------------------------------------ */
function NovaOsDialog({ aoFechar, aoCriar }) {
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [relato, setRelato] = useState('');
  const [checklist, setChecklist] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    Promise.all([api.get('/api/clientes'), api.get('/api/ordens-servico/veiculos')])
      .then(([resClientes, resVeiculos]) => {
        if (!ativo) return;
        setClientes(resClientes.data);
        setVeiculos(resVeiculos.data);
      })
      .catch((e) => {
        if (ativo) setErro(extrairMensagemErro(e));
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function criar() {
    setErro('');
    if (!clienteId || !veiculoId || !relato.trim()) {
      setErro('Informe cliente, veículo e o relato de sintomas.');
      return;
    }
    setEnviando(true);
    try {
      const resposta = await api.post('/api/ordens-servico', {
        clienteId: Number(clienteId),
        veiculoId: Number(veiculoId),
        relatoSintomas: relato.trim(),
        checklistAvarias: checklist.trim() || null,
      });
      aoCriar(resposta.data);
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open onClose={aoFechar} fullWidth maxWidth="sm">
      <DialogTitle>Nova ordem de serviço</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
        {erro && <Alert severity="error">{erro}</Alert>}
        <TextField
          select
          label="Cliente"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
        >
          {clientes.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nome} ({c.email})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Veículo"
          value={veiculoId}
          onChange={(e) => setVeiculoId(e.target.value)}
        >
          {veiculos.map((v) => (
            <MenuItem key={v.id} value={v.id}>
              {v.placa} - {v.modelo}
              {v.ano ? ` (${v.ano})` : ''}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Relato de sintomas"
          value={relato}
          onChange={(e) => setRelato(e.target.value)}
          multiline
          minRows={3}
        />
        <TextField
          label="Checklist de avarias (opcional)"
          value={checklist}
          onChange={(e) => setChecklist(e.target.value)}
          multiline
          minRows={2}
        />
        <Typography variant="body2" color="text.secondary">
          A OS é criada em Rascunho. Depois envie de 4 a 10 fotos e abra a OS.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={aoFechar}>Cancelar</Button>
        <Button variant="contained" onClick={criar} disabled={enviando}>
          {enviando ? 'Criando...' : 'Criar OS'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Dialog: detalhe da OS                                              */
/* ------------------------------------------------------------------ */
function DetalheOsDialog({ id, ehCliente, aoFechar, aoMudar, aoAvisar }) {
  const [os, setOs] = useState(null);
  const [versao, setVersao] = useState(0);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [tipoItem, setTipoItem] = useState('SERVICO');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [valor, setValor] = useState('');

  useEffect(() => {
    let ativo = true;
    api
      .get(`/api/ordens-servico/${id}`)
      .then((resposta) => {
        if (ativo) setOs(resposta.data);
      })
      .catch((e) => {
        if (ativo) setErro(extrairMensagemErro(e));
      });
    return () => {
      ativo = false;
    };
  }, [id, versao]);

  function recarregar() {
    setVersao((v) => v + 1);
    aoMudar();
  }

  // Executa uma chamada ao servidor e mostra a mensagem dele se for recusada
  async function executar(requisicao, mensagemSucesso) {
    setErro('');
    setOcupado(true);
    try {
      await requisicao();
      recarregar();
      if (mensagemSucesso) aoAvisar(mensagemSucesso);
    } catch (e) {
      setErro(extrairMensagemErro(e));
    } finally {
      setOcupado(false);
    }
  }

  function adicionarItem() {
    const valorNumero = Number(String(valor).replace(',', '.'));
    if (!descricao.trim()) {
      setErro('Informe a descrição do item.');
      return;
    }
    if (Number.isNaN(valorNumero) || valor === '') {
      setErro('Informe o valor unitário.');
      return;
    }
    executar(async () => {
      await api.post(`/api/ordens-servico/${id}/itens`, {
        tipo: tipoItem,
        descricao: descricao.trim(),
        quantidade: Number(quantidade),
        valorUnitario: valorNumero,
      });
      setDescricao('');
      setQuantidade('1');
      setValor('');
    }, 'Item adicionado.');
  }

  function removerItem(itemId) {
    executar(() => api.delete(`/api/ordens-servico/${id}/itens/${itemId}`), 'Item removido.');
  }

  const proximaAcao = os ? PROXIMA_ACAO[os.estado] : null;

  return (
    <Dialog open onClose={aoFechar} fullWidth maxWidth="md">
      <DialogTitle>
        {os ? `OS ${os.numero}` : 'Ordem de serviço'}{' '}
        {os && <Chip size="small" label={rotuloEstado(os.estado)} sx={{ ml: 1 }} />}
      </DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2 }}>
        {erro && <Alert severity="error">{erro}</Alert>}
        {!os && !erro && <CircularProgress />}

        {os && (
          <>
            <Box sx={{ display: 'grid', gap: 0.5 }}>
              <Typography>
                <strong>Cliente:</strong> {os.clienteNome}
              </Typography>
              <Typography>
                <strong>Veículo:</strong> {os.veiculoPlaca} - {os.veiculoModelo}
              </Typography>
              <Typography>
                <strong>Relato:</strong> {os.relatoSintomas}
              </Typography>
              {os.checklistAvarias && (
                <Typography>
                  <strong>Checklist de avarias:</strong> {os.checklistAvarias}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Criada em {dataHora(os.dataCriacao)} por {os.criadaPorNome}
                {os.dataAbertura ? ` | Aberta em ${dataHora(os.dataAbertura)}` : ''}
                {os.aprovadaEm ? ` | Aprovada em ${dataHora(os.aprovadaEm)} por ${os.aprovadaPorNome}` : ''}
                {os.finalizadaEm ? ` | Finalizada em ${dataHora(os.finalizadaEm)}` : ''}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Fotos ({os.quantidadeFotos})
              </Typography>
              <CampoFotos
                urlBase={`/api/ordens-servico/${id}/fotos`}
                minimo={4}
                maximo={10}
                editavel={!ehCliente && os.estado === 'RASCUNHO'}
                aoMudar={recarregar}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Itens do orçamento
              </Typography>
              {os.itens.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum item adicionado.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Descrição</TableCell>
                        <TableCell align="right">Qtd.</TableCell>
                        <TableCell align="right">Valor unit.</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                        {!ehCliente && <TableCell />}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {os.itens.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.tipo === 'PECA' ? 'Peça' : 'Serviço'}</TableCell>
                          <TableCell>{item.descricao}</TableCell>
                          <TableCell align="right">{item.quantidade}</TableCell>
                          <TableCell align="right">{moeda(item.valorUnitario)}</TableCell>
                          <TableCell align="right">{moeda(item.subtotal)}</TableCell>
                          {!ehCliente && (
                            <TableCell align="right">
                              <Button size="small" color="error" disabled={ocupado} onClick={() => removerItem(item.id)}>
                                Remover
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <Typography sx={{ mt: 1, textAlign: 'right' }}>
                <strong>Total: {moeda(os.total)}</strong>
              </Typography>
            </Box>

            {/* RN03: o formulario fica sempre visivel; depois da aprovacao o servidor recusa. */}
            {!ehCliente && (
              <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '130px 1fr 90px 130px' } }}>
                <TextField select size="small" label="Tipo" value={tipoItem} onChange={(e) => setTipoItem(e.target.value)}>
                  <MenuItem value="SERVICO">Serviço</MenuItem>
                  <MenuItem value="PECA">Peça</MenuItem>
                </TextField>
                <TextField size="small" label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                <TextField
                  size="small"
                  label="Qtd."
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  inputProps={{ min: 1 }}
                />
                <TextField size="small" label="Valor unit. (R$)" value={valor} onChange={(e) => setValor(e.target.value)} />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Button variant="outlined" disabled={ocupado} onClick={adicionarItem}>
                    Adicionar item
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {os && ehCliente && os.estado === 'ORCADA' && (
          <>
            <Button
              color="error"
              disabled={ocupado}
              onClick={() => executar(() => api.post(`/api/ordens-servico/${id}/recusar`), 'Orçamento recusado. A OS voltou para Aberta.')}
            >
              Recusar orçamento
            </Button>
            <Button
              variant="contained"
              disabled={ocupado}
              onClick={() => executar(() => api.post(`/api/ordens-servico/${id}/aprovar`), 'Orçamento aprovado.')}
            >
              Aprovar orçamento
            </Button>
          </>
        )}
        {os && !ehCliente && proximaAcao && (
          <Button
            variant="contained"
            disabled={ocupado}
            onClick={() => executar(() => api.post(`/api/ordens-servico/${id}/${proximaAcao.caminho}`), `${proximaAcao.rotulo}: concluído.`)}
          >
            {proximaAcao.rotulo}
          </Button>
        )}
        {os && !ehCliente && os.estado === 'ORCADA' && (
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Aguardando aprovação do cliente.
          </Typography>
        )}
        <Button onClick={aoFechar}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Pagina                                                             */
/* ------------------------------------------------------------------ */
export default function PaginaOrdensServico({ sessao, onVoltar }) {
  const perfil = sessao?.perfil || obterSessao()?.perfil || '';
  const ehCliente = perfil === 'CLIENTE';

  const [ordens, setOrdens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [versao, setVersao] = useState(0);
  const [idSelecionado, setIdSelecionado] = useState(null);
  const [novaAberta, setNovaAberta] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    let ativo = true;
    api
      .get('/api/ordens-servico', {
        params: { estado: filtroEstado || undefined, pagina, tamanho: 10 },
      })
      .then((resposta) => {
        if (!ativo) return;
        setOrdens(resposta.data.conteudo || []);
        setTotalPaginas(Math.max(resposta.data.totalPaginas || 1, 1));
        setErro('');
      })
      .catch((e) => {
        if (ativo) setErro(extrairMensagemErro(e));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [filtroEstado, pagina, versao]);

  function mudarFiltro(valor) {
    setCarregando(true);
    setFiltroEstado(valor);
    setPagina(0);
  }

  function recarregarLista() {
    setVersao((v) => v + 1);
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography component="h1" variant="h5">
          Ordens de Serviço
        </Typography>
        <Button variant="outlined" onClick={onVoltar}>
          Voltar para a Home
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          select
          size="small"
          label="Estado"
          value={filtroEstado}
          onChange={(e) => mudarFiltro(e.target.value)}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(ROTULOS_ESTADO).map(([chave, rotulo]) => (
            <MenuItem key={chave} value={chave}>
              {rotulo}
            </MenuItem>
          ))}
        </TextField>
        {!ehCliente && (
          <Button variant="contained" onClick={() => setNovaAberta(true)}>
            Nova OS
          </Button>
        )}
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}

      {carregando ? (
        <CircularProgress />
      ) : ordens.length === 0 ? (
        <Typography color="text.secondary">
          {ehCliente ? 'Você ainda não tem ordens de serviço.' : 'Nenhuma ordem de serviço encontrada.'}
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Veículo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Criada em</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {ordens.map((os) => (
                <TableRow key={os.id} hover>
                  <TableCell>{os.numero}</TableCell>
                  <TableCell>{os.clienteNome}</TableCell>
                  <TableCell>
                    {os.veiculoPlaca} - {os.veiculoModelo}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={rotuloEstado(os.estado)} />
                  </TableCell>
                  <TableCell>{dataHora(os.dataCriacao)}</TableCell>
                  <TableCell align="right">{moeda(os.total)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => setIdSelecionado(os.id)}>
                      Abrir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
        <Button disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>
          Anterior
        </Button>
        <Typography variant="body2">
          Página {pagina + 1} de {totalPaginas}
        </Typography>
        <Button disabled={pagina + 1 >= totalPaginas} onClick={() => setPagina((p) => p + 1)}>
          Próxima
        </Button>
      </Box>

      {novaAberta && (
        <NovaOsDialog
          aoFechar={() => setNovaAberta(false)}
          aoCriar={(nova) => {
            setNovaAberta(false);
            recarregarLista();
            setAviso(`OS ${nova.numero} criada em Rascunho.`);
            setIdSelecionado(nova.id);
          }}
        />
      )}

      {idSelecionado && (
        <DetalheOsDialog
          id={idSelecionado}
          ehCliente={ehCliente}
          aoFechar={() => setIdSelecionado(null)}
          aoMudar={recarregarLista}
          aoAvisar={setAviso}
        />
      )}

      <Snackbar
        open={!!aviso}
        autoHideDuration={4000}
        onClose={() => setAviso('')}
        message={aviso}
      />
    </Box>
  );
}
