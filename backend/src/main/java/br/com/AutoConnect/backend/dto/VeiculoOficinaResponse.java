package br.com.AutoConnect.backend.dto;

public record VeiculoOficinaResponse(
        Long id,
        String placa,
        String modelo,
        Integer ano
) {}
