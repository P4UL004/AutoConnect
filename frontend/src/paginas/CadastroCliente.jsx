import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Logo from '../componentes/Logo';
import { api, extrairMensagemErro } from '../servicos/api';

// Validacao de CPF e CNPJ (digitos verificadores). O servidor valida de novo.
function somenteDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

function todosIguais(digitos) {
  return new Set(digitos.split('')).size === 1;
}

function cpfValido(valor) {
  const d = somenteDigitos(valor);
  if (d.length !== 11 || todosIguais(d)) return false;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i += 1) {
      soma += Number(d[i]) * (tamanho + 1 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== Number(d[tamanho])) return false;
  }
  return true;
}

function cnpjValido(valor) {
  const d = somenteDigitos(valor);
  if (d.length !== 14 || todosIguais(d)) return false;
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digito = (pesos) => {
    let soma = 0;
    for (let i = 0; i < pesos.length; i += 1) {
      soma += Number(d[i]) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(pesos1) === Number(d[12]) && digito(pesos2) === Number(d[13]);
}

const estadoInicial = {
  nome: '',
  email: '',
  documento: '',
  telefone: '',
  senha: '',
  confirmarSenha: '',
};

export default function CadastroCliente() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState('PF');
  const [campos, setCampos] = useState(estadoInicial);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const ehPf = tipo === 'PF';

  function alterar(campo) {
    return (evento) => setCampos((anterior) => ({ ...anterior, [campo]: evento.target.value }));
  }

  function validar() {
    const novos = {};
    if (!campos.nome.trim()) {
      novos.nome = ehPf ? 'Informe o nome.' : 'Informe a razão social.';
    }
    if (!/^\S+@\S+\.\S+$/.test(campos.email)) {
      novos.email = 'Informe um e-mail válido.';
    }
    if (ehPf && !cpfValido(campos.documento)) {
      novos.documento = 'CPF inválido.';
    }
    if (!ehPf && !cnpjValido(campos.documento)) {
      novos.documento = 'CNPJ inválido.';
    }
    const tel = somenteDigitos(campos.telefone);
    if (tel && (tel.length < 10 || tel.length > 11)) {
      novos.telefone = 'Telefone inválido (DDD + número).';
    }
    if (campos.senha.length < 8) {
      novos.senha = 'A senha deve ter no mínimo 8 caracteres.';
    }
    if (campos.confirmarSenha !== campos.senha) {
      novos.confirmarSenha = 'As senhas não conferem.';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral('');
    if (!validar()) return;

    setEnviando(true);
    try {
      await api.post('/api/auth/cadastro', {
        nome: campos.nome.trim(),
        email: campos.email.trim(),
        senha: campos.senha,
        tipoPessoa: tipo,
        documento: somenteDigitos(campos.documento),
        telefone: somenteDigitos(campos.telefone),
      });
      navigate('/login', {
        replace: true,
        state: { mensagem: 'Cadastro realizado com sucesso. Entre com seu e-mail e senha.' },
      });
    } catch (erro) {
      setErroGeral(extrairMensagemErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Box sx={{ position: 'absolute', top: 12, left: { xs: 16, sm: 32 } }}>
        <Logo />
      </Box>

      <Box
        component="form"
        onSubmit={enviar}
        noValidate
        sx={{ width: '100%', maxWidth: 420, display: 'grid', gap: 2, mt: 6 }}
      >
        <Typography component="h1" sx={{ fontSize: 20 }}>
          Criar conta
        </Typography>

        {erroGeral && (
          <Alert severity="error" variant="outlined" role="alert">
            {erroGeral}
          </Alert>
        )}

        <ToggleButtonGroup
          exclusive
          fullWidth
          value={tipo}
          onChange={(_, novo) => {
            if (novo) {
              setTipo(novo);
              setErros({});
            }
          }}
          aria-label="Tipo de pessoa"
        >
          <ToggleButton value="PF">Pessoa física</ToggleButton>
          <ToggleButton value="PJ">Pessoa jurídica</ToggleButton>
        </ToggleButtonGroup>

        <TextField
          label={ehPf ? 'Nome completo' : 'Razão social'}
          value={campos.nome}
          onChange={alterar('nome')}
          error={!!erros.nome}
          helperText={erros.nome}
          autoComplete="name"
        />
        <TextField
          label={ehPf ? 'CPF' : 'CNPJ'}
          value={campos.documento}
          onChange={alterar('documento')}
          error={!!erros.documento}
          helperText={erros.documento || 'Somente números'}
          inputProps={{ inputMode: 'numeric', maxLength: ehPf ? 14 : 18 }}
        />
        <TextField
          label="E-mail"
          type="email"
          value={campos.email}
          onChange={alterar('email')}
          error={!!erros.email}
          helperText={erros.email}
          autoComplete="email"
        />
        <TextField
          label="Telefone (opcional)"
          value={campos.telefone}
          onChange={alterar('telefone')}
          error={!!erros.telefone}
          helperText={erros.telefone || 'DDD + número'}
          inputProps={{ inputMode: 'tel' }}
        />
        <TextField
          label="Senha"
          type="password"
          value={campos.senha}
          onChange={alterar('senha')}
          error={!!erros.senha}
          helperText={erros.senha || 'Mínimo de 8 caracteres'}
          autoComplete="new-password"
        />
        <TextField
          label="Confirmar senha"
          type="password"
          value={campos.confirmarSenha}
          onChange={alterar('confirmarSenha')}
          error={!!erros.confirmarSenha}
          helperText={erros.confirmarSenha}
          autoComplete="new-password"
        />

        <Button type="submit" variant="contained" disabled={enviando} sx={{ py: 1.4 }}>
          {enviando ? 'Enviando...' : 'Cadastrar'}
        </Button>
        <Button component={RouterLink} to="/login" sx={{ textTransform: 'none' }}>
          Voltar ao login
        </Button>
      </Box>
    </Box>
  );
}
