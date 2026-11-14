package br.com.AutoConnect.backend.dto;

import br.com.AutoConnect.backend.model.EstadoVeiculo;
import jakarta.validation.constraints.NotNull;

public record AlterarEstadoRequest(
        @NotNull(message = "O estado é obrigatório.")
        EstadoVeiculo estado
) {
}
