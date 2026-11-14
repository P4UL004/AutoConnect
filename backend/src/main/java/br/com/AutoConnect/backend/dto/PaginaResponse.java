package br.com.AutoConnect.backend.dto;

import java.util.List;

public record PaginaResponse<T>(
        List<T> conteudo,
        int pagina,
        int tamanho,
        long totalElementos,
        int totalPaginas
) {
}
