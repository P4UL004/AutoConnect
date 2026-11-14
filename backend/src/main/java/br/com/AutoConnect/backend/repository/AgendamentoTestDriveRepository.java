package br.com.AutoConnect.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.AutoConnect.backend.model.AgendamentoTestDrive;
import br.com.AutoConnect.backend.model.EstadoAgendamento;

public interface AgendamentoTestDriveRepository extends JpaRepository<AgendamentoTestDrive, Long> {

    List<AgendamentoTestDrive> findByClienteIdOrderByDataHoraDesc(Long clienteId);

    List<AgendamentoTestDrive> findByClienteIdAndEstadoOrderByDataHoraDesc(Long clienteId, EstadoAgendamento estado);

    List<AgendamentoTestDrive> findAllByOrderByDataHoraDesc();

    List<AgendamentoTestDrive> findByEstadoOrderByDataHoraDesc(EstadoAgendamento estado);
}
