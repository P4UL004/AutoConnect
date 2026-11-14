package br.com.AutoConnect.backend.util;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import br.com.AutoConnect.backend.model.EstadoOrdemServico;
import br.com.AutoConnect.backend.model.ItemOrdemServico;

/**
 * Regras de negócio puras para Ordens de Serviço.
 * Sem dependências de Spring ou banco de dados — testável com JUnit puro.
 */
public final class RegrasOrdemServico {

    // Estados em que itens ainda podem ser editados (antes da aprovação do cliente)
    private static final Set<EstadoOrdemServico> ESTADOS_ITEM_EDITAVEL = Set.of(
            EstadoOrdemServico.RASCUNHO,
            EstadoOrdemServico.ABERTA,
            EstadoOrdemServico.ORCADA
    );

    private RegrasOrdemServico() {}

    // -------------------------------------------------------------------------
    // Fotos
    // -------------------------------------------------------------------------

    /**
     * Valida se a quantidade de fotos é suficiente para abrir a OS (mínimo 4).
     * Lança IllegalStateException com a mensagem de negócio se inválido.
     */
    public static void validarMinFotosParaAbrir(int quantidadeFotos) {
        if (quantidadeFotos < 4) {
            throw new IllegalStateException(
                    "São necessárias ao menos 4 fotos para abrir a OS. Atual: " + quantidadeFotos + ".");
        }
    }

    /**
     * Valida se o limite máximo de fotos (10) ainda não foi atingido.
     */
    public static void validarMaxFotos(int quantidadeFotos) {
        if (quantidadeFotos >= 10) {
            throw new IllegalStateException("Limite de 10 fotos atingido.");
        }
    }

    // -------------------------------------------------------------------------
    // Itens
    // -------------------------------------------------------------------------

    /**
     * Valida se o estado atual permite edição de itens (RN03).
     * Após APROVADA, itens não podem ser alterados.
     */
    public static void verificarItemEditavel(EstadoOrdemServico estado) {
        if (!ESTADOS_ITEM_EDITAVEL.contains(estado)) {
            throw new IllegalStateException(
                    "Orçamento aprovado: itens e valores não podem ser alterados.");
        }
    }

    /**
     * Valida o valor unitário: não negativo e no máximo 2 casas decimais.
     */
    public static void validarValorUnitario(BigDecimal valor) {
        if (valor == null) {
            throw new IllegalArgumentException("O valor unitário é obrigatório.");
        }
        if (valor.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("O valor unitário não pode ser negativo.");
        }
        // scale() retorna o número de dígitos após a vírgula; stripTrailingZeros normaliza
        if (valor.stripTrailingZeros().scale() > 2) {
            throw new IllegalArgumentException(
                    "O valor unitário deve ter no máximo 2 casas decimais.");
        }
    }

    /**
     * Calcula o total da OS: soma de quantidade × valorUnitario de cada item.
     */
    public static BigDecimal calcularTotal(List<ItemOrdemServico> itens) {
        if (itens == null || itens.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return itens.stream()
                .map(i -> i.getValorUnitario().multiply(BigDecimal.valueOf(i.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // -------------------------------------------------------------------------
    // Número da OS
    // -------------------------------------------------------------------------

    /**
     * Gera o número da OS no formato OS-AAAA-000001.
     * @param id  id da OS (usado como sequencial único dentro do sistema)
     * @param ano ano da criação da OS
     */
    public static String gerarNumero(Long id, int ano) {
        return String.format("OS-%04d-%06d", ano, id);
    }

    // -------------------------------------------------------------------------
    // Máquina de estados
    // -------------------------------------------------------------------------

    /**
     * Valida a transição de estado da OS.
     * Lança IllegalStateException se a transição não for permitida.
     */
    public static void validarTransicao(EstadoOrdemServico atual, EstadoOrdemServico destino) {
        boolean valida = switch (atual) {
            case RASCUNHO -> destino == EstadoOrdemServico.ABERTA;
            case ABERTA -> destino == EstadoOrdemServico.ORCADA;
            case ORCADA ->
                // Cliente pode APROVAR ou RECUSAR (volta a ABERTA)
                destino == EstadoOrdemServico.APROVADA || destino == EstadoOrdemServico.ABERTA;
            case APROVADA -> destino == EstadoOrdemServico.EM_EXECUCAO;
            case EM_EXECUCAO -> destino == EstadoOrdemServico.EM_CONTROLE_QUALIDADE;
            case EM_CONTROLE_QUALIDADE -> destino == EstadoOrdemServico.FINALIZADA;
            case FINALIZADA -> false; // estado terminal
        };
        if (!valida) {
            throw new IllegalStateException(
                    "Transição inválida: " + atual + " → " + destino + ".");
        }
    }

    /**
     * Valida que a OS está em EM_CONTROLE_QUALIDADE antes de finalizar.
     */
    public static void validarEstadoParaFinalizar(EstadoOrdemServico estado) {
        if (estado != EstadoOrdemServico.EM_CONTROLE_QUALIDADE) {
            throw new IllegalStateException(
                    "A OS só pode ser finalizada quando estiver em Controle de Qualidade.");
        }
    }
}
