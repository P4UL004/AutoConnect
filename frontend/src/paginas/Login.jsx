import { useState } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import Logo from '../componentes/Logo';
import api from '../servicos/api';


const fundoDiagonal = `linear-gradient(45deg,
  #2A3040 0%, #2A3040 14.3%,
  #000 14.3%, #000 14.7%,
  #2F3652 14.7%, #2F3652 37.8%,
  #000 37.8%, #000 38.2%,
  #1A1C26 38.2%, #1A1C26 61.7%,
  #000 61.7%, #000 62.1%,
  #1A1C26 62.1%, #1A1C26 85.2%,
  #000 85.2%, #000 85.6%,
  #000 85.6%, #000 100%)`;

// Estilo dos campos: fundo preto, borda clara, cantos retos
const estiloCampo = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#000',
    color: '#FFF',
    '& fieldset': { borderColor: '#C9CCD6' },
    '&:hover fieldset': { borderColor: '#FFF' },
    '&.Mui-focused fieldset': { borderColor: '#FFF', borderWidth: 2 },
  },
  '& input': { padding: '15px 16px', fontSize: 14 },
  '& input::placeholder': { color: '#B8BFD1', opacity: 1 },
};

// Estilo dos rótulos (EMAIL, SENHA): pequenos, em maiúsculas e com letras espaçadas
const estiloRotulo = {
  fontSize: 12,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};


export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);

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
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify({ nome, perfil }));
    alert(`Bem-vindo, ${nome}! Perfil: ${perfil}`); // depois vira redirecionamento
  } catch (erro) {
    if (erro.response?.status === 401) {
      setErroGeral('E-mail ou senha inválidos');
    } else if (!erro.response) {
      setErroGeral('Não foi possível conectar ao servidor');
    } else {
      setErroGeral('Erro inesperado. Tente novamente');
    }
  } finally {
    setCarregando(false);
  }
}

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center',
               p: 2, position: 'relative', background: fundoDiagonal }}>

      {/* Logo fixo no canto superior esquerdo */}
      <Box component="header" sx={{ position: 'absolute', top: 12, left: { xs: 16, sm: 32 } }}>
        <Logo />
      </Box>

      <Box component="form" onSubmit={enviar} noValidate
           sx={{ width: '100%', maxWidth: 300, display: 'grid', gap: 2 }}>

        <Typography component="h1"
                    sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: 20 }}>
          Entre na sua conta
        </Typography>

        {erroGeral && <Alert severity="error" variant="outlined">{erroGeral}</Alert>}

        {/* O rótulo fica fora do campo. O htmlFor liga o rótulo ao campo com o mesmo
            id, então clicar no texto foca o campo e leitores de tela anunciam certo. */}
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography component="label" htmlFor="email" sx={estiloRotulo}>Email</Typography>
          <TextField id="email" type="email" autoComplete="email"
                     placeholder="email@olamundo.com"
                     value={email} onChange={(e) => setEmail(e.target.value)}
                     error={!!erroEmail} helperText={erroEmail} sx={estiloCampo} />
        </Box>

        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography component="label" htmlFor="senha" sx={estiloRotulo}>Senha</Typography>
          <TextField id="senha" type="password" autoComplete="current-password"
                     placeholder="******"
                     value={senha} onChange={(e) => setSenha(e.target.value)}
                     error={!!erroSenha} helperText={erroSenha} sx={estiloCampo} />
        </Box>

        <Button type="submit" variant="contained" disabled={carregando}
                sx={{ justifySelf: 'center', width: 170, py: 1.5, mt: 1,
                      backgroundColor: '#FFF', color: '#000',
                      fontWeight: 600, textTransform: 'none',
                      '&:hover': { backgroundColor: '#E6E8EF' },
                      '&.Mui-disabled': { backgroundColor: '#B8BFD1', color: '#000' } }}>
          {carregando ? 'Entrando...' : 'log in'}
        </Button>
      </Box>
    </Box>
  );
}