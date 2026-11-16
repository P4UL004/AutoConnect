package br.com.AutoConnect.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrdemServicoRequest(
        @NotNull(message = "O cliente é obrigatório.")
        Long clienteId,

        @NotNull(message = "O veículo é obrigatório.")
        Long veiculoId,

        @NotBlank(message = "O relato de sintomas é obrigatório.")
        String relatoSintomas,

        String checklistAvarias
) {}
