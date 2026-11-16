package br.com.AutoConnect.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import br.com.AutoConnect.backend.model.EstadoAgendamento;

public record AgendamentoResponse(
        Long id,
        Long veiculoId,
        String veiculoModelo,
        String veiculoPlaca,
        Long clienteId,
        String clienteNome,
        String clienteEmail,
        LocalDateTime dataHora,
        String cnhNumero,
        String cnhCategoria,
        LocalDate cnhValidade,
        String termoTexto,
        String aceitoPor,
        LocalDateTime aceitoEm,
        EstadoAgendamento estado,
        String criadoPor,
        LocalDateTime dataCriacao,
        String motivoCancelamento,
        String canceladoPor,
        LocalDateTime canceladoEm
) {
}
