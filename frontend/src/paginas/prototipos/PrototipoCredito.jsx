import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { BANCOS_PARCEIROS, VALORES_INICIAIS_CREDITO } from '../../dados/dadosCredito';
import { ESTILO_FUNDO_LISTRAS } from '../Home';

function formatarCpf(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function validarCpf(cpf) {
  const limpo = String(cpf || '').replace(/\D/g, '');
  if (limpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(limpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i += 1) {
    soma += Number(limpo[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number(limpo[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i += 1) {
    soma += Number(limpo[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === Number(limpo[10]);
}

function calcularParcelaPrice(valorFinanciado, taxaMensalPercent, prazoMeses) {
  if (valorFinanciado <= 0) return 0;
  const i = taxaMensalPercent / 100;
  if (i === 0) return valorFinanciado / prazoMeses;
  const fator = Math.pow(1 + i, prazoMeses);
  return valorFinanciado * ((i * fator) / (fator - 1));
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function PrototipoCredito() {
  const [cpf, setCpf] = useState(VALORES_INICIAIS_CREDITO.cpf);
  const [renda, setRenda] = useState(VALORES_INICIAIS_CREDITO.renda);
  const [valorVeiculo, setValorVeiculo] = useState(VALORES_INICIAIS_CREDITO.valorVeiculo);
  const [entrada, setEntrada] = useState(VALORES_INICIAIS_CREDITO.entrada);
  const [analisando, setAnalisando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState('');
  const [reprovacao, setReprovacao] = useState('');
  const [propostas, setPropostas] = useState([]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleSimular(e) {
    e.preventDefault();
    setErroFormulario('');
    setReprovacao('');
    setPropostas([]);

    if (!validarCpf(cpf)) {
      setErroFormulario('CPF inválido. Verifique os 11 dígitos e os dígitos verificadores.');
      return;
    }

    const rendaNum = Number(renda);
    const valorNum = Number(valorVeiculo);
    const entradaNum = Number(entrada);

    if (!rendaNum || rendaNum <= 0 || !valorNum || valorNum <= 0 || entradaNum < 0) {
      setErroFormulario('Preencha valores numéricos válidos para renda, veículo e entrada.');
      return;
    }

    if (entradaNum > valorNum) {
      setErroFormulario('A entrada não pode ser maior que o valor do veículo.');
      return;
    }

    const valorFinanciado = valorNum - entradaNum;
    if (valorFinanciado <= 0) {
      setErroFormulario('Com entrada igual ao valor do veículo, não há saldo a financiar.');
      return;
    }

    setAnalisando(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setAnalisando(false);

      const geradas = BANCOS_PARCEIROS.map((b) => ({
        ...b,
        valorFinanciado,
        parcela: calcularParcelaPrice(valorFinanciado, b.taxaMensal, b.prazo),
      }));

      const menorParcela = Math.min(...geradas.map((p) => p.parcela));
      const comprometimentoMaximo = rendaNum * 0.3;

      if (rendaNum < 1800 || menorParcela > comprometimentoMaximo) {
        setReprovacao(
          `Proposta reprovada: renda mensal (${formatarMoeda(rendaNum)}) insuficiente. A menor parcela calculada (${formatarMoeda(menorParcela)} em 48x) excede o limite de 30% da renda (${formatarMoeda(comprometimentoMaximo)}).`
        );
        return;
      }

      setPropostas(geradas);
    }, 2000);
  }

  return (
    <Box component="main" sx={{ ...ESTILO_FUNDO_LISTRAS, p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Simulação e Análise de Crédito
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Validação cadastral no cliente e cálculo de parcelas pela Tabela Price
            </Typography>
          </Box>
        </Stack>


        <Paper
          component="form"
          onSubmit={handleSimular}
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={2.5}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Dados do Proponente e Financiamento
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              <TextField
                id="campo-cpf"
                label="CPF do Cliente"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatarCpf(e.target.value))}
                inputProps={{ maxLength: 14, 'aria-label': 'CPF do Cliente' }}
                required
                fullWidth
              />
              <TextField
                id="campo-renda"
                label="Renda Mensal (R$)"
                type="number"
                value={renda}
                onChange={(e) => setRenda(e.target.value)}
                inputProps={{ min: 0, step: '100', 'aria-label': 'Renda Mensal' }}
                required
                fullWidth
              />
              <TextField
                id="campo-valor-veiculo"
                label="Valor do Veículo (R$)"
                type="number"
                value={valorVeiculo}
                onChange={(e) => setValorVeiculo(e.target.value)}
                inputProps={{ min: 1000, step: '500', 'aria-label': 'Valor do Veículo' }}
                required
                fullWidth
              />
              <TextField
                id="campo-entrada"
                label="Valor de Entrada (R$)"
                type="number"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                inputProps={{ min: 0, step: '500', 'aria-label': 'Valor de Entrada' }}
                required
                fullWidth
              />
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button type="submit" variant="contained" disabled={analisando}>
                {analisando ? 'Analisando crédito...' : 'Simular financiamento'}
              </Button>
            </Stack>

            {analisando && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Consultando score e políticas de crédito (2s)...
                </Typography>
                <LinearProgress />
              </Box>
            )}
          </Stack>
        </Paper>

        {erroFormulario && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {erroFormulario}
          </Alert>
        )}

        {reprovacao && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {reprovacao}
          </Alert>
        )}

        {propostas.length > 0 && (
          <Stack spacing={2}>
            <Alert severity="success">
              Crédito pré-aprovado! Valor financiado:{' '}
              <strong>{formatarMoeda(propostas[0].valorFinanciado)}</strong>
            </Alert>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {propostas.map((prop) => (
                <Paper
                  key={prop.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {prop.banco}
                      </Typography>
                      <Chip label={`${prop.prazo}x`} color="primary" size="small" />
                    </Stack>

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Parcela Mensal (Tabela Price)
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {formatarMoeda(prop.parcela)}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Taxa de juros: <strong>{prop.taxaMensal.toFixed(2).replace('.', ',')}% a.m.</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Prazo: <strong>{prop.prazo} meses</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {prop.observacao}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
