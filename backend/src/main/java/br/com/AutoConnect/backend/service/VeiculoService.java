package br.com.AutoConnect.backend.service;

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

import br.com.AutoConnect.backend.dto.AlterarEstadoRequest;
import br.com.AutoConnect.backend.dto.FotoResponse;
import br.com.AutoConnect.backend.dto.PaginaResponse;
import br.com.AutoConnect.backend.dto.VeiculoDisponivelResponse;
import br.com.AutoConnect.backend.dto.VeiculoRequest;
import br.com.AutoConnect.backend.dto.VeiculoResponse;
import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.DonoFoto;
import br.com.AutoConnect.backend.model.EstadoVeiculo;
import br.com.AutoConnect.backend.model.Veiculo;
import br.com.AutoConnect.backend.repository.VeiculoRepository;
import br.com.AutoConnect.backend.util.ValidadorVeiculo;

@Service
public class VeiculoService {

    private static final Logger logger = LoggerFactory.getLogger(VeiculoService.class);

    private final VeiculoRepository veiculoRepository;
    private final FotoService fotoService;

    public VeiculoService(VeiculoRepository veiculoRepository, FotoService fotoService) {
        this.veiculoRepository = veiculoRepository;
        this.fotoService = fotoService;
    }

    @Transactional
    public VeiculoResponse cadastrar(VeiculoRequest dados) {
        long inicio = System.currentTimeMillis();

        String placa = ValidadorVeiculo.validarPlaca(dados.placa());
        String chassi = ValidadorVeiculo.validarChassi(dados.chassi());
        ValidadorVeiculo.validarAno(dados.ano());
        ValidadorVeiculo.validarQuilometragem(dados.quilometragem());

        if (dados.modelo() == null || dados.modelo().trim().isEmpty()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "O modelo é obrigatório.");
        }

