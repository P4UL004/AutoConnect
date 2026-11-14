package br.com.AutoConnect.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VeiculoRequest(
        @NotBlank(message = "O chassi é obrigatório.")
        String chassi,

        @NotBlank(message = "A placa é obrigatória.")
        String placa,

        @NotBlank(message = "O modelo é obrigatório.")
        String modelo,

        @NotNull(message = "O ano é obrigatório.")
        Integer ano,

        @NotNull(message = "A quilometragem é obrigatória.")
        Integer quilometragem,

        @Size(max = 2000, message = "O laudo cautelar deve ter no máximo 2000 caracteres.")
        String laudoCautelar
) {
}
