package br.com.AutoConnect.backend.dto;

import java.math.BigDecimal;

import br.com.AutoConnect.backend.model.TipoItemOs;

public record ItemOsResponse(
        Long id,
        TipoItemOs tipo,
        String descricao,
        Integer quantidade,
        BigDecimal valorUnitario,
        BigDecimal subtotal
) {}
