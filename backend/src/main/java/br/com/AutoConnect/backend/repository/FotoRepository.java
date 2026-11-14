package br.com.AutoConnect.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.AutoConnect.backend.model.DonoFoto;
import br.com.AutoConnect.backend.model.Foto;

public interface FotoRepository extends JpaRepository<Foto, Long> {

    List<Foto> findByDonoTipoAndDonoIdOrderByDataEnvioAsc(DonoFoto donoTipo, Long donoId);

    long countByDonoTipoAndDonoId(DonoFoto donoTipo, Long donoId);

    Optional<Foto> findByNomeArquivo(String nomeArquivo);

    Optional<Foto> findByIdAndDonoTipoAndDonoId(Long id, DonoFoto donoTipo, Long donoId);
}
