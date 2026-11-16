package br.com.AutoConnect.backend.controller;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.AutoConnect.backend.dto.FotoResponse;
import br.com.AutoConnect.backend.dto.ItemOsRequest;
import br.com.AutoConnect.backend.dto.ItemOsResponse;
import br.com.AutoConnect.backend.dto.OrdemServicoRequest;
import br.com.AutoConnect.backend.dto.OrdemServicoResponse;
import br.com.AutoConnect.backend.dto.PaginaResponse;
import br.com.AutoConnect.backend.dto.VeiculoOficinaResponse;
import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.EstadoOrdemServico;
import br.com.AutoConnect.backend.model.Usuario;
import br.com.AutoConnect.backend.repository.UsuarioRepository;
import br.com.AutoConnect.backend.repository.VeiculoRepository;
import br.com.AutoConnect.backend.service.OrdemServicoService;
import jakarta.validation.Valid;

/**
 * Endpoints das Ordens de Servico. As permissoes por perfil ficam no SecurityConfig;
 * as regras de negocio (estados, fotos, RN03) ficam no OrdemServicoService.
 */
@RestController
@RequestMapping("/api/ordens-servico")
public class OrdemServicoController {

    private final OrdemServicoService servico;
    private final UsuarioRepository usuarioRepository;
    private final VeiculoRepository veiculoRepository;

    public OrdemServicoController(OrdemServicoService servico,
                                  UsuarioRepository usuarioRepository,
                                  VeiculoRepository veiculoRepository) {
        this.servico = servico;
        this.usuarioRepository = usuarioRepository;
        this.veiculoRepository = veiculoRepository;
    }

    /** Usuario logado (o JWT guarda o e-mail como identificador). */
    private Usuario operador(Authentication authentication) {
        return usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));
    }

    // ---------------------------------------------------------------- apoio

    /** Veiculos disponiveis para abrir OS (tecnico e administrador). */
    @GetMapping("/veiculos")
    public ResponseEntity<List<VeiculoOficinaResponse>> listarVeiculos() {
        List<VeiculoOficinaResponse> lista = veiculoRepository.findAll().stream()
                .map(v -> new VeiculoOficinaResponse(v.getId(), v.getPlaca(), v.getModelo(), v.getAno()))
                .sorted(Comparator.comparing(VeiculoOficinaResponse::placa))
                .toList();
        return ResponseEntity.ok(lista);
    }

    // ------------------------------------------------------------------ OS

    @PostMapping
    public ResponseEntity<OrdemServicoResponse> criar(@Valid @RequestBody OrdemServicoRequest dados,
                                                      Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servico.criar(dados, operador(authentication)));
    }

    @GetMapping
    public ResponseEntity<PaginaResponse<OrdemServicoResponse>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho,
            Authentication authentication) {

        EstadoOrdemServico estadoEnum = null;
        if (estado != null && !estado.trim().isEmpty()) {
            try {
                estadoEnum = EstadoOrdemServico.valueOf(estado.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Estado de OS inválido.");
            }
        }
        return ResponseEntity.ok(servico.listar(estadoEnum, pagina, tamanho, operador(authentication)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdemServicoResponse> buscar(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(servico.buscarPorId(id, operador(authentication)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdemServicoResponse> atualizar(@PathVariable Long id,
                                                          @Valid @RequestBody OrdemServicoRequest dados,
                                                          Authentication authentication) {
        return ResponseEntity.ok(servico.atualizar(id, dados, operador(authentication)));
    }

    // --------------------------------------------------------------- fotos

    @GetMapping("/{id}/fotos")
    public ResponseEntity<List<FotoResponse>> listarFotos(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(servico.listarFotos(id, operador(authentication)));
    }

    @PostMapping(value = "/{id}/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FotoResponse> adicionarFoto(@PathVariable Long id,
                                                      @RequestParam("arquivo") MultipartFile arquivo,
                                                      Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servico.adicionarFoto(id, arquivo, operador(authentication)));
    }

    @DeleteMapping("/{id}/fotos/{fotoId}")
    public ResponseEntity<Void> removerFoto(@PathVariable Long id, @PathVariable Long fotoId,
                                            Authentication authentication) {
        servico.removerFoto(id, fotoId, operador(authentication));
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------- itens

    @PostMapping("/{id}/itens")
    public ResponseEntity<ItemOsResponse> adicionarItem(@PathVariable Long id,
                                                        @Valid @RequestBody ItemOsRequest dados,
                                                        Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servico.adicionarItem(id, dados, operador(authentication)));
    }

    @PutMapping("/{id}/itens/{itemId}")
    public ResponseEntity<ItemOsResponse> atualizarItem(@PathVariable Long id, @PathVariable Long itemId,
                                                        @Valid @RequestBody ItemOsRequest dados,
                                                        Authentication authentication) {
        return ResponseEntity.ok(servico.atualizarItem(id, itemId, dados, operador(authentication)));
    }

    @DeleteMapping("/{id}/itens/{itemId}")
    public ResponseEntity<Void> removerItem(@PathVariable Long id, @PathVariable Long itemId,
                                            Authentication authentication) {
        servico.removerItem(id, itemId, operador(authentication));
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------- transicoes

    @PostMapping("/{id}/abrir")
    public ResponseEntity<OrdemServicoResponse> abrir(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(servico.abrir(id, operador(authentication)));
    }

    @PostMapping("/{id}/orcamento")
    public ResponseEntity<OrdemServicoResponse> enviarOrcamento(@PathVariable Long id,
                                                                Authentication authentication) {
        return ResponseEntity.ok(servico.enviarOrcamento(id, operador(authentication)));
    }

    @PostMapping("/{id}/aprovar")
    public ResponseEntity<OrdemServicoResponse> aprovar(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(servico.aprovar(id, operador(authentication)));
    }

    @PostMapping("/{id}/recusar")
    public ResponseEntity<OrdemServicoResponse> recusar(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(servico.recusar(id, operador(authentication)));
    }

    @PostMapping("/{id}/iniciar-execucao")
    public ResponseEntity<OrdemServicoResponse> iniciarExecucao(@PathVariable Long id,
                                                                Authentication authentication) {
        return ResponseEntity.ok(servico.iniciarExecucao(id, operador(authentication)));
    }

    @PostMapping("/{id}/controle-qualidade")
    public ResponseEntity<OrdemServicoResponse> enviarControleQualidade(@PathVariable Long id,
                                                                        Authentication authentication) {
        return ResponseEntity.ok(servico.enviarControleQualidade(id, operador(authentication)));
    }

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<OrdemServicoResponse> finalizar(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(servico.finalizar(id, operador(authentication)));
    }
}
