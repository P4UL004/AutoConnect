import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  Stack,
  Typography,
} from '@mui/material';
import { limparSessao } from '../servicos/api';
import { obterAtalhosPorPerfil, obterIniciais, rotuloPerfil } from '../atalhos';
import Logo from './Logo';

const ICONES = {
  inicio: <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z" />,
  inventario: <path d="M3 9 12 4l9 5M5 10v10h14V10M8 14h8m-8 3h8" />,
  'test-drive': <path d="M4 13.5h16l-1.6-5a2 2 0 0 0-1.9-1.4H8.5a2 2 0 0 0-1.9 1.4L5 13.5m-1 0v5h2m12 0h2v-5m-16 0h16M7 18.5v2m10-2v2" />,
  'ordens-servico': <path d="M8 5h8l3 3v12H5V5h3Zm0 0v4h8V5m-8 8h8m-8 4h5" />,
  geofencing: <path d="M20 11c0 5-8 10-8 10S4 16 4 11a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,
  credito: <path d="M4 8h16v12H4zM4 12h16m-12 4h4m4-8V5" />,
  'diagnostico-obd': <path d="M12 4v4m0 8v4m8-8h-4M8 12H4m13.7-5.7-2.8 2.8m-5.8 5.8-2.8 2.8m11.4 0-2.8-2.8m-5.8-5.8L6.3 6.3M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />,
  'orcamento-remoto': <path d="M6 4h9l4 4v12H6zM14 4v5h5m-9 4h6m-6 4h6" />,
  'estoque-pecas': <path d="m12 4 8 4v9l-8 4-8-4V8l8-4Zm-8 4 8 4 8-4m-8 4v9m-4-15 8 4" />,
  'apontamento-horas': <path d="M12 4v2m0 12v2m8-8h-2M6 12H4m13.7-5.7-1.4 1.4m-8.6 8.6-1.4 1.4m11.4 0-1.4-1.4m-8.6-8.6L6.3 6.3M12 8v4l2.5 2" />,
  'painel-bi': <path d="M5 19V9m7 10V5m7 14v-7M3 19h18" />,
};

function IconeMenu({ id, selecionado = false }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'grid',
        placeItems: 'center',
        color: selecionado ? 'common.white' : 'rgba(222, 234, 239, 0.72)',
      }}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {ICONES[id] || <circle cx="12" cy="12" r="8" />}
      </svg>
    </Box>
  );
}

function ConteudoSidebar({ sessao, caminho, navegar, sair, recolher }) {
  const atalhos = obterAtalhosPorPerfil(sessao?.perfil);
  const primeiroNome = sessao?.nome?.trim().split(/\s+/)[0] || 'Usuário';

  function selecionar(rota) {
    navegar(rota);
    if (recolher) recolher();
  }

  function itemMenu(rota, id, titulo, prototipo = false) {
    const selecionado = caminho === rota;
    return (
      <ListItemButton
        key={rota}
        selected={selecionado}
        onClick={() => selecionar(rota)}
        aria-current={selecionado ? 'page' : undefined}
        sx={{
          minHeight: 46,
          px: 1.75,
          borderRadius: 1.5,
          color: selecionado ? 'common.white' : 'rgba(238, 244, 246, 0.82)',
          '&.Mui-selected': {
            color: 'common.white',
            bgcolor: 'primary.main',
          },
          '&.Mui-selected:hover': { bgcolor: 'primary.dark' },
          '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            noWrap
            sx={{ fontSize: 14, fontWeight: selecionado ? 600 : 500 }}
          >
            {titulo}
          </Typography>
        </Box>
        {prototipo && (
          <Chip
            label="Demo"
            size="small"
            sx={{
              height: 19,
              mr: 1,
              color: 'rgba(238,244,246,.75)',
              bgcolor: 'rgba(255,255,255,.09)',
              fontSize: 10,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        )}
        <IconeMenu id={id} selecionado={selecionado} />
      </ListItemButton>
    );
  }

  return (
    <Box
      component="aside"
      aria-label="Navegação principal"
      sx={{
        width: 264,
        height: '100vh',
        minHeight: 540,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#293642',
        color: 'common.white',
        px: 1.5,
        py: 2,
      }}
    >
      <Box sx={{ px: 1, pt: 0.5, pb: 3 }}>
        <Logo compact color="#FFFFFF" />
      </Box>

      <Typography
        variant="overline"
        sx={{
          px: 1.75,
          mb: 0.75,
          color: 'rgba(207, 220, 226, 0.58)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.14em',
        }}
      >
        MENU PRINCIPAL
      </Typography>

      <Box component="nav" aria-label="Módulos" sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <List disablePadding sx={{ display: 'grid', gap: 0.4 }}>
          {itemMenu('/', 'inicio', 'Visão geral')}
          {atalhos.length > 0 && (
            <Divider sx={{ my: 1.2, borderColor: 'rgba(255,255,255,0.12)' }} />
          )}
          {atalhos.map((item) =>
            itemMenu(item.rota, item.id, item.titulo, item.prototipo)
          )}
        </List>
      </Box>

      <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.12)' }} />
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ px: 1, py: 1, alignItems: 'center' }}
      >
        <Avatar
          aria-label={`Iniciais de ${primeiroNome}`}
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'rgba(255,255,255,0.12)',
            color: 'common.white',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {obterIniciais(sessao?.nome)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'common.white' }}>
            {primeiroNome}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{ display: 'block', color: 'rgba(222,234,239,.65)' }}
          >
            {rotuloPerfil(sessao?.perfil)}
          </Typography>
        </Box>
      </Stack>
      <Button
        onClick={sair}
        variant="text"
        color="inherit"
        sx={{
          justifyContent: 'flex-start',
          minHeight: 42,
          px: 1.75,
          color: 'rgba(238,244,246,.76)',
          '&:hover': { bgcolor: 'rgba(255,255,255,.08)' },
        }}
      >
        Sair
      </Button>
    </Box>
  );
}

export default function LayoutAutenticado({ sessao, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  function sair() {
    limparSessao();
    navigate('/login', { replace: true });
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default',
      }}
    >
      <Box
        component="header"
        sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center',
          gap: 1.5,
          minHeight: 58,
          px: 1.5,
          bgcolor: '#293642',
          color: 'common.white',
        }}
      >
        <IconButton
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          sx={{ color: 'common.white' }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </IconButton>
        <Logo compact color="#FFFFFF" />
      </Box>

      <Drawer
        anchor="left"
        open={menuAberto}
        onClose={() => setMenuAberto(false)}
        slotProps={{ paper: { sx: { bgcolor: '#293642' } } }}
      >
        <ConteudoSidebar
          sessao={sessao}
          caminho={location.pathname}
          navegar={navigate}
          sair={sair}
          recolher={() => setMenuAberto(false)}
        />
      </Drawer>

      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          zIndex: 2,
        }}
      >
        <ConteudoSidebar
          sessao={sessao}
          caminho={location.pathname}
          navegar={navigate}
          sair={sair}
        />
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
}
