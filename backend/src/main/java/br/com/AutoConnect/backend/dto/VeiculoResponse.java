package br.com.AutoConnect.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import br.com.AutoConnect.backend.model.EstadoVeiculo;

public record VeiculoResponse(
        Long id,
        String chassi,
        String placa,
        String modelo,
        Integer ano,
        Integer quilometragem,
        String laudoCautelar,
        EstadoVeiculo estado,
        LocalDateTime dataCadastro,
        List<FotoResponse> fotos,
        int quantidadeFotos
) {
}
