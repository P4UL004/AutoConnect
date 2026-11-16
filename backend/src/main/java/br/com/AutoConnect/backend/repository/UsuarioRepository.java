package br.com.AutoConnect.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.AutoConnect.backend.model.Perfil;
import br.com.AutoConnect.backend.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByDocumento(String documento);

    List<Usuario> findByPerfilOrderByNomeAsc(Perfil perfil);
}
