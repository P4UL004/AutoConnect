package br.com.AutoConnect.backend.util;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.EstadoVeiculo;

class RegrasTestDriveTest {

    @Test
    void deveRecusarCnhVencidaAntesDaDataMarcada() {
        LocalDate dataMarcada = LocalDate.of(2026, 11, 20);
        LocalDate cnhVencida = LocalDate.of(2026, 11, 19);

        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> RegrasTestDrive.validarCnhValidade(cnhVencida, dataMarcada));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("CNH vencida na data marcada para o test-drive.", ex.getMessage());
    }

    @Test
    void deveAceitarValidadeIgualOuPosteriorADataMarcada() {
        LocalDate dataMarcada = LocalDate.of(2026, 11, 20);
        LocalDate validadeIgual = LocalDate.of(2026, 11, 20);
        LocalDate validadePosterior = LocalDate.of(2026, 11, 25);

        assertDoesNotThrow(() -> RegrasTestDrive.validarCnhValidade(validadeIgual, dataMarcada));
        assertDoesNotThrow(() -> RegrasTestDrive.validarCnhValidade(validadePosterior, dataMarcada));
    }

    @Test
    void deveRecusarCategoriasA_e_ACC() {
        RegraNegocioException exA = assertThrows(RegraNegocioException.class,
                () -> RegrasTestDrive.validarCnhCategoria("A"));
        assertEquals("Categoria da CNH não permitida para test-drive (aceitas: B, C, D ou E).", exA.getMessage());

        RegraNegocioException exACC = assertThrows(RegraNegocioException.class,
                () -> RegrasTestDrive.validarCnhCategoria("ACC"));
        assertEquals("Categoria da CNH não permitida para test-drive (aceitas: B, C, D ou E).", exACC.getMessage());
    }

    @Test
    void deveAceitarCategoriasB_C_D_E_InclusiveMinusculas() {
        assertEquals("B", RegrasTestDrive.validarCnhCategoria("B"));
        assertEquals("B", RegrasTestDrive.validarCnhCategoria("b"));
        assertEquals("C", RegrasTestDrive.validarCnhCategoria("C"));
        assertEquals("C", RegrasTestDrive.validarCnhCategoria("c"));
        assertEquals("D", RegrasTestDrive.validarCnhCategoria("D"));
        assertEquals("D", RegrasTestDrive.validarCnhCategoria("d"));
        assertEquals("E", RegrasTestDrive.validarCnhCategoria("E"));
        assertEquals("E", RegrasTestDrive.validarCnhCategoria("e"));
    }

    @Test
    void deveRecusarDataDeOntem_e_AceitarDataDeHoje() {
        LocalDate hoje = LocalDate.of(2026, 11, 14);
        LocalDateTime dataOntem = hoje.minusDays(1).atTime(15, 30);
        LocalDateTime dataHojeManha = hoje.atTime(8, 0);
        LocalDateTime dataHojeNoite = hoje.atTime(22, 0);

        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> RegrasTestDrive.validarData(dataOntem, hoje));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("A data do test-drive não pode estar no passado.", ex.getMessage());

        assertDoesNotThrow(() -> RegrasTestDrive.validarData(dataHojeManha, hoje));
        assertDoesNotThrow(() -> RegrasTestDrive.validarData(dataHojeNoite, hoje));
    }

    @Test
    void deveValidarNumeroCnhCom11Digitos() {
        assertEquals("12345678901", RegrasTestDrive.validarCnhNumero("12345678901"));

        assertThrows(RegraNegocioException.class, () -> RegrasTestDrive.validarCnhNumero("1234567890"));
        assertThrows(RegraNegocioException.class, () -> RegrasTestDrive.validarCnhNumero("123456789012"));
        assertThrows(RegraNegocioException.class, () -> RegrasTestDrive.validarCnhNumero("1234567890A"));
        assertThrows(RegraNegocioException.class, () -> RegrasTestDrive.validarCnhNumero(""));
        assertThrows(RegraNegocioException.class, () -> RegrasTestDrive.validarCnhNumero(null));
    }

    @Test
    void deveRecusarAceiteDesmarcado() {
        assertThrows(RegraNegocioException.class, () -> RegrasTestDrive.validarAceiteTermo(false));
        assertThrows(RegraNegocioException.class, () -> RegrasTestDrive.validarAceiteTermo(null));
        assertDoesNotThrow(() -> RegrasTestDrive.validarAceiteTermo(true));
    }

    @Test
    void deveRecusarCancelamentoSemMotivo_e_ComMenosDe5Caracteres() {
        assertThrows(RegraNegocioException.class, () -> RegrasTestDrive.validarMotivoCancelamento(null));
        assertThrows(RegraNegocioException.class, () -> RegrasTestDrive.validarMotivoCancelamento(""));
        assertThrows(RegraNegocioException.class, () -> RegrasTestDrive.validarMotivoCancelamento("   "));

        RegraNegocioException ex3 = assertThrows(RegraNegocioException.class,
                () -> RegrasTestDrive.validarMotivoCancelamento("abc"));
        assertEquals("Informe o motivo do cancelamento (mínimo de 5 caracteres).", ex3.getMessage());

        RegraNegocioException ex4 = assertThrows(RegraNegocioException.class,
                () -> RegrasTestDrive.validarMotivoCancelamento("abcd"));
        assertEquals("Informe o motivo do cancelamento (mínimo de 5 caracteres).", ex4.getMessage());

        assertEquals("Motivo válido", RegrasTestDrive.validarMotivoCancelamento("Motivo válido"));
        assertEquals("12345", RegrasTestDrive.validarMotivoCancelamento("  12345  "));
    }

    @Test
    void deveDeterminarEstadoDoVeiculoAposCancelamento() {
        // RESERVADO volta a DISPONIVEL
        assertEquals(EstadoVeiculo.DISPONIVEL,
                RegrasTestDrive.determinarEstadoVeiculoAposCancelamento(EstadoVeiculo.RESERVADO));

        // VENDIDO permanece VENDIDO
        assertEquals(EstadoVeiculo.VENDIDO,
                RegrasTestDrive.determinarEstadoVeiculoAposCancelamento(EstadoVeiculo.VENDIDO));

        // EM_MANUTENCAO permanece EM_MANUTENCAO
        assertEquals(EstadoVeiculo.EM_MANUTENCAO,
                RegrasTestDrive.determinarEstadoVeiculoAposCancelamento(EstadoVeiculo.EM_MANUTENCAO));

        // RASCUNHO permanece RASCUNHO
        assertEquals(EstadoVeiculo.RASCUNHO,
                RegrasTestDrive.determinarEstadoVeiculoAposCancelamento(EstadoVeiculo.RASCUNHO));
    }
}