        if (veiculoRepository.existsByPlaca(placa)) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, "Placa já cadastrada.");
        }

        if (veiculoRepository.existsByChassi(chassi)) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, "Chassi já cadastrado.");
        }

        Veiculo veiculo = new Veiculo();
        veiculo.setPlaca(placa);
        veiculo.setChassi(chassi);
        veiculo.setModelo(dados.modelo().trim());
        veiculo.setAno(dados.ano());
        veiculo.setQuilometragem(dados.quilometragem());
        veiculo.setLaudoCautelar(dados.laudoCautelar() != null ? dados.laudoCautelar().trim() : null);
        veiculo.setEstado(EstadoVeiculo.RASCUNHO);
        veiculo.setDataCadastro(LocalDateTime.now());

        Veiculo salvo = veiculoRepository.save(veiculo);

        long tempoGasto = System.currentTimeMillis() - inicio;
        logger.info("Veículo {} gravado em {} ms", salvo.getId(), tempoGasto);

        return converterParaResponse(salvo);
    }

    @Transactional
    public VeiculoResponse atualizar(Long id, VeiculoRequest dados) {
        Veiculo veiculo = buscarEntidade(id);

        String placa = ValidadorVeiculo.validarPlaca(dados.placa());
        String chassi = ValidadorVeiculo.validarChassi(dados.chassi());
        ValidadorVeiculo.validarAno(dados.ano());
        ValidadorVeiculo.validarQuilometragem(dados.quilometragem());

        if (dados.modelo() == null || dados.modelo().trim().isEmpty()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "O modelo é obrigatório.");
        }

        if (veiculoRepository.existsByPlacaAndIdNot(placa, id)) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, "Placa já cadastrada.");
        }

        if (veiculoRepository.existsByChassiAndIdNot(chassi, id)) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, "Chassi já cadastrado.");
        }

        veiculo.setPlaca(placa);
        veiculo.setChassi(chassi);
        veiculo.setModelo(dados.modelo().trim());
        veiculo.setAno(dados.ano());
        veiculo.setQuilometragem(dados.quilometragem());
        veiculo.setLaudoCautelar(dados.laudoCautelar() != null ? dados.laudoCautelar().trim() : null);

        Veiculo salvo = veiculoRepository.save(veiculo);
        return converterParaResponse(salvo);
    }

    public List<VeiculoDisponivelResponse> listarDisponiveis() {
        return veiculoRepository.findByEstadoOrderByDataCadastroDesc(EstadoVeiculo.DISPONIVEL, Pageable.unpaged())
                .getContent()
                .stream()
                .map(v -> new VeiculoDisponivelResponse(v.getId(), v.getPlaca(), v.getModelo(), v.getAno()))
                .toList();
    }

    public VeiculoResponse buscarPorId(Long id) {
        Veiculo veiculo = buscarEntidade(id);
        return converterParaResponse(veiculo);
    }

    public PaginaResponse<VeiculoResponse> listarPaginado(EstadoVeiculo estado, String placa, int pagina, int tamanho) {
        int paginaAjustada = Math.max(pagina, 0);
        int tamanhoAjustado = tamanho <= 0 ? 10 : tamanho;
        Pageable pageable = PageRequest.of(paginaAjustada, tamanhoAjustado);

        String placaLimpa = (placa != null && !placa.trim().isEmpty()) ? placa.trim() : null;

        Page<Veiculo> paginaResultado;

        if (estado != null && placaLimpa != null) {
            paginaResultado = veiculoRepository.findByEstadoAndPlacaContainingIgnoreCaseOrderByDataCadastroDesc(
                    estado, placaLimpa, pageable);
        } else if (estado != null) {
            paginaResultado = veiculoRepository.findByEstadoOrderByDataCadastroDesc(estado, pageable);
        } else if (placaLimpa != null) {
            paginaResultado = veiculoRepository.findByPlacaContainingIgnoreCaseOrderByDataCadastroDesc(
                    placaLimpa, pageable);
        } else {
            paginaResultado = veiculoRepository.findAllByOrderByDataCadastroDesc(pageable);
        }

        List<VeiculoResponse> conteudo = paginaResultado.getContent()
                .stream()
                .map(this::converterParaResponse)
                .toList();

        return new PaginaResponse<>(
                conteudo,
                paginaResultado.getNumber(),
                paginaResultado.getSize(),
                paginaResultado.getTotalElements(),
                paginaResultado.getTotalPages()
        );
    }

    @Transactional
    public FotoResponse adicionarFoto(Long id, MultipartFile arquivo) {
        Veiculo veiculo = buscarEntidade(id);

        if (veiculo.getEstado() != EstadoVeiculo.RASCUNHO) {
            throw new RegraNegocioException(HttpStatus.CONFLICT,
                    "Fotos só podem ser alteradas enquanto o veículo estiver em Rascunho.");
        }

        long quantidadeAtual = fotoService.contar(DonoFoto.VEICULO, id);
        if (quantidadeAtual >= 10) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Limite de 10 fotos atingido.");
        }

        return fotoService.salvar(DonoFoto.VEICULO, id, arquivo, true);
    }

    @Transactional
    public void removerFoto(Long id, Long fotoId) {
        Veiculo veiculo = buscarEntidade(id);

        if (veiculo.getEstado() != EstadoVeiculo.RASCUNHO) {
            throw new RegraNegocioException(HttpStatus.CONFLICT,
                    "Fotos só podem ser alteradas enquanto o veículo estiver em Rascunho.");
        }

        fotoService.remover(DonoFoto.VEICULO, id, fotoId);
    }

    public List<FotoResponse> listarFotos(Long id) {
        buscarEntidade(id);
        return fotoService.listar(DonoFoto.VEICULO, id);
    }

    @Transactional
    public VeiculoResponse ativar(Long id) {
        Veiculo veiculo = buscarEntidade(id);

        long quantidadeFotos = fotoService.contar(DonoFoto.VEICULO, id);
        ValidadorVeiculo.validarAtivacao(veiculo.getEstado(), quantidadeFotos);

        veiculo.setEstado(EstadoVeiculo.DISPONIVEL);
        Veiculo salvo = veiculoRepository.save(veiculo);

        return converterParaResponse(salvo);
    }

    @Transactional
    public VeiculoResponse alterarEstado(Long id, AlterarEstadoRequest request) {
        Veiculo veiculo = buscarEntidade(id);
        EstadoVeiculo novoEstado = request.estado();

        if (veiculo.getEstado() == EstadoVeiculo.RASCUNHO) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Para sair de Rascunho utilize o endpoint de ativação.");
        }

        if (novoEstado == EstadoVeiculo.RASCUNHO) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Não é permitido retornar um veículo para Rascunho.");
        }

        veiculo.setEstado(novoEstado);
        Veiculo salvo = veiculoRepository.save(veiculo);

        return converterParaResponse(salvo);
    }

    private Veiculo buscarEntidade(Long id) {
        return veiculoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Veículo não encontrado."));
    }

    private VeiculoResponse converterParaResponse(Veiculo veiculo) {
        List<FotoResponse> fotos = fotoService.listar(DonoFoto.VEICULO, veiculo.getId());
        return new VeiculoResponse(
                veiculo.getId(),
                veiculo.getChassi(),
                veiculo.getPlaca(),
                veiculo.getModelo(),
                veiculo.getAno(),
                veiculo.getQuilometragem(),
                veiculo.getLaudoCautelar(),
                veiculo.getEstado(),
                veiculo.getDataCadastro(),
                fotos,
                fotos.size()
        );
    }
}
