package br.com.AutoConnect.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.AutoConnect.backend.dto.FotoResponse;
import br.com.AutoConnect.backend.dto.ItemOsRequest;
import br.com.AutoConnect.backend.dto.ItemOsResponse;
import br.com.AutoConnect.backend.dto.OrdemServicoRequest;
import br.com.AutoConnect.backend.dto.OrdemServicoResponse;
import br.com.AutoConnect.backend.dto.PaginaResponse;
import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.DonoFoto;
import br.com.AutoConnect.backend.model.EstadoOrdemServico;
import br.com.AutoConnect.backend.model.ItemOrdemServico;
import br.com.AutoConnect.backend.model.OrdemServico;
import br.com.AutoConnect.backend.model.Perfil;
import br.com.AutoConnect.backend.model.TipoItemOs;
import br.com.AutoConnect.backend.model.Usuario;
import br.com.AutoConnect.backend.model.Veiculo;
import br.com.AutoConnect.backend.repository.ItemOrdemServicoRepository;
import br.com.AutoConnect.backend.repository.OrdemServicoRepository;
import br.com.AutoConnect.backend.repository.UsuarioRepository;
import br.com.AutoConnect.backend.repository.VeiculoRepository;
import br.com.AutoConnect.backend.util.RegrasOrdemServico;

@Service
public class OrdemServicoService {

    private static final Logger logger = LoggerFactory.getLogger(OrdemServicoService.class);

    private final OrdemServicoRepository osRepository;
    private final ItemOrdemServicoRepository itemRepository;
    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;
    private final FotoService fotoService;

    public OrdemServicoService(OrdemServicoRepository osRepository,
                               ItemOrdemServicoRepository itemRepository,
                               UsuarioRepository usuarioRepository,
                               VeiculoRepository veiculoRepository,
                               FotoService fotoService) {
        this.osRepository = osRepository;
        this.itemRepository = itemRepository;
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
        this.fotoService = fotoService;
    }

    // -------------------------------------------------------------------------
    // Criar OS (em RASCUNHO)
    // -------------------------------------------------------------------------

    @Transactional
    public OrdemServicoResponse criar(OrdemServicoRequest dados, Usuario operador) {
        long inicio = System.currentTimeMillis();

        Usuario cliente = buscarCliente(dados.clienteId());
        Veiculo veiculo = buscarVeiculo(dados.veiculoId());

        OrdemServico os = new OrdemServico();
        os.setCliente(cliente);
        os.setVeiculo(veiculo);
        os.setRelatoSintomas(dados.relatoSintomas().trim());
        os.setChecklistAvarias(dados.checklistAvarias() != null ? dados.checklistAvarias().trim() : null);
        os.setEstado(EstadoOrdemServico.RASCUNHO);
        os.setCriadaPor(operador);
        os.setDataCriacao(LocalDateTime.now());

        // Primeiro save para obter o id gerado
        OrdemServico salva = osRepository.save(os);

        // Gera o número único com id e ano de criação
        int ano = salva.getDataCriacao().getYear();
        salva.setNumero(RegrasOrdemServico.gerarNumero(salva.getId(), ano));
        salva = osRepository.save(salva);

        long tempo = System.currentTimeMillis() - inicio;
        logger.info("OS {} criada em {} ms", salva.getNumero(), tempo);

        return converterParaResponse(salva);
    }

    // -------------------------------------------------------------------------
    // Buscar por id
    // -------------------------------------------------------------------------

    public OrdemServicoResponse buscarPorId(Long id, Usuario operador) {
        OrdemServico os = buscarEntidade(id);
        verificarAcesso(os, operador);
        return converterParaResponse(os);
    }

    // -------------------------------------------------------------------------
    // Listar (paginado)
    // -------------------------------------------------------------------------

    public PaginaResponse<OrdemServicoResponse> listar(EstadoOrdemServico estado, int pagina,
                                                        int tamanho, Usuario operador) {
        int paginaAjustada = Math.max(pagina, 0);
        int tamanhoAjustado = tamanho <= 0 ? 10 : tamanho;
        Pageable pageable = PageRequest.of(paginaAjustada, tamanhoAjustado);

        Page<OrdemServico> pagina_resultado;
        boolean ehCliente = operador.getPerfil() == Perfil.CLIENTE;

        if (ehCliente && estado != null) {
            pagina_resultado = osRepository.findByClienteIdAndEstadoOrderByDataCriacaoDesc(
                    operador.getId(), estado, pageable);
        } else if (ehCliente) {
            pagina_resultado = osRepository.findByClienteIdOrderByDataCriacaoDesc(
                    operador.getId(), pageable);
        } else if (estado != null) {
            pagina_resultado = osRepository.findByEstadoOrderByDataCriacaoDesc(estado, pageable);
        } else {
            pagina_resultado = osRepository.findAllByOrderByDataCriacaoDesc(pageable);
        }

        List<OrdemServicoResponse> conteudo = pagina_resultado.getContent()
                .stream()
                .map(this::converterParaResponse)
                .toList();

        return new PaginaResponse<>(
                conteudo,
                pagina_resultado.getNumber(),
                pagina_resultado.getSize(),
                pagina_resultado.getTotalElements(),
                pagina_resultado.getTotalPages()
        );
    }

