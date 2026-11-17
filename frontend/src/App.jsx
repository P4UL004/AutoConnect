import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { obterSessao } from './servicos/api';
import { perfilTemAcessoRota } from './atalhos';
import LayoutAutenticado from './componentes/LayoutAutenticado';
import Login from './paginas/Login';
import Home from './paginas/Home';
import CadastroCliente from './paginas/CadastroCliente';
import PaginaInventario from './paginas/inventario/PaginaInventario';
import PaginaTestDrive from './paginas/testdrive/PaginaTestDrive';
import PaginaOrdensServico from './paginas/ordemservico/PaginaOrdensServico';
import PrototipoGeofencing from './paginas/prototipos/PrototipoGeofencing';
import PrototipoCredito from './paginas/prototipos/PrototipoCredito';
import PrototipoDiagnostico from './paginas/prototipos/PrototipoDiagnostico';
import PrototipoOrcamentoRemoto from './paginas/prototipos/PrototipoOrcamentoRemoto';
import PrototipoEstoque from './paginas/prototipos/PrototipoEstoque';
import PrototipoHoras from './paginas/prototipos/PrototipoHoras';
import PrototipoPainelBI from './paginas/prototipos/PrototipoPainelBI';

function RotaProtegida({ sessao, children }) {
  const location = useLocation();
  const sessaoAtual = sessao || obterSessao();

  if (!sessaoAtual?.token) {
    return <Navigate to="/login" replace />;
  }

  if (!perfilTemAcessoRota(sessaoAtual.perfil, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return <LayoutAutenticado sessao={sessaoAtual}>{children}</LayoutAutenticado>;
}

function RotasAplicacao() {
  const navigate = useNavigate();
  const [sessao, setSessao] = useState(() => obterSessao());

  useEffect(() => {
    function sincronizarSessao() {
      setSessao(obterSessao());
    }

    function aoDeslogar() {
      setSessao(null);
      navigate('/login', { replace: true });
    }

    window.addEventListener('storage', sincronizarSessao);
    window.addEventListener('autoconnect:deslogar', aoDeslogar);

    return () => {
      window.removeEventListener('storage', sincronizarSessao);
      window.removeEventListener('autoconnect:deslogar', aoDeslogar);
    };
  }, [navigate]);

  function aoAutenticar(novaSessao) {
    setSessao(novaSessao || obterSessao());
    navigate('/', { replace: true });
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          sessao?.token ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLoginSucesso={aoAutenticar} />
          )
        }
      />

      <Route
        path="/cadastro"
        element={sessao?.token ? <Navigate to="/" replace /> : <CadastroCliente />}
      />

      <Route
        path="/"
        element={
          <RotaProtegida sessao={sessao}>
            <Home sessao={sessao} />
          </RotaProtegida>
        }
      />

      <Route
        path="/inventario"
        element={
          <RotaProtegida sessao={sessao}>
            <PaginaInventario sessao={sessao} />
          </RotaProtegida>
        }
      />

      <Route
        path="/test-drive"
        element={
          <RotaProtegida sessao={sessao}>
            <PaginaTestDrive sessao={sessao} />
          </RotaProtegida>
        }
      />

      <Route
        path="/ordens-servico"
        element={
          <RotaProtegida sessao={sessao}>
            <PaginaOrdensServico sessao={sessao} />
          </RotaProtegida>
        }
      />

      <Route
        path="/prototipos/geofencing"
        element={
          <RotaProtegida sessao={sessao}>
            <PrototipoGeofencing />
          </RotaProtegida>
        }
      />

      <Route
        path="/prototipos/credito"
        element={
          <RotaProtegida sessao={sessao}>
            <PrototipoCredito />
          </RotaProtegida>
        }
      />

      <Route
        path="/prototipos/diagnostico"
        element={
          <RotaProtegida sessao={sessao}>
            <PrototipoDiagnostico />
          </RotaProtegida>
        }
      />

      <Route
        path="/prototipos/orcamento-remoto"
        element={
          <RotaProtegida sessao={sessao}>
            <PrototipoOrcamentoRemoto />
          </RotaProtegida>
        }
      />

      <Route
        path="/prototipos/estoque"
        element={
          <RotaProtegida sessao={sessao}>
            <PrototipoEstoque />
          </RotaProtegida>
        }
      />

      <Route
        path="/prototipos/horas"
        element={
          <RotaProtegida sessao={sessao}>
            <PrototipoHoras />
          </RotaProtegida>
        }
      />

      <Route
        path="/prototipos/painel-bi"
        element={
          <RotaProtegida sessao={sessao}>
            <PrototipoPainelBI />
          </RotaProtegida>
        }
      />

      <Route path="*" element={<Navigate to={sessao?.token ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RotasAplicacao />
    </BrowserRouter>
  );
}
