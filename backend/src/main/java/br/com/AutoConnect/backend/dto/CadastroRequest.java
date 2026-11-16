package br.com.AutoConnect.backend.dto;

import br.com.AutoConnect.backend.model.TipoPessoa;

/**
 * Dados do cadastro publico de cliente.
 * Para PJ, o campo nome recebe a razao social.
 */
public record CadastroRequest(
        String nome,
        String email,
        String senha,
        TipoPessoa tipoPessoa,
        String documento,
        String telefone
) {
}
