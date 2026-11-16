package br.com.AutoConnect.backend.dto;

import java.time.LocalDateTime;

public record FotoResponse(
        Long id,
        String nomeArquivo,
        String nomeOriginal,
        Long tamanhoBytes,
        LocalDateTime dataEnvio,
        String url
) {
}
