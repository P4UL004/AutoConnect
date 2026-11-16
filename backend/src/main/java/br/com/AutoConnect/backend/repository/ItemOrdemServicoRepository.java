package br.com.AutoConnect.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.AutoConnect.backend.model.ItemOrdemServico;

public interface ItemOrdemServicoRepository extends JpaRepository<ItemOrdemServico, Long> {

    List<ItemOrdemServico> findByOsId(Long osId);

    void deleteByOsId(Long osId);
}
