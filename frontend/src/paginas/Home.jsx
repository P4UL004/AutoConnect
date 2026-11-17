import { Box, Typography } from '@mui/material';
import { obterSessao } from '../servicos/api';

// Mantido como export compartilhado pelos protótipos.
// eslint-disable-next-line react-refresh/only-export-components
export const ESTILO_FUNDO_LISTRAS = {
  minHeight: '100vh',
  backgroundColor: '#F4F7F8',
  backgroundImage:
    'radial-gradient(rgba(23, 107, 112, 0.045) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
};

export default function Home({ sessao: sessaoProp }) {
  const sessao = sessaoProp || obterSessao();
  const nome = sessao?.nome?.trim() || 'Usuário';

  return (
    <Box
      component="main"
      sx={{
        minHeight: { xs: 'calc(100vh - 58px)', md: '100vh' },
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2.5, sm: 4, lg: 6 },
        py: 4,
        bgcolor: 'background.default',
      }}
    >
      <Typography
        component="h1"
        sx={{
          maxWidth: 900,
          color: 'text.primary',
          textAlign: 'center',
          fontSize: { xs: 26, sm: 34, lg: 40 },
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: '-0.035em',
        }}
      >
        Bem-vindo, {nome}! Com o que precisa de ajuda hoje?
      </Typography>
    </Box>
  );
}
