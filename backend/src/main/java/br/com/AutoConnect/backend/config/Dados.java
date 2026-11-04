package br.com.AutoConnect.backend.config;


import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.AutoConnect.backend.model.Perfil;
import br.com.AutoConnect.backend.model.Usuario;
import br.com.AutoConnect.backend.repository.UsuarioRepository;

@Configuration
public class Dados {

    @Bean
    CommandLineRunner criarUsuariosDeTeste(UsuarioRepository repository,
                                           PasswordEncoder encoder) {
        return args -> {
            criarSeNaoExistir(repository, encoder, "Administrador",
                    "admin@autoconnect.com", "admin123", Perfil.ADMINISTRADOR);
            criarSeNaoExistir(repository, encoder, "Consultor de Vendas",
                    "vendas@autoconnect.com", "vendas123", Perfil.CONSULTOR_VENDAS);
            criarSeNaoExistir(repository, encoder, "Consultor Tecnico",
                    "tecnico@autoconnect.com", "tecnico123", Perfil.CONSULTOR_TECNICO);
            criarSeNaoExistir(repository, encoder, "Cliente Teste",
                    "cliente@autoconnect.com", "cliente123", Perfil.CLIENTE);
        };
    }

    private void criarSeNaoExistir(UsuarioRepository repository,
                                   PasswordEncoder encoder,
                                   String nome, String email,
                                   String senha, Perfil perfil) {
        if (repository.existsByEmail(email)) {
            return;
        }
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha(encoder.encode(senha));
        usuario.setPerfil(perfil);
        repository.save(usuario);
    }
}
