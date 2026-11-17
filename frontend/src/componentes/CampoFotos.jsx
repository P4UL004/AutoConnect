import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { api, extrairMensagemErro } from '../servicos/api';

export default function CampoFotos({ urlBase, minimo = 2, maximo = 10, editavel = true, aoMudar }) {
  const [fotos, setFotos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [historicoEnvios, setHistoricoEnvios] = useState([]);
  const [versao, setVersao] = useState(0);
  const inputArquivoRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    if (!urlBase) {
      return;
    }

    api.get(urlBase)
      .then((resposta) => {
        if (ativo) {
          setFotos(resposta.data);
          setCarregando(false);
        }
      })
      .catch(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [urlBase, versao]);

  async function handleSelecionarArquivos(evento) {
    const arquivos = Array.from(evento.target.files || []);
    if (arquivos.length === 0) return;

    setEnviando(true);
    const novosStatus = [];

    // Envio foto a foto, sequencialmente
    for (const arquivo of arquivos) {
      const inicio = performance.now();
      const formData = new FormData();
      formData.append('arquivo', arquivo);

      try {
        await api.post(urlBase, formData);
        const fim = performance.now();
        const tempoSegundos = ((fim - inicio) / 1000).toFixed(1) + 's';

        novosStatus.push({
          id: Math.random().toString(),
          nome: arquivo.name,
          sucesso: true,
          tempo: tempoSegundos,
          mensagem: `Enviada com sucesso (${tempoSegundos})`,
        });
      } catch (erro) {
        const fim = performance.now();
        const tempoSegundos = ((fim - inicio) / 1000).toFixed(1) + 's';
        const motivo = extrairMensagemErro(erro);

        novosStatus.push({
          id: Math.random().toString(),
          nome: arquivo.name,
          sucesso: false,
          tempo: tempoSegundos,
          mensagem: motivo,
        });
      }
    }

    setHistoricoEnvios((anterior) => [...novosStatus, ...anterior]);
    setEnviando(false);

    // Reseta o input para permitir selecionar os mesmos arquivos novamente se desejar
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = '';
    }

    setVersao((v) => v + 1);
    if (aoMudar) {
      aoMudar();
    }
  }

  async function handleRemoverFoto(fotoId) {
    if (!editavel) return;

    try {
      await api.delete(`${urlBase}/${fotoId}`);
      setVersao((v) => v + 1);
      if (aoMudar) {
        aoMudar();
      }
    } catch (erro) {
      const motivo = extrairMensagemErro(erro);
      setHistoricoEnvios((anterior) => [
        {
          id: Math.random().toString(),
          nome: `Foto #${fotoId}`,
          sucesso: false,
          mensagem: `Erro ao remover: ${motivo}`,
        },
        ...anterior,
      ]);
    }
  }

  const limiteAtingido = fotos.length >= maximo;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Contador de fotos */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Fotos do veículo:{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            {fotos.length} de {maximo} fotos (mínimo {minimo})
          </Box>
        </Typography>

        {editavel && (
          <Box>
            <input
              ref={inputArquivoRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              id="input-fotos-veiculo"
              onChange={handleSelecionarArquivos}
              disabled={limiteAtingido || enviando}
            />
            <label htmlFor="input-fotos-veiculo">
              <Button
                variant="outlined"
                component="span"
                disabled={limiteAtingido || enviando}
                sx={{
                  borderColor: 'divider',
                  color: 'primary.main',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                {enviando ? 'Enviando foto(s)...' : 'Selecionar fotos'}
              </Button>
            </label>
          </Box>
        )}
      </Box>

      {/* Grid de Miniaturas */}
      {carregando ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Carregando fotos...
          </Typography>
        </Box>
      ) : fotos.length === 0 ? (
        <Box
          sx={{
            p: 3,
            border: '1px dashed',
            borderColor: 'divider',
            textAlign: 'center',
            backgroundColor: '#F7F9FA',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Nenhuma foto cadastrada. O veículo precisa de 2 a 10 fotos para ser ativado.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: 2,
          }}
        >
          {fotos.map((foto) => {
            const urlImagem = `${api.defaults.baseURL}/api/fotos/arquivo/${foto.nomeArquivo}`;
            return (
              <Box
                key={foto.id}
                sx={{
                  position: 'relative',
                  backgroundColor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  aspectRatio: '16/9',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  component="img"
                  src={urlImagem}
                  alt={foto.nomeOriginal || 'Foto do veículo'}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {editavel && (
                  <Button
                    size="small"
                    onClick={() => handleRemoverFoto(foto.id)}
                    aria-label={`Remover foto ${foto.nomeOriginal || foto.id}`}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      minWidth: 28,
                      height: 28,
                      p: 0,
                      backgroundColor: 'rgba(23, 42, 48, 0.82)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255, 255, 255, 0.55)',
                      borderRadius: 0,
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      lineHeight: 1,
                      '&:hover': {
                        backgroundColor: 'error.main',
                        color: 'common.white',
                      },
                    }}
                  >
                    ✕
                  </Button>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Histórico do envio de fotos */}
      {historicoEnvios.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Resultado dos envios recentes:
          </Typography>
          <List dense sx={{ maxHeight: 120, overflowY: 'auto', p: 0 }}>
            {historicoEnvios.map((item) => (
              <ListItem key={item.id} sx={{ px: 0, py: 0.25 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.8rem',
                        color: item.sucesso ? 'success.main' : 'error.main',
                      }}
                    >
                      <strong>{item.nome}</strong>: {item.mensagem}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
