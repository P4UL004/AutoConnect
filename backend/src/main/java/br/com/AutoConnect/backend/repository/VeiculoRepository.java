package br.com.AutoConnect.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.AutoConnect.backend.model.EstadoVeiculo;
import br.com.AutoConnect.backend.model.Veiculo;
import jakarta.persistence.LockModeType;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {

    boolean existsByPlaca(String placa);

    boolean existsByChassi(String chassi);

    boolean existsByPlacaAndIdNot(String placa, Long id);

    boolean existsByChassiAndIdNot(String chassi, Long id);

    Page<Veiculo> findByEstadoAndPlacaContainingIgnoreCaseOrderByDataCadastroDesc(
            EstadoVeiculo estado, String placa, Pageable pageable);

    Page<Veiculo> findByEstadoOrderByDataCadastroDesc(
            EstadoVeiculo estado, Pageable pageable);

    Page<Veiculo> findByPlacaContainingIgnoreCaseOrderByDataCadastroDesc(
            String placa, Pageable pageable);

    Page<Veiculo> findAllByOrderByDataCadastroDesc(Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Veiculo v WHERE v.id = :id")
    Optional<Veiculo> findByIdComLock(@Param("id") Long id);
}
