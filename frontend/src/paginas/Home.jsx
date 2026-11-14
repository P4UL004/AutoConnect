import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Snackbar,
} from '@mui/material';
import Logo from '../componentes/Logo';
import { api, limparSessao } from '../servicos/api';

const NOMES_PERFIS = {
  ADMINISTRADOR: 'Administrador',
  CONSULTOR_VENDAS: 'Consultor de Vendas',
  CONSULTOR_TECNICO: 'Consultor Técnico',
  CLIENTE: 'Cliente',
};

function obterAtalhosPorPerfil(perfil) {
  switch (perfil) {
    case 'ADMINISTRADOR':
      return [
        {
          id: 'inventario',
          titulo: 'Inventário',
          descricao: 'Controle e gestão do catálogo de veículos.',
        },
        {
          id: 'test-drive',
          titulo: 'Test-Drive',
          descricao: 'Agendamento e acompanhamento de test-drives.',
        },
        {
          id: 'os',
          titulo: 'Ordens de Serviço',
          descricao: 'Gestão e acompanhamento das ordens de serviço.',
        },
      ];
    case 'CONSULTOR_VENDAS':
      return [
        {
          id: 'inventario',
          titulo: 'Inventário',
          descricao: 'Cadastro, fotos e ativação de veículos.',
        },
        {
          id: 'test-drive',
          titulo: 'Test-Drive',
          descricao: 'Agendamento de test-drives para clientes.',
        },
      ];
    case 'CONSULTOR_TECNICO':
      return [
        {
          id: 'os',
          titulo: 'Ordens de Serviço',
          descricao: 'Abertura, orçamento, execução e qualidade das ordens de serviço.',
        },
      ];
    case 'CLIENTE':
      return [
        {
          id: 'test-drive',
          titulo: 'Test-Drive',
          descricao: 'Agendamento e consulta dos seus test-drives.',
        },
        {
          id: 'os',
          titulo: 'Ordens de Serviço (somente as suas)',
          descricao: 'Consulta e aprovação dos seus serviços e orçamentos.',
        },
      ];
    default:
      return [];
  }
}

export default function Home({ sessao, onLogout, onAbrirTela }) {
  const [perfilServidor, setPerfilServidor] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [avisoDesenvolvimento, setAvisoDesenvolvimento] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function buscarPerfil() {
      try {
        const resposta = await api.get('/api/me');
        if (ativo) {
          setPerfilServidor(resposta.data.perfil);
          setCarregando(false);
        }
      } catch (err) {
        if (!ativo) return;

        if (err.response?.status === 401) {
          limparSessao();
          if (onLogout) onLogout();
        } else {
          setErro('Não foi possível verificar suas permissões no servidor.');
          setCarregando(false);
        }
      }
    }

    buscarPerfil();

    return () => {
      ativo = false;
    };
  }, [onLogout]);

  const nomeUsuario = sessao?.nome || 'Usuário';
  const perfilFormatado = perfilServidor
    ? NOMES_PERFIS[perfilServidor] || perfilServidor
    : '';
  const atalhos = perfilServidor ? obterAtalhosPorPerfil(perfilServidor) : [];

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
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Logo />

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 500 }}>
              Olá, <strong>{nomeUsuario}</strong>
            </Typography>

            {perfilFormatado && (
              <Chip
                label={perfilFormatado}
                size="small"
                sx={{
                  backgroundColor: 'primary.main',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  borderRadius: 0,
                  fontSize: '0.75rem',
                }}
              />
            )}

            <Button
              variant="outlined"
              onClick={onLogout}
              sx={{
                color: '#FFFFFF',
                borderColor: '#C9CCD6',
                borderRadius: 0,
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                '&:hover': {
                  borderColor: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              Sair
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Conteúdo principal */}
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flex: 1,
          py: { xs: 3, sm: 5 },
          px: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {carregando ? (
          <Box
            role="status"
            aria-live="polite"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 250,
              gap: 2,
            }}
          >
            <CircularProgress color="primary" />
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Carregando dados da sessão...
            </Typography>
          </Box>
        ) : erro ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 250,
              gap: 2,
            }}
          >
            <Typography variant="body1" sx={{ color: 'error.main' }}>
              {erro}
            </Typography>
            <Button
              variant="outlined"
              onClick={onLogout}
              sx={{
                color: '#FFFFFF',
                borderColor: '#C9CCD6',
                borderRadius: 0,
                textTransform: 'none',
              }}
            >
              Voltar ao login
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography
                component="h1"
                variant="h5"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}
              >
                Atalhos do Sistema
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Módulos disponíveis para o perfil {perfilFormatado}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {atalhos.map((atalho) => {
                const disponivel = atalho.id === 'inventario' || atalho.id === 'test-drive';
                return (
                  <Card
                    key={atalho.id}
                    variant="outlined"
                    sx={{
                      backgroundColor: 'background.paper',
                      borderColor: 'divider',
                      borderRadius: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 180,
                      p: 2.5,
                    }}
                  >
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                      <Box sx={{ mb: 2 }}>
                        {disponivel ? (
                          <Chip
                            label="Disponível"
                            size="small"
                            sx={{
                              borderRadius: 0,
                              border: '1px solid #2E7D32',
                              color: '#FFFFFF',
                              backgroundColor: '#2E7D32',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <Chip
                            label="Em desenvolvimento"
                            size="small"
                            sx={{
                              borderRadius: 0,
                              border: '1px solid #78909C',
                              color: '#FFFFFF',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        component="h2"
                        variant="h6"
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.125rem' },
                          mb: 1,
                        }}
                      >
                        {atalho.titulo}
                      </Typography>

                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                        {atalho.descricao}
                      </Typography>
                    </CardContent>

                    <Box sx={{ mt: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          if (disponivel) {
                            if (onAbrirTela) onAbrirTela(atalho.id);
                          } else {
                            setAvisoDesenvolvimento(true);
                          }
                        }}
                        sx={{
                          borderRadius: 0,
                          textTransform: 'none',
                          fontWeight: 600,
                          ...(disponivel
                            ? {
                                backgroundColor: '#FFFFFF',
                                color: '#000000',
                                '&:hover': { backgroundColor: '#E6E8EF' },
                              }
                            : {
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                color: '#B8BFD1',
                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                              }),
                        }}
                      >
                        Acessar
                      </Button>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        )}
      </Container>

      {/* Notificação para módulos em desenvolvimento */}
      <Snackbar
        open={avisoDesenvolvimento}
        autoHideDuration={3000}
        onClose={() => setAvisoDesenvolvimento(false)}
        message="Módulo em desenvolvimento."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
