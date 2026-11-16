package br.com.AutoConnect.backend.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.http.HttpStatus;

import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.EstadoVeiculo;

public final class RegrasTestDrive {

    public static final String TEXTO_TERMO =
            "Declaro estar ciente e de acordo com as normas e condições para realização do test-drive " +
            "junto à concessionária AutoConnect. Comprometo-me a conduzir o veículo em conformidade " +
            "com as normas do Código de Trânsito Brasileiro, portando a Carteira Nacional de Habilitação (CNH) " +
            "válida e de categoria compatível, assumindo a responsabilidade pela condução segura do veículo.";

    private static final Set<String> CATEGORIAS_VALIDAS = Set.of("B", "C", "D", "E");

    private RegrasTestDrive() {
    }

    public static void validarData(LocalDateTime dataHora) {
        validarData(dataHora, LocalDate.now());
    }

    public static void validarData(LocalDateTime dataHora, LocalDate hoje) {
        if (dataHora == null || dataHora.toLocalDate().isBefore(hoje)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "A data do test-drive não pode estar no passado.");
        }
    }

    public static String validarCnhNumero(String cnhNumero) {
        if (cnhNumero == null || !cnhNumero.trim().matches("^[0-9]{11}$")) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Informe o número da CNH com 11 dígitos.");
        }
        return cnhNumero.trim();
    }

    public static String validarCnhCategoria(String categoria) {
        if (categoria == null) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Categoria da CNH não permitida para test-drive (aceitas: B, C, D ou E).");
        }

        String categoriaNormalizada = categoria.trim().toUpperCase();
        if (!CATEGORIAS_VALIDAS.contains(categoriaNormalizada)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Categoria da CNH não permitida para test-drive (aceitas: B, C, D ou E).");
        }

        return categoriaNormalizada;
    }

    public static void validarCnhValidade(LocalDate cnhValidade, LocalDate dataTestDrive) {
        if (cnhValidade == null || dataTestDrive == null || cnhValidade.isBefore(dataTestDrive)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "CNH vencida na data marcada para o test-drive.");
        }
    }

    public static void validarAceiteTermo(Boolean aceiteTermo) {
        if (!Boolean.TRUE.equals(aceiteTermo)) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "É obrigatório aceitar o termo de responsabilidade.");
        }
    }

    public static String validarMotivoCancelamento(String motivo) {
        if (motivo == null || motivo.trim().length() < 5) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Informe o motivo do cancelamento (mínimo de 5 caracteres).");
        }
        return motivo.trim();
    }

    public static EstadoVeiculo determinarEstadoVeiculoAposCancelamento(EstadoVeiculo estadoAtual) {
        if (estadoAtual == EstadoVeiculo.RESERVADO) {
            return EstadoVeiculo.DISPONIVEL;
        }
        return estadoAtual;
    }
}
