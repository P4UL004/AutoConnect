import { Box, Paper, Typography } from '@mui/material';
import { obterSessao } from '../servicos/api';
import { normalizarPerfil } from '../atalhos';

// Mantido como export compartilhado pelos protótipos.
// eslint-disable-next-line react-refresh/only-export-components
export const ESTILO_FUNDO_LISTRAS = {
  minHeight: '100vh',
  backgroundColor: '#F4F7F8',
  backgroundImage:
    'radial-gradient(rgba(23, 107, 112, 0.045) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

const MENSAGENS_POR_PERFIL = {
  ADMINISTRADOR: {
    resumo: 'Acompanhe as frentes de vendas e oficina e tenha os indicadores da operação à mão.',
    titulo: 'Visão da concessionária',
    descricao:
      'Gerencie inventário, atendimentos e ordens de serviço, além de acompanhar indicadores e ferramentas operacionais.',
  },
  CONSULTOR_VENDAS: {
    resumo: 'Tenha o estoque e os atendimentos de vendas sempre à mão.',
    titulo: 'Vendas em andamento',
    descricao:
      'Consulte veículos disponíveis, agende test-drives e explore os recursos de crédito e geolocalização.',
  },
  CONSULTOR_TECNICO: {
    resumo: 'Organize o fluxo da oficina e acompanhe os serviços em execução.',
    titulo: 'Operação da oficina',
    descricao:
      'Acesse ordens de serviço, diagnósticos, estoque de peças e apontamento de horas para acompanhar cada etapa do atendimento.',
  },
  CLIENTE: {
    resumo: 'Acompanhe seus veículos e serviços sem perder nenhum detalhe.',
    titulo: 'Seus atendimentos',
    descricao:
      'Consulte suas ordens de serviço e test-drives, acompanhe os orçamentos e simule opções de crédito.',
  },
};

export default function Home({ sessao: sessaoProp }) {
  const sessao = sessaoProp || obterSessao();
  const nome = sessao?.nome || 'Usuário';
  const primeiroNome = nome.trim().split(/\s+/)[0];
  const mensagem = MENSAGENS_POR_PERFIL[normalizarPerfil(sessao?.perfil)] || {
    resumo: 'Acesse os recursos disponíveis para o seu perfil.',
    titulo: 'Seu espaço de trabalho',
    descricao: 'Escolha um módulo no menu lateral para começar.',
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        px: { xs: 2.5, sm: 4, lg: 6 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
        <Box component="section" aria-labelledby="saudacao-titulo" sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}
          >
            ESPAÇO DE TRABALHO
          </Typography>
          <Typography
            id="saudacao-titulo"
            component="h1"
            sx={{
              mt: 0.5,
              mb: 1,
              color: 'text.primary',
              fontSize: { xs: 30, sm: 38 },
              lineHeight: 1.15,
            }}
          >
            Olá, {primeiroNome}
          </Typography>
          <Typography color="text.secondary">{mensagem.resumo}</Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            minHeight: 250,
            p: { xs: 3, sm: 5 },
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 52,
              height: 52,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              borderRadius: 2,
              bgcolor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 10 12 4l8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z" />
            </svg>
          </Box>
          <Box>
            <Typography
              component="h2"
              sx={{ color: 'text.primary', fontSize: 18, fontWeight: 700 }}
            >
              {mensagem.titulo}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 520, lineHeight: 1.65 }}>
              {mensagem.descricao}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
