import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KPIS_PAINEL_BI, SERIE_MENSAL_BI } from '../../dados/dadosPainelBI';
import { ESTILO_FUNDO_LISTRAS } from '../Home';

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function PrototipoPainelBI({ onVoltar }) {
  const navigate = useNavigate();

  function handleExportarCsv() {
    const cabecalho = [
      'Mes',
      'Faturamento_BRL',
      'Conversao_TestDrive_Percent',
      'TestDrives_Realizados',
      'Vendas_Concluidas',
    ];
    const linhas = SERIE_MENSAL_BI.map((item) =>
      [
        item.mes,
        item.faturamento.toFixed(2),
        item.conversao.toFixed(1),
        item.testDrives,
        item.vendas,
      ].join(';')
    );

    const resumoKpis = [
      '',
      'Indicador;Valor',
      `Faturamento do Mes;${KPIS_PAINEL_BI.faturamentoMes.toFixed(2)}`,
      `Conversao Test-Drives (%);${KPIS_PAINEL_BI.conversaoTestDrives.toFixed(1)}`,
      `Tempo Medio em Patio (dias);${KPIS_PAINEL_BI.tempoMedioPatioDias.toFixed(1)}`,
      `Ticket Medio (BRL);${KPIS_PAINEL_BI.ticketMedio.toFixed(2)}`,
    ];

   const conteudoCsv = [cabecalho.join(';'), ...linhas, ...resumoKpis].join('\n');
    const blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'painel-bi-autoconnect-2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleExportarPdf() {
    window.print();
  }

  function voltar() {
    if (typeof onVoltar === 'function') {
      onVoltar();
    } else {
      navigate('/');
    }
  }

  const cards = [
    {
      titulo: 'Faturamento do Mês',
      valor: formatarMoeda(KPIS_PAINEL_BI.faturamentoMes),
      detalhe: KPIS_PAINEL_BI.variacaoFaturamento,
    },
    {
      titulo: 'Conversão de Test-drives',
      valor: `${KPIS_PAINEL_BI.conversaoTestDrives.toFixed(1).replace('.', ',')}%`,
      detalhe: KPIS_PAINEL_BI.variacaoConversao,
    },
    {
      titulo: 'Tempo Médio em Pátio',
      valor: `${KPIS_PAINEL_BI.tempoMedioPatioDias.toFixed(1).replace('.', ',')} dias`,
      detalhe: KPIS_PAINEL_BI.variacaoPatio,
    },
    {
      titulo: 'Ticket Médio',
      valor: formatarMoeda(KPIS_PAINEL_BI.ticketMedio),
      detalhe: KPIS_PAINEL_BI.variacaoTicket,
    },
  ];

  return (
    <Box
      component="main"
      className="area-impressao-bi"
      sx={{ ...ESTILO_FUNDO_LISTRAS, p: { xs: 2, sm: 3, md: 4 } }}
    >
      <style>{`
        @media print {
          .nao-imprimir {
            display: none !important;
          }
          body, .area-impressao-bi {
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

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
              Painel Executivo de BI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Indicadores comerciais, giro de pátio e exportação gerencial
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} className="nao-imprimir" flexWrap="wrap" useFlexGap>
            <Button variant="contained" onClick={handleExportarCsv}>
              Exportar CSV
            </Button>
            <Button variant="outlined" onClick={handleExportarPdf}>
              Exportar PDF
            </Button>
            <Button variant="outlined" color="inherit" onClick={voltar}>
              Voltar para Home
            </Button>
          </Stack>
        </Stack>


        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 2,
            mb: 3,
          }}
        >
          {cards.map((card) => (
            <Paper
              key={card.titulo}
              elevation={0}
              sx={{
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {card.titulo}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, my: 0.5 }}>
                {card.valor}
              </Typography>
              <Typography variant="caption" color="success.main">
                {card.detalhe}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
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
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Faturamento Mensal (R$)
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SERIE_MENSAL_BI}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDEE" />
                  <XAxis dataKey="mes" stroke="#65767C" />
                  <YAxis stroke="#65767C" />
                  <Tooltip
                    formatter={(valor) => formatarMoeda(valor)}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E3E9EB',
                      borderRadius: 10,
                      color: '#172A30',
                    }}
                    labelStyle={{ color: '#172A30' }}
                  />
                  <Legend />
                  <Bar dataKey="faturamento" name="Faturamento (R$)" fill="#176B70" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Taxa de Conversão de Test-drives (%)
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SERIE_MENSAL_BI}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EDEE" />
                  <XAxis dataKey="mes" stroke="#65767C" />
                  <YAxis stroke="#65767C" domain={[20, 45]} />
                  <Tooltip
                    formatter={(valor) => `${Number(valor).toFixed(1)}%`}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E3E9EB',
                      borderRadius: 10,
                      color: '#172A30',
                    }}
                    labelStyle={{ color: '#172A30' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="conversao"
                    name="Conversão (%)"
                    stroke="#23836D"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
