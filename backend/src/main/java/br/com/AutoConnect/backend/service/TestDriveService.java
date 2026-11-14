package br.com.AutoConnect.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.AutoConnect.backend.dto.AgendamentoRequest;
import br.com.AutoConnect.backend.dto.AgendamentoResponse;
import br.com.AutoConnect.backend.dto.CancelarAgendamentoRequest;
import br.com.AutoConnect.backend.exception.RegraNegocioException;
import br.com.AutoConnect.backend.model.AgendamentoTestDrive;
import br.com.AutoConnect.backend.model.EstadoAgendamento;
import br.com.AutoConnect.backend.model.EstadoVeiculo;
import br.com.AutoConnect.backend.model.Perfil;
import br.com.AutoConnect.backend.model.Usuario;
import br.com.AutoConnect.backend.model.Veiculo;
import br.com.AutoConnect.backend.repository.AgendamentoTestDriveRepository;
import br.com.AutoConnect.backend.repository.UsuarioRepository;
import br.com.AutoConnect.backend.repository.VeiculoRepository;
import br.com.AutoConnect.backend.util.RegrasTestDrive;

@Service
public class TestDriveService {

    private static final Logger logger = LoggerFactory.getLogger(TestDriveService.class);

    private final AgendamentoTestDriveRepository agendamentoRepository;
    private final VeiculoRepository veiculoRepository;
    private final UsuarioRepository usuarioRepository;

    public TestDriveService(AgendamentoTestDriveRepository agendamentoRepository,
                            VeiculoRepository veiculoRepository,
                            UsuarioRepository usuarioRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.veiculoRepository = veiculoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public AgendamentoResponse agendar(AgendamentoRequest request, String emailUsuarioLogado) {
        long inicio = System.currentTimeMillis();

        if (request == null) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Dados do agendamento não informados.");
        }

        Usuario usuarioLogado = usuarioRepository.findByEmail(emailUsuarioLogado)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado."));

        // a) Veículo existe (404) e está DISPONÍVEL (409) - com lock pessimista para evitar concorrência
        if (request.veiculoId() == null) {
            throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "O veículo é obrigatório.");
        }

        Veiculo veiculo = veiculoRepository.findByIdComLock(request.veiculoId())
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Veículo não encontrado."));

        if (veiculo.getEstado() != EstadoVeiculo.DISPONIVEL) {
            throw new RegraNegocioException(HttpStatus.CONFLICT, "O veículo não está disponível para test-drive.");
        }

        // b) Cliente existe e tem perfil CLIENTE
        Usuario cliente;
        if (usuarioLogado.getPerfil() == Perfil.CLIENTE) {
            cliente = usuarioLogado;
        } else {
            if (request.clienteId() == null) {
                throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Selecione um cliente válido.");
            }
            cliente = usuarioRepository.findById(request.clienteId())
                    .orElseThrow(() -> new RegraNegocioException(HttpStatus.BAD_REQUEST, "Selecione um cliente válido."));

            if (cliente.getPerfil() != Perfil.CLIENTE) {
                throw new RegraNegocioException(HttpStatus.BAD_REQUEST, "Selecione um cliente válido.");
            }
        }

        // c) Data e hora de hoje ou futura
        RegrasTestDrive.validarData(request.dataHora());

        // d) CNH com 11 dígitos
        String cnhNumero = RegrasTestDrive.validarCnhNumero(request.cnhNumero());

        // e) RN01: categoria B, C, D ou E
        String cnhCategoria = RegrasTestDrive.validarCnhCategoria(request.cnhCategoria());

        // f) RN01: validade da CNH não anterior à data do test-drive
        RegrasTestDrive.validarCnhValidade(request.cnhValidade(), request.dataHora().toLocalDate());

        // g) Aceite do termo obrigatório
        RegrasTestDrive.validarAceiteTermo(request.aceiteTermo());

        // Grava agendamento e altera veículo para RESERVADO na mesma transação
        AgendamentoTestDrive agendamento = new AgendamentoTestDrive();
        agendamento.setVeiculo(veiculo);
        agendamento.setCliente(cliente);
        agendamento.setDataHora(request.dataHora());
        agendamento.setCnhNumero(cnhNumero);
        agendamento.setCnhCategoria(cnhCategoria);
        agendamento.setCnhValidade(request.cnhValidade());
        agendamento.setTermoTexto(RegrasTestDrive.TEXTO_TERMO);
        agendamento.setAceitoPor(usuarioLogado.getNome());
        agendamento.setAceitoEm(LocalDateTime.now());
        agendamento.setEstado(EstadoAgendamento.AGENDADO);
        agendamento.setCriadoPor(usuarioLogado.getEmail());
        agendamento.setDataCriacao(LocalDateTime.now());

