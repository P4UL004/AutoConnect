package br.com.AutoConnect.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import br.com.AutoConnect.backend.model.EstadoOrdemServico;

public record OrdemServicoResponse(
        Long id,
        String numero,
        Long clienteId,
        String clienteNome,
        Long veiculoId,
        String veiculoPlaca,
        String veiculoModelo,
        String relatoSintomas,
        String checklistAvarias,
        EstadoOrdemServico estado,
        Long criadaPorId,
        String criadaPorNome,
        LocalDateTime dataCriacao,
        LocalDateTime dataAbertura,
        Long aprovadaPorId,
        String aprovadaPorNome,
        LocalDateTime aprovadaEm,
        LocalDateTime qualidadeValidadaEm,
        LocalDateTime finalizadaEm,
        List<FotoResponse> fotos,
        int quantidadeFotos,
        List<ItemOsResponse> itens,
        BigDecimal total
) {}