    // -------------------------------------------------------------------------
    // Atualizar dados da OS (somente em RASCUNHO)
    // -------------------------------------------------------------------------

    @Transactional
    public OrdemServicoResponse atualizar(Long id, OrdemServicoRequest dados, Usuario operador) {
        OrdemServico os = buscarEntidade(id);
        verificarAcesso(os, operador);

        if (os.getEstado() != EstadoOrdemServico.RASCUNHO) {
            throw new RegraNegocioException(HttpStatus.CONFLICT,
                    "A OS só pode ser editada enquanto estiver em Rascunho.");
        }

        Usuario cliente = buscarCliente(dados.clienteId());
        Veiculo veiculo = buscarVeiculo(dados.veiculoId());

        os.setCliente(cliente);
        os.setVeiculo(veiculo);
        os.setRelatoSintomas(dados.relatoSintomas().trim());
        os.setChecklistAvarias(dados.checklistAvarias() != null ? dados.checklistAvarias().trim() : null);

        return converterParaResponse(osRepository.save(os));
    }

    // -------------------------------------------------------------------------
    // Fotos (somente em RASCUNHO)
    // -------------------------------------------------------------------------

    @Transactional
    public FotoResponse adicionarFoto(Long id, MultipartFile arquivo, Usuario operador) {
        OrdemServico os = buscarEntidade(id);
        verificarAcesso(os, operador);

        if (os.getEstado() != EstadoOrdemServico.RASCUNHO) {
            throw new RegraNegocioException(HttpStatus.CONFLICT,
                    "Fotos só podem ser alteradas enquanto a OS estiver em Rascunho.");
        }

        long qtd = fotoService.contar(DonoFoto.OS, id);
        try {
            RegrasOrdemServico.validarMaxFotos((int) qtd);
        } catch (IllegalStateException e) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        return fotoService.salvar(DonoFoto.OS, id, arquivo, false);
    }

    @Transactional
    public void removerFoto(Long id, Long fotoId, Usuario operador) {
        OrdemServico os = buscarEntidade(id);
        verificarAcesso(os, operador);

        if (os.getEstado() != EstadoOrdemServico.RASCUNHO) {
            throw new RegraNegocioException(HttpStatus.CONFLICT,
                    "Fotos só podem ser alteradas enquanto a OS estiver em Rascunho.");
        }

        fotoService.remover(DonoFoto.OS, id, fotoId);
    }

    public List<FotoResponse> listarFotos(Long id, Usuario operador) {
        OrdemServico os = buscarEntidade(id);
        verificarAcesso(os, operador);
        return fotoService.listar(DonoFoto.OS, id);
    }

    // -------------------------------------------------------------------------
    // Itens
    // -------------------------------------------------------------------------

    @Transactional
    public ItemOsResponse adicionarItem(Long id, ItemOsRequest dados, Usuario operador) {
        OrdemServico os = osRepository.findByIdComLock(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "OS não encontrada."));
        verificarAcesso(os, operador);

