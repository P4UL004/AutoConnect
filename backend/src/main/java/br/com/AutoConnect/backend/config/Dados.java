package br.com.AutoConnect.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.AutoConnect.backend.model.Perfil;
import br.com.AutoConnect.backend.model.TipoPessoa;
import br.com.AutoConnect.backend.model.Usuario;
import br.com.AutoConnect.backend.repository.UsuarioRepository;

@Configuration
public class Dados {

    @Bean
    CommandLineRunner criarUsuariosDeTeste(UsuarioRepository repository,
                                           PasswordEncoder encoder) {
        return args -> {
            garantirUsuario(repository, encoder, "Administrador",
                    "admin@autoconnect.com", "admin123", Perfil.ADMINISTRADOR, null, null);
            garantirUsuario(repository, encoder, "Consultor de Vendas",
                    "vendas@autoconnect.com", "vendas123", Perfil.CONSULTOR_VENDAS, null, null);
            garantirUsuario(repository, encoder, "Consultor Tecnico",
                    "tecnico@autoconnect.com", "tecnico123", Perfil.CONSULTOR_TECNICO, null, null);
            // Cliente pessoa fisica (CPF de teste valido)
            garantirUsuario(repository, encoder, "Cliente Teste",
                    "cliente@autoconnect.com", "cliente123", Perfil.CLIENTE,
                    TipoPessoa.PF, "52998224725");
            // Cliente pessoa juridica (CNPJ de teste valido)
            garantirUsuario(repository, encoder, "Empresa Teste Ltda",
                    "cliente2@autoconnect.com", "cliente123", Perfil.CLIENTE,
                    TipoPessoa.PJ, "11222333000181");
        };
    }

    private void garantirUsuario(UsuarioRepository repository,
                                 PasswordEncoder encoder,
                                 String nome, String email, String senha,
                                 Perfil perfil, TipoPessoa tipo, String documento) {
        Usuario usuario = repository.findByEmail(email).orElse(null);

        if (usuario == null) {
            usuario = new Usuario();
            usuario.setNome(nome);
            usuario.setEmail(email);
            usuario.setSenha(encoder.encode(senha));
            usuario.setPerfil(perfil);
        } else if (tipo == null || usuario.getTipoPessoa() != null) {
            return;
        }

        // Cliente de teste criado em versao anterior: completa tipo e documento
        if (tipo != null && usuario.getTipoPessoa() == null) {
            usuario.setTipoPessoa(tipo);
            usuario.setDocumento(documento);
        }
        repository.save(usuario);
    }
}
