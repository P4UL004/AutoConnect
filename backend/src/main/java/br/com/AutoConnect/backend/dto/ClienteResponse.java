package br.com.AutoConnect.backend.dto;

public record ClienteResponse(
        Long id,
        String nome,
        String email
) {
}
