package br.com.AutoConnect.backend.controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SessaoController {

    @GetMapping("/me")
    public Map<String, String> eu(Authentication autenticacao) {
        String perfil = autenticacao.getAuthorities().iterator().next()
                .getAuthority().replace("ROLE_", "");
        return Map.of("email", autenticacao.getName(), "perfil", perfil);
    }

    @GetMapping("/admin/ping")
    public Map<String, String> pingAdmin() {
        return Map.of("mensagem", "ok, voce e administrador");
    }
}