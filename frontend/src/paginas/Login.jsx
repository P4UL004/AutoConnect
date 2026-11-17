import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import Logo from '../componentes/Logo';
import { api, guardarSessao } from '../servicos/api';

export default function Login({ onLoginSucesso }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);
  const location = useLocation();
  const mensagemSucesso = location.state?.mensagem || '';

  function validar() {
    const emailValido = /^\S+@\S+\.\S+$/.test(email);
    setErroEmail(emailValido ? '' : 'Informe um e-mail válido');
    setErroSenha(senha ? '' : 'Informe a senha');
    return emailValido && senha !== '';
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral('');
    if (!validar()) return;

    setCarregando(true);
    try {
      const resposta = await api.post('/api/auth/login', { email, senha });
      const { token, nome, perfil } = resposta.data;
      guardarSessao({ token, nome, perfil });
      if (onLoginSucesso) {
        onLoginSucesso({ token, nome, perfil });
      }
    } catch (erro) {
      if (erro.response) {
        const mensagemServidor =
          erro.response.data?.mensagem ||
          (erro.response.status === 401
            ? 'E-mail ou senha inválidos'
            : 'Erro ao conectar ao servidor');
        setErroGeral(mensagemServidor);
      } else {
        setErroGeral('Não foi possível conectar ao servidor');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: { xs: 1.5, sm: 3 },
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 1000,
          minHeight: { xs: 'auto', md: 600 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: { xs: 3, md: 4 },
          boxShadow: '0 24px 70px rgba(27, 55, 60, 0.09)',
        }}
      >
        <Box
          component="aside"
          sx={{
            minHeight: { xs: 170, md: 'auto' },
            p: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#FFFFFF',
            background:
              'radial-gradient(ellipse at 82% 72%, rgba(80, 175, 166, .30), transparent 38%), linear-gradient(145deg, #12363B 0%, #176B70 100%)',
          }}
        >
          <Logo color="#FFFFFF" />
          <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 10, maxWidth: 340 }}>
            <Typography
              component="h2"
              sx={{ fontSize: 36, lineHeight: 1.15, fontWeight: 600, letterSpacing: '-0.04em' }}
            >
              Mobilidade e gestão, em um só lugar.
            </Typography>
            <Typography sx={{ mt: 2, color: 'rgba(255,255,255,.75)', lineHeight: 1.7 }}>
              Acesse o seu perfil.
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{ display: { xs: 'none', md: 'block' }, color: 'rgba(255,255,255,.58)' }}
          >
            AutoConnect · Plataforma de gestão automotiva
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            alignContent: 'center',
            p: { xs: 3, sm: 5, md: 7 },
          }}
        >
          <Box component="form" onSubmit={enviar} noValidate sx={{ width: '100%', maxWidth: 380, mx: 'auto' }}>
            <Typography
              component="h1"
              sx={{ color: 'text.primary', fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em' }}
            >
              Acesse sua conta
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3.5 }}>
              Informe seus dados para continuar.
            </Typography>

            {mensagemSucesso && !erroGeral && (
              <Alert severity="success" variant="outlined" role="status" sx={{ mb: 2 }}>
                {mensagemSucesso}
              </Alert>
            )}
            {erroGeral && (
              <Alert severity="error" variant="outlined" role="alert" sx={{ mb: 2 }}>
                {erroGeral}
              </Alert>
            )}

            <Box sx={{ display: 'grid', gap: 2.25 }}>
              <TextField
                id="email"
                label="E-mail"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!erroEmail}
                helperText={erroEmail}
                fullWidth
              />
              <TextField
                id="senha"
                label="Senha"
                type="password"
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                error={!!erroSenha}
                helperText={erroSenha}
                fullWidth
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={carregando}
              sx={{ py: 1.35, mt: 3, fontSize: 15 }}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2.5, textAlign: 'center' }}
            >
              Ainda não tem uma conta?{' '}
              <Button
                component={RouterLink}
                to="/cadastro"
                variant="text"
                sx={{ p: 0, minWidth: 'auto', verticalAlign: 'baseline' }}
              >
                Criar conta
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
