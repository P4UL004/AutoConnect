package br.com.AutoConnect.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.AutoConnect.backend.model.EstadoOrdemServico;
import br.com.AutoConnect.backend.model.OrdemServico;
import jakarta.persistence.LockModeType;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT os FROM OrdemServico os WHERE os.id = :id")
    Optional<OrdemServico> findByIdComLock(@Param("id") Long id);

    // Listagem sem filtro de estado
    Page<OrdemServico> findAllByOrderByDataCriacaoDesc(Pageable pageable);

    // Listagem por estado
    Page<OrdemServico> findByEstadoOrderByDataCriacaoDesc(EstadoOrdemServico estado, Pageable pageable);

    // Listagem por cliente (CLIENTE vê só as suas)
    Page<OrdemServico> findByClienteIdOrderByDataCriacaoDesc(Long clienteId, Pageable pageable);

    // Listagem por cliente + estado
    Page<OrdemServico> findByClienteIdAndEstadoOrderByDataCriacaoDesc(
            Long clienteId, EstadoOrdemServico estado, Pageable pageable);

    // Para geração do número: busca todas as OS do mesmo ano (via dataCriacao)
    @Query("SELECT COUNT(os) FROM OrdemServico os WHERE YEAR(os.dataCriacao) = :ano")
    long contarPorAno(@Param("ano") int ano);

    // Lista OS por ids (para filtros extras se necessário)
    List<OrdemServico> findByClienteId(Long clienteId);
}