        AgendamentoTestDrive salvo = agendamentoRepository.save(agendamento);

        veiculo.setEstado(EstadoVeiculo.RESERVADO);
        veiculoRepository.save(veiculo);

        long tempoGasto = System.currentTimeMillis() - inicio;
        logger.info("Agendamento de test-drive {} realizado em {} ms", salvo.getId(), tempoGasto);

        return converterParaResponse(salvo);
    }

    public List<AgendamentoResponse> listar(EstadoAgendamento estado, String emailUsuarioLogado) {
        Usuario usuarioLogado = usuarioRepository.findByEmail(emailUsuarioLogado)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado."));

        List<AgendamentoTestDrive> lista;

        if (usuarioLogado.getPerfil() == Perfil.CLIENTE) {
            if (estado != null) {
                lista = agendamentoRepository.findByClienteIdAndEstadoOrderByDataHoraDesc(usuarioLogado.getId(), estado);
            } else {
                lista = agendamentoRepository.findByClienteIdOrderByDataHoraDesc(usuarioLogado.getId());
            }
        } else {
            if (estado != null) {
                lista = agendamentoRepository.findByEstadoOrderByDataHoraDesc(estado);
            } else {
                lista = agendamentoRepository.findAllByOrderByDataHoraDesc();
            }
        }

        return lista.stream().map(this::converterParaResponse).toList();
    }

    public AgendamentoResponse buscarPorId(Long id, String emailUsuarioLogado) {
        AgendamentoTestDrive agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Agendamento não encontrado."));

        Usuario usuarioLogado = usuarioRepository.findByEmail(emailUsuarioLogado)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado."));

        if (usuarioLogado.getPerfil() == Perfil.CLIENTE
                && !agendamento.getCliente().getId().equals(usuarioLogado.getId())) {
            throw new RegraNegocioException(HttpStatus.FORBIDDEN, "Acesso negado.");
        }

        return converterParaResponse(agendamento);
    }

    @Transactional
    public AgendamentoResponse cancelar(Long id, CancelarAgendamentoRequest request, String emailUsuarioLogado) {
        AgendamentoTestDrive agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.NOT_FOUND, "Agendamento não encontrado."));

        Usuario usuarioLogado = usuarioRepository.findByEmail(emailUsuarioLogado)
                .orElseThrow(() -> new RegraNegocioException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado."));

        if (usuarioLogado.getPerfil() == Perfil.CLIENTE
                && !agendamento.getCliente().getId().equals(usuarioLogado.getId())) {
            throw new RegraNegocioException(HttpStatus.FORBIDDEN, "Acesso negado.");
        }

        if (agendamento.getEstado() != EstadoAgendamento.AGENDADO) {
            throw new RegraNegocioException(HttpStatus.CONFLICT,
                    "Apenas agendamentos no estado Agendado podem ser cancelados.");
        }

        String motivo = RegrasTestDrive.validarMotivoCancelamento(request != null ? request.motivo() : null);

        agendamento.setMotivoCancelamento(motivo);
        agendamento.setCanceladoPor(usuarioLogado.getEmail());
        agendamento.setCanceladoEm(LocalDateTime.now());
        agendamento.setEstado(EstadoAgendamento.CANCELADO);
        AgendamentoTestDrive atualizado = agendamentoRepository.save(agendamento);

        // Devolve o veículo para DISPONIVEL somente se ainda estiver RESERVADO
        Veiculo veiculo = agendamento.getVeiculo();
        EstadoVeiculo novoEstado = RegrasTestDrive.determinarEstadoVeiculoAposCancelamento(veiculo.getEstado());
        if (novoEstado != veiculo.getEstado()) {
            veiculo.setEstado(novoEstado);
            veiculoRepository.save(veiculo);
        }

        return converterParaResponse(atualizado);
    }

    private AgendamentoResponse converterParaResponse(AgendamentoTestDrive ag) {
        return new AgendamentoResponse(
                ag.getId(),
                ag.getVeiculo().getId(),
                ag.getVeiculo().getModelo(),
                ag.getVeiculo().getPlaca(),
                ag.getCliente().getId(),
                ag.getCliente().getNome(),
                ag.getCliente().getEmail(),
                ag.getDataHora(),
                ag.getCnhNumero(),
                ag.getCnhCategoria(),
                ag.getCnhValidade(),
                ag.getTermoTexto(),
                ag.getAceitoPor(),
                ag.getAceitoEm(),
                ag.getEstado(),
                ag.getCriadoPor(),
                ag.getDataCriacao(),
                ag.getMotivoCancelamento(),
                ag.getCanceladoPor(),
                ag.getCanceladoEm()
        );
    }
}
