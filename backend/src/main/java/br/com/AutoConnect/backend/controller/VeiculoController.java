package br.com.AutoConnect.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.AutoConnect.backend.dto.AlterarEstadoRequest;
import br.com.AutoConnect.backend.dto.FotoResponse;
import br.com.AutoConnect.backend.dto.PaginaResponse;
import br.com.AutoConnect.backend.dto.VeiculoDisponivelResponse;
import br.com.AutoConnect.backend.dto.VeiculoRequest;
import br.com.AutoConnect.backend.dto.VeiculoResponse;
import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.EstadoVeiculo;
import br.com.AutoConnect.backend.service.VeiculoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/veiculos")
public class VeiculoController {

    private final VeiculoService veiculoService;

    public VeiculoController(VeiculoService veiculoService) {
        this.veiculoService = veiculoService;
    }

    @GetMapping
    public ResponseEntity<PaginaResponse<VeiculoResponse>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String placa,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho) {

        EstadoVeiculo estadoEnum = null;
        if (estado != null && !estado.trim().isEmpty()) {
            try {
                estadoEnum = EstadoVeiculo.valueOf(estado.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Estado de veículo inválido.");
            }
        }

        return ResponseEntity.ok(veiculoService.listarPaginado(estadoEnum, placa, pagina, tamanho));
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<VeiculoDisponivelResponse>> listarDisponiveis() {
        return ResponseEntity.ok(veiculoService.listarDisponiveis());
    }

    @PostMapping
    public ResponseEntity<VeiculoResponse> cadastrar(@Valid @RequestBody VeiculoRequest request) {
        VeiculoResponse response = veiculoService.cadastrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VeiculoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(veiculoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VeiculoResponse> atualizar(@PathVariable Long id,
                                                    @Valid @RequestBody VeiculoRequest request) {
        return ResponseEntity.ok(veiculoService.atualizar(id, request));
    }

    @GetMapping("/{id}/fotos")
    public ResponseEntity<List<FotoResponse>> listarFotos(@PathVariable Long id) {
        return ResponseEntity.ok(veiculoService.listarFotos(id));
    }

    @PostMapping("/{id}/fotos")
    public ResponseEntity<FotoResponse> adicionarFoto(
            @PathVariable Long id,
            @RequestParam("arquivo") MultipartFile arquivo) {
        FotoResponse response = veiculoService.adicionarFoto(id, arquivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}/fotos/{fotoId}")
    public ResponseEntity<Void> removerFoto(@PathVariable Long id, @PathVariable Long fotoId) {
        veiculoService.removerFoto(id, fotoId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/ativar")
    public ResponseEntity<VeiculoResponse> ativar(@PathVariable Long id) {
        return ResponseEntity.ok(veiculoService.ativar(id));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<VeiculoResponse> alterarEstado(
            @PathVariable Long id,
            @Valid @RequestBody AlterarEstadoRequest request) {
        return ResponseEntity.ok(veiculoService.alterarEstado(id, request));
    }
}
