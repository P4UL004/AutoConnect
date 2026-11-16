package br.com.AutoConnect.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AgendamentoRequest(
        Long veiculoId,
        Long clienteId,
        LocalDateTime dataHora,
        String cnhNumero,
        String cnhCategoria,
        LocalDate cnhValidade,
        Boolean aceiteTermo
) {
}
