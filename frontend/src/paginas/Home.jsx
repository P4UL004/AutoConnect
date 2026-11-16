import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Tooltip,
  Divider,
  List,
  ListItemButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { limparSessao, obterSessao } from '../servicos/api';
import { obterAtalhosPorPerfil, obterIniciais, rotuloPerfil } from '../atalhos';
// eslint-disable-next-line react-refresh/only-export-components
export const ESTILO_FUNDO_LISTRAS = {
  minHeight: '100vh',
  backgroundColor: 'background.default',
  backgroundImage:
    'repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.025) 0px, rgba(255, 255, 255, 0.025) 12px, transparent 12px, transparent 24px)',
};

export default function Home({ sessao: sessaoProp, onDeslogar }) {
  const navigate = useNavigate();
  const sessao = sessaoProp || obterSessao();
  const nome = sessao?.nome || 'Usuário';
  const perfil = sessao?.perfil || '';
  const atalhos = obterAtalhosPorPerfil(perfil);

  function handleSair() {
    limparSessao();
    if (typeof onDeslogar === 'function') {
      onDeslogar();
    }
    navigate('/login', { replace: true });
  }

  return (
    <Box
      component="main"
      sx={{
        ...ESTILO_FUNDO_LISTRAS,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 980,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '290px 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={2.5} alignItems="center" textAlign="center">
            <Avatar
              aria-label={`Iniciais de ${nome}`}
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 600,
                fontSize: '1.35rem',
              }}
            >
              {obterIniciais(nome)}
            </Avatar>

            <Box>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
                {nome}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {rotuloPerfil(perfil)}
              </Typography>
            </Box>

            <Divider flexItem />

            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={handleSair}
              aria-label="Sair da sessão"
            >
              Sair
            </Button>
          </Stack>
        </Paper>

        <Paper
          component="nav"
          aria-label="Atalhos disponíveis"
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            maxHeight: { md: 'calc(100vh - 96px)' },
            overflowY: 'auto',
          }}
        >
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
              Módulos e Atalhos
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Selecione uma opção abaixo para continuar ({atalhos.length}{' '}
              {atalhos.length === 1 ? 'disponível' : 'disponíveis'})
            </Typography>
          </Box>

          {atalhos.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum atalho disponível para o perfil atual.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {atalhos.map((item, indice) => (
                <Fragment key={item.id}>
                  <ListItemButton
                    onClick={() => navigate(item.rota)}
                    sx={{
                      px: 3,
                      py: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 0.5,
                      '&:hover': {
                        bgcolor: 'rgba(58, 84, 156, 0.16)',
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.titulo}
                      </Typography>
                      {item.prototipo && (
                        <Tooltip title="Protótipo com dados simulados" arrow>
                          <Typography
                            component="span"
                            variant="subtitle1"
                            color="text.secondary"
                            sx={{ fontWeight: 600, ml: -0.75 }}
                          >
                            *
                          </Typography>
                        </Tooltip>
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {item.descricao}
                    </Typography>
                  </ListItemButton>
                  {indice < atalhos.length - 1 && <Divider />}
                </Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
