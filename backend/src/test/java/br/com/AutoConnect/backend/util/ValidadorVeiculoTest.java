package br.com.AutoConnect.backend.util;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.EstadoVeiculo;

class ValidadorVeiculoTest {

    @Test
    void deveAceitarPlacaMercosulValida() {
        assertEquals("ABC1D23", ValidadorVeiculo.validarPlaca("ABC1D23"));
        assertEquals("ABC1D23", ValidadorVeiculo.validarPlaca("abc1d23"));
    }

    @Test
    void deveAceitarPlacaAntigaValida() {
        assertEquals("ABC-1234", ValidadorVeiculo.validarPlaca("ABC-1234"));
        assertEquals("ABC-1234", ValidadorVeiculo.validarPlaca("abc-1234"));
    }

    @Test
    void deveRecusarPlacasInvalidas() {
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarPlaca("ABC12345"));
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarPlaca("AB1D234"));
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarPlaca(""));
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarPlaca("   "));
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarPlaca(null));
    }

    @Test
    void deveAceitarChassiValido() {
        String chassiValido = "9BWZZZ377VT004251";
        assertEquals(chassiValido, ValidadorVeiculo.validarChassi(chassiValido));
        assertEquals(chassiValido, ValidadorVeiculo.validarChassi("9bwzzz377vt004251"));
    }

    @Test
    void deveRecusarChassiComMenosDe17Caracteres() {
        RegraNegocioException ex = assertThrows(RegraNegocioException.class,
                () -> ValidadorVeiculo.validarChassi("9BWZZZ377VT00425"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void deveRecusarChassiComLetrasProibidas() {
        // Letra I
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarChassi("9BWZZZ377VT00425I"));
        // Letra O
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarChassi("9BWZZZ377VT00425O"));
        // Letra Q
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarChassi("9BWZZZ377VT00425Q"));
    }

    @Test
    void deveRecusarChassiComSimbolosOuVazio() {
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarChassi("9BWZZZ377VT0042-1"));
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarChassi(""));
        assertThrows(RegraNegocioException.class, () -> ValidadorVeiculo.validarChassi(null));
    }

    @Test
    void deveValidarRegraDeAtivacao() {
        // Válido: RASCUNHO com 2 fotos
        assertDoesNotThrow(() -> ValidadorVeiculo.validarAtivacao(EstadoVeiculo.RASCUNHO, 2));

        // Válido: RASCUNHO com 10 fotos
        assertDoesNotThrow(() -> ValidadorVeiculo.validarAtivacao(EstadoVeiculo.RASCUNHO, 10));

        // Inválido: RASCUNHO com 1 foto
        RegraNegocioException ex1 = assertThrows(RegraNegocioException.class,
                () -> ValidadorVeiculo.validarAtivacao(EstadoVeiculo.RASCUNHO, 1));
        assertEquals("O veículo precisa de 2 a 10 fotos válidas para ser ativado (tem 1).", ex1.getMessage());

        // Inválido: RASCUNHO com 11 fotos
        RegraNegocioException ex11 = assertThrows(RegraNegocioException.class,
                () -> ValidadorVeiculo.validarAtivacao(EstadoVeiculo.RASCUNHO, 11));
        assertEquals("O veículo precisa de 2 a 10 fotos válidas para ser ativado (tem 11).", ex11.getMessage());

        // Inválido: estado diferente de RASCUNHO
        assertThrows(RegraNegocioException.class,
                () -> ValidadorVeiculo.validarAtivacao(EstadoVeiculo.DISPONIVEL, 3));
    }
}