        try {
            RegrasOrdemServico.verificarItemEditavel(os.getEstado());
            RegrasOrdemServico.validarValorUnitario(dados.valorUnitario());
        } catch (IllegalStateException | IllegalArgumentException e) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, e.getMessage());
        }

        ItemOrdemServico item = new ItemOrdemServico();
        item.setOs(os);
        item.setTipo(dados.tipo());
        item.setDescricao(dados.descricao().trim());
        item.setQuantidade(dados.quantidade());
        item.setValorUnitario(dados.valorUnitario());

        ItemOrdemServico salvo = itemRepository.save(item);
        return converterItemParaResponse(salvo);
    }

    @Transactional
    public ItemOsResponse atualizarItem(Long id, Long itemId, ItemOsRequest dados, Usuario operador) {
        OrdemServico os = osRepository.findByIdComLock(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "OS não encontrada."));
        verificarAcesso(os, operador);

        try {
            RegrasOrdemServico.verificarItemEditavel(os.getEstado());
            RegrasOrdemServico.validarValorUnitario(dados.valorUnitario());
        } catch (IllegalStateException | IllegalArgumentException e) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, e.getMessage());
        }

        ItemOrdemServico item = itemRepository.findById(itemId)
                .filter(i -> i.getOs().getId().equals(id))
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Item não encontrado."));

        item.setTipo(dados.tipo());
        item.setDescricao(dados.descricao().trim());
        item.setQuantidade(dados.quantidade());
        item.setValorUnitario(dados.valorUnitario());

        return converterItemParaResponse(itemRepository.save(item));
    }

    @Transactional
    public void removerItem(Long id, Long itemId, Usuario operador) {
        OrdemServico os = osRepository.findByIdComLock(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "OS não encontrada."));
        verificarAcesso(os, operador);

        try {
            RegrasOrdemServico.verificarItemEditavel(os.getEstado());
        } catch (IllegalStateException e) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, e.getMessage());
        }

        ItemOrdemServico item = itemRepository.findById(itemId)
                .filter(i -> i.getOs().getId().equals(id))
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Item não encontrado."));

        itemRepository.delete(item);
    }

    // -------------------------------------------------------------------------
    // Transições de estado
    // -------------------------------------------------------------------------

    /** RASCUNHO → ABERTA (mínimo 4 fotos) */
    @Transactional
    public OrdemServicoResponse abrir(Long id, Usuario operador) {
        OrdemServico os = buscarEntidade(id);
        verificarAcesso(os, operador);

        int qtdFotos = (int) fotoService.contar(DonoFoto.OS, id);
        try {
            RegrasOrdemServico.validarMinFotosParaAbrir(qtdFotos);
            RegrasOrdemServico.validarTransicao(os.getEstado(), EstadoOrdemServico.ABERTA);
        } catch (IllegalStateException e) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, e.getMessage());
        }

        os.setEstado(EstadoOrdemServico.ABERTA);
        os.setDataAbertura(LocalDateTime.now());
        return converterParaResponse(osRepository.save(os));
    }

    /** ABERTA → ORCADA */
    @Transactional
    public OrdemServicoResponse enviarOrcamento(Long id, Usuario operador) {
        OrdemServico os = osRepository.findByIdComLock(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "OS não encontrada."));
        verificarAcesso(os, operador);

        try {
            RegrasOrdemServico.validarTransicao(os.getEstado(), EstadoOrdemServico.ORCADA);
        } catch (IllegalStateException e) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, e.getMessage());
        }

        os.setEstado(EstadoOrdemServico.ORCADA);
        return converterParaResponse(osRepository.save(os));
    }

    /** ORCADA → APROVADA (somente o cliente dono) */
    @Transactional
    public OrdemServicoResponse aprovar(Long id, Usuario operador) {
        OrdemServico os = osRepository.findByIdComLock(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "OS não encontrada."));

        // Apenas o próprio cliente pode aprovar
        if (!os.getCliente().getId().equals(operador.getId())) {
            throw new RegraNegocioException(HttpStatus.FORBIDDEN,
                    "Somente o cliente desta OS pode aprovar o orçamento.");
        }

        try {
            RegrasOrdemServico.validarTransicao(os.getEstado(), EstadoOrdemServico.APROVADA);
        } catch (IllegalStateException e) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, e.getMessage());
        }

        os.setEstado(EstadoOrdemServico.APROVADA);
        os.setAprovadaPor(operador);
        os.setAprovadaEm(LocalDateTime.now());
        return converterParaResponse(osRepository.save(os));
    }

    /** ORCADA → ABERTA (recusa do cliente, volta para edição) */
    @Transactional
    public OrdemServicoResponse recusar(Long id, Usuario operador) {
        OrdemServico os = osRepository.findByIdComLock(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "OS não encontrada."));

        // Apenas o próprio cliente pode recusar
        if (!os.getCliente().getId().equals(operador.getId())) {
            throw new RegraNegocioException(HttpStatus.FORBIDDEN,
                    "Somente o cliente desta OS pode recusar o orçamento.");
        }

        try {
            RegrasOrdemServico.validarTransicao(os.getEstado(), EstadoOrdemServico.ABERTA);
        } catch (IllegalStateException e) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, e.getMessage());
        }

        os.setEstado(EstadoOrdemServico.ABERTA);
        os.setAprovadaPor(null);
        os.setAprovadaEm(null);
        return converterParaResponse(osRepository.save(os));
    }

    /** APROVADA → EM_EXECUCAO */
    @Transactional
    public OrdemServicoResponse iniciarExecucao(Long id, Usuario operador) {
        OrdemServico os = buscarEntidade(id);
        verificarAcesso(os, operador);

        try {
            RegrasOrdemServico.validarTransicao(os.getEstado(), EstadoOrdemServico.EM_EXECUCAO);
        } catch (IllegalStateException e) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, e.getMessage());
        }

        os.setEstado(EstadoOrdemServico.EM_EXECUCAO);
        return converterParaResponse(osRepository.save(os));
    }

    /** EM_EXECUCAO → EM_CONTROLE_QUALIDADE */
    @Transactional
    public OrdemServicoResponse enviarControleQualidade(Long id, Usuario operador) {
        OrdemServico os = buscarEntidade(id);
        verificarAcesso(os, operador);

        try {
            RegrasOrdemServico.validarTransicao(os.getEstado(), EstadoOrdemServico.EM_CONTROLE_QUALIDADE);
        } catch (IllegalStateException e) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, e.getMessage());
        }

        os.setEstado(EstadoOrdemServico.EM_CONTROLE_QUALIDADE);
        os.setQualidadeValidadaPor(operador);
        os.setQualidadeValidadaEm(LocalDateTime.now());
        return converterParaResponse(osRepository.save(os));
    }

    /** EM_CONTROLE_QUALIDADE → FINALIZADA */
    @Transactional
    public OrdemServicoResponse finalizar(Long id, Usuario operador) {
        OrdemServico os = buscarEntidade(id);
        verificarAcesso(os, operador);

        try {
            RegrasOrdemServico.validarEstadoParaFinalizar(os.getEstado());
            RegrasOrdemServico.validarTransicao(os.getEstado(), EstadoOrdemServico.FINALIZADA);
        } catch (IllegalStateException e) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, e.getMessage());
        }

        if (os.getAprovadaEm() == null) {
            throw new RegraNegocioException(HttpStatus.CONFLICT,
                    "A OS não pode ser finalizada sem aprovação do cliente.");
        }

        os.setEstado(EstadoOrdemServico.FINALIZADA);
        os.setFinalizadaEm(LocalDateTime.now());
        return converterParaResponse(osRepository.save(os));
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private OrdemServico buscarEntidade(Long id) {
        return osRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "OS não encontrada."));
    }

    private Usuario buscarCliente(Long clienteId) {
        Usuario cliente = usuarioRepository.findById(clienteId)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));
        if (cliente.getPerfil() != Perfil.CLIENTE) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "O usuário informado não é um cliente.");
        }
        return cliente;
    }

    private Veiculo buscarVeiculo(Long veiculoId) {
        return veiculoRepository.findById(veiculoId)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Veículo não encontrado."));
    }

    /**
     * Verifica acesso: CLIENTE só acessa as próprias OS;
     * CONSULTOR_TECNICO e ADMINISTRADOR acessam qualquer OS.
     */
    private void verificarAcesso(OrdemServico os, Usuario operador) {
        if (operador.getPerfil() == Perfil.CLIENTE
                && !os.getCliente().getId().equals(operador.getId())) {
            throw new RegraNegocioException(HttpStatus.FORBIDDEN, "Acesso negado.");
        }
    }

    private OrdemServicoResponse converterParaResponse(OrdemServico os) {
        List<FotoResponse> fotos = fotoService.listar(DonoFoto.OS, os.getId());
        List<ItemOrdemServico> itens = itemRepository.findByOsId(os.getId());
        List<ItemOsResponse> itensResponse = itens.stream().map(this::converterItemParaResponse).toList();
        BigDecimal total = RegrasOrdemServico.calcularTotal(itens);

        return new OrdemServicoResponse(
                os.getId(),
                os.getNumero(),
                os.getCliente().getId(),
                os.getCliente().getNome(),
                os.getVeiculo().getId(),
                os.getVeiculo().getPlaca(),
                os.getVeiculo().getModelo(),
                os.getRelatoSintomas(),
                os.getChecklistAvarias(),
                os.getEstado(),
                os.getCriadaPor().getId(),
                os.getCriadaPor().getNome(),
                os.getDataCriacao(),
                os.getDataAbertura(),
                os.getAprovadaPor() != null ? os.getAprovadaPor().getId() : null,
                os.getAprovadaPor() != null ? os.getAprovadaPor().getNome() : null,
                os.getAprovadaEm(),
                os.getQualidadeValidadaEm(),
                os.getFinalizadaEm(),
                fotos,
                fotos.size(),
                itensResponse,
                total
        );
    }

    private ItemOsResponse converterItemParaResponse(ItemOrdemServico item) {
        BigDecimal subtotal = item.getValorUnitario()
                .multiply(BigDecimal.valueOf(item.getQuantidade()));
        return new ItemOsResponse(
                item.getId(),
                item.getTipo(),
                item.getDescricao(),
                item.getQuantidade(),
                item.getValorUnitario(),
                subtotal
        );
    }
}
