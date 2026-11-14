package br.com.AutoConnect.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.AutoConnect.backend.dto.AgendamentoRequest;
import br.com.AutoConnect.backend.dto.AgendamentoResponse;
import br.com.AutoConnect.backend.dto.CancelarAgendamentoRequest;
import br.com.AutoConnect.backend.dto.TermoResponse;
import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.EstadoAgendamento;
import br.com.AutoConnect.backend.service.TestDriveService;
import br.com.AutoConnect.backend.util.RegrasTestDrive;

@RestController
@RequestMapping("/api/test-drives")
public class TestDriveController {

    private final TestDriveService testDriveService;

    public TestDriveController(TestDriveService testDriveService) {
        this.testDriveService = testDriveService;
    }

    @GetMapping("/termo")
    public ResponseEntity<TermoResponse> obterTermo() {
        return ResponseEntity.ok(new TermoResponse(RegrasTestDrive.TEXTO_TERMO));
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponse> agendar(
            @RequestBody AgendamentoRequest request,
            Authentication authentication) {
        AgendamentoResponse response = testDriveService.agendar(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AgendamentoResponse>> listar(
            @RequestParam(required = false) String estado,
            Authentication authentication) {

        EstadoAgendamento estadoEnum = null;
        if (estado != null && !estado.trim().isEmpty()) {
            try {
                estadoEnum = EstadoAgendamento.valueOf(estado.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Estado de agendamento inválido.");
            }
        }

        return ResponseEntity.ok(testDriveService.listar(estadoEnum, authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgendamentoResponse> buscarPorId(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(testDriveService.buscarPorId(id, authentication.getName()));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<AgendamentoResponse> cancelar(
            @PathVariable Long id,
            @RequestBody(required = false) CancelarAgendamentoRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(testDriveService.cancelar(id, request, authentication.getName()));
    }
}
