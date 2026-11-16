package br.com.AutoConnect.backend.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.AutoConnect.backend.dto.CadastroRequest;
import br.com.AutoConnect.backend.dto.LoginRequest;
import br.com.AutoConnect.backend.dto.LoginResponse;
import br.com.AutoConnect.backend.model.Usuario;
import br.com.AutoConnect.backend.repository.UsuarioRepository;
import br.com.AutoConnect.backend.security.JwtService;
import br.com.AutoConnect.backend.service.CadastroService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CadastroService cadastroService;

    public AuthController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          CadastroService cadastroService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.cadastroService = cadastroService;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody CadastroRequest dados) {
        cadastroService.cadastrar(dados);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensagem", "Cadastro realizado com sucesso."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest dados) {
        Optional<Usuario> encontrado = usuarioRepository.findByEmail(dados.email());

        if (encontrado.isEmpty()
                || !passwordEncoder.matches(dados.senha(), encontrado.get().getSenha())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensagem", "E-mail ou senha invalidos"));
        }

        Usuario usuario = encontrado.get();
        String token = jwtService.gerarToken(usuario);

        return ResponseEntity.ok(new LoginResponse(
                token, usuario.getNome(), usuario.getPerfil().name()));
    }
}