package br.com.AutoConnect.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.AutoConnect.backend.dto.ClienteResponse;
import br.com.AutoConnect.backend.model.Perfil;
import br.com.AutoConnect.backend.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final UsuarioRepository usuarioRepository;

    public ClienteController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponse>> listarClientes() {
        List<ClienteResponse> lista = usuarioRepository.findByPerfilOrderByNomeAsc(Perfil.CLIENTE)
                .stream()
                .map(u -> new ClienteResponse(u.getId(), u.getNome(), u.getEmail()))
                .toList();
        return ResponseEntity.ok(lista);
    }
}
