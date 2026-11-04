package br.com.AutoConnect.backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import br.com.AutoConnect.backend.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
}
