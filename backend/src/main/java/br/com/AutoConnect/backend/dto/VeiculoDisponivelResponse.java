package br.com.AutoConnect.backend.dto;

public record VeiculoDisponivelResponse(
        Long id,
        String placa,
        String modelo,
        Integer ano
) {
}
