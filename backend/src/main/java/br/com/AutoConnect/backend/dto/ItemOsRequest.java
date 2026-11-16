package br.com.AutoConnect.backend.dto;

import java.math.BigDecimal;

import br.com.AutoConnect.backend.model.TipoItemOs;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ItemOsRequest(
        @NotNull(message = "O tipo do item é obrigatório.")
        TipoItemOs tipo,

        @NotBlank(message = "A descrição do item é obrigatória.")
        String descricao,

        @NotNull(message = "A quantidade é obrigatória.")
        @Min(value = 1, message = "A quantidade deve ser maior que zero.")
        Integer quantidade,

        @NotNull(message = "O valor unitário é obrigatório.")
        @DecimalMin(value = "0.00", message = "O valor unitário não pode ser negativo.")
        BigDecimal valorUnitario
) {}
