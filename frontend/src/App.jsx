import { useState, useEffect } from 'react';
import Login from './paginas/Login';
import Home from './paginas/Home';
import PaginaInventario from './paginas/inventario/PaginaInventario';
import PaginaTestDrive from './paginas/testdrive/PaginaTestDrive';
import { obterSessao, limparSessao } from './servicos/api';

export default function App() {
  const [sessao, setSessao] = useState(() => obterSessao());
  const [telaAtual, setTelaAtual] = useState(null);

  useEffect(() => {
    function tratarDeslogar() {
      setSessao(null);
      setTelaAtual(null);
    }

    window.addEventListener('autoconnect:deslogar', tratarDeslogar);
    return () => {
      window.removeEventListener('autoconnect:deslogar', tratarDeslogar);
    };
  }, []);

  function handleLogout() {
    limparSessao();
    setSessao(null);
    setTelaAtual(null);
  }

  function handleLoginSucesso(dados) {
    setSessao(dados);
  }

  if (sessao) {
    if (telaAtual === 'inventario') {
      return (
        <PaginaInventario
          sessao={sessao}
          onVoltar={() => setTelaAtual(null)}
        />
      );
    }

    if (telaAtual === 'test-drive') {
      return (
        <PaginaTestDrive
          sessao={sessao}
          onVoltar={() => setTelaAtual(null)}
        />
      );
    }

    return (
      <Home
        sessao={sessao}
        onLogout={handleLogout}
        onAbrirTela={(id) => setTelaAtual(id)}
      />
    );
  }

  return <Login onLoginSucesso={handleLoginSucesso} />;
}
