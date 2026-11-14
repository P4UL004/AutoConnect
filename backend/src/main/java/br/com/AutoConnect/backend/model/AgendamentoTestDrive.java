package br.com.AutoConnect.backend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "agendamentos_test_drive")
public class AgendamentoTestDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "veiculo_id", nullable = false)
    private Veiculo veiculo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Column(nullable = false, length = 11)
    private String cnhNumero;

    @Column(nullable = false, length = 5)
    private String cnhCategoria;

    @Column(nullable = false)
    private LocalDate cnhValidade;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String termoTexto;

    @Column(nullable = false)
    private String aceitoPor;

    @Column(nullable = false)
    private LocalDateTime aceitoEm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoAgendamento estado;

    @Column(nullable = false)
    private String criadoPor;

    @Column(nullable = false)
    private LocalDateTime dataCriacao;

    @Column(length = 1000)
    private String motivoCancelamento;

    private String canceladoPor;

    private LocalDateTime canceladoEm;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Veiculo getVeiculo() {
        return veiculo;
    }

    public void setVeiculo(Veiculo veiculo) {
        this.veiculo = veiculo;
    }

    public Usuario getCliente() {
        return cliente;
    }

    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public String getCnhNumero() {
        return cnhNumero;
    }

    public void setCnhNumero(String cnhNumero) {
        this.cnhNumero = cnhNumero;
    }

    public String getCnhCategoria() {
        return cnhCategoria;
    }

    public void setCnhCategoria(String cnhCategoria) {
        this.cnhCategoria = cnhCategoria;
    }

    public LocalDate getCnhValidade() {
        return cnhValidade;
    }

    public void setCnhValidade(LocalDate cnhValidade) {
        this.cnhValidade = cnhValidade;
    }

    public String getTermoTexto() {
        return termoTexto;
    }

    public void setTermoTexto(String termoTexto) {
        this.termoTexto = termoTexto;
    }

    public String getAceitoPor() {
        return aceitoPor;
    }

    public void setAceitoPor(String aceitoPor) {
        this.aceitoPor = aceitoPor;
    }

    public LocalDateTime getAceitoEm() {
        return aceitoEm;
    }

    public void setAceitoEm(LocalDateTime aceitoEm) {
        this.aceitoEm = aceitoEm;
    }

    public EstadoAgendamento getEstado() {
        return estado;
    }

    public void setEstado(EstadoAgendamento estado) {
        this.estado = estado;
    }

    public String getCriadoPor() {
        return criadoPor;
    }

    public void setCriadoPor(String criadoPor) {
        this.criadoPor = criadoPor;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public String getMotivoCancelamento() {
        return motivoCancelamento;
    }

    public void setMotivoCancelamento(String motivoCancelamento) {
        this.motivoCancelamento = motivoCancelamento;
    }

    public String getCanceladoPor() {
        return canceladoPor;
    }

    public void setCanceladoPor(String canceladoPor) {
        this.canceladoPor = canceladoPor;
    }

    public LocalDateTime getCanceladoEm() {
        return canceladoEm;
    }

    public void setCanceladoEm(LocalDateTime canceladoEm) {
        this.canceladoEm = canceladoEm;
    }
}
