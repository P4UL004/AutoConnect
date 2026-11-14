package br.com.AutoConnect.backend.util;

import java.time.Year;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;

import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.EstadoVeiculo;

public final class ValidadorVeiculo {

    private static final Pattern PADRAO_MERCOSUL = Pattern.compile("^[A-Z]{3}[0-9][A-Z][0-9]{2}$");
    private static final Pattern PADRAO_ANTIGO = Pattern.compile("^[A-Z]{3}-[0-9]{4}$");
    private static final Pattern PADRAO_CHASSI = Pattern.compile("^[A-HJ-NPR-Z0-9]{17}$");

    private ValidadorVeiculo() {
    }

    public static String validarPlaca(String placa) {
        if (placa == null || placa.trim().isEmpty()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "A placa é obrigatória.");
        }

        String placaNormalizada = placa.trim().toUpperCase();

        boolean valida = PADRAO_MERCOSUL.matcher(placaNormalizada).matches()
                || PADRAO_ANTIGO.matcher(placaNormalizada).matches();

        if (!valida) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Placa inválida. O padrão deve ser Mercosul (AAA1A23) ou antigo (AAA-1234).");
        }

        return placaNormalizada;
    }

    public static String validarChassi(String chassi) {
        if (chassi == null || chassi.trim().isEmpty()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "O chassi é obrigatório.");
        }

        String chassiNormalizado = chassi.trim().toUpperCase();

        if (chassiNormalizado.length() != 17) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Chassi inválido. Deve conter exatamente 17 caracteres alfanuméricos sem as letras I, O ou Q.");
        }

        if (!PADRAO_CHASSI.matcher(chassiNormalizado).matches()) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "Chassi inválido. Deve conter exatamente 17 caracteres alfanuméricos sem as letras I, O ou Q.");
        }

        return chassiNormalizado;
    }

    public static void validarAno(Integer ano) {
        int anoMaximo = Year.now().getValue() + 1;
        if (ano == null || ano < 1950 || ano > anoMaximo) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "O ano deve estar entre 1950 e " + anoMaximo + ".");
        }
    }

    public static void validarQuilometragem(Integer quilometragem) {
        if (quilometragem == null || quilometragem < 0) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "A quilometragem deve ser maior ou igual a zero.");
        }
    }

    public static void validarAtivacao(EstadoVeiculo estado, long quantidadeFotos) {
        if (estado != EstadoVeiculo.RASCUNHO || quantidadeFotos < 2 || quantidadeFotos > 10) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST,
                    "O veículo precisa de 2 a 10 fotos válidas para ser ativado (tem " + quantidadeFotos + ").");
        }
    }
}
