package br.com.AutoConnect.backend.dto;

public record LoginResponse(
        String token,
        String nome,
        String perfil) {
}