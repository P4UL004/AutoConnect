package br.com.AutoConnect.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "ordens_servico")
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Número único gerado após o primeiro save (formato OS-AAAA-000001)
    @Column(unique = true)
    private String numero;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "veiculo_id", nullable = false)
    private Veiculo veiculo;

    @Column(nullable = false, length = 2000)
    private String relatoSintomas;

    @Column(length = 2000)
    private String checklistAvarias;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoOrdemServico estado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "criada_por_id", nullable = false)
    private Usuario criadaPor;

    @Column(nullable = false)
    private LocalDateTime dataCriacao;

    // Preenchido quando a OS sai de RASCUNHO para ABERTA
    private LocalDateTime dataAbertura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprovada_por_id")
    private Usuario aprovadaPor;

    private LocalDateTime aprovadaEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "qualidade_validada_por_id")
    private Usuario qualidadeValidadaPor;

    private LocalDateTime qualidadeValidadaEm;

    private LocalDateTime finalizadaEm;

    @OneToMany(mappedBy = "os", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ItemOrdemServico> itens = new ArrayList<>();

    // Getters e setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public Usuario getCliente() { return cliente; }
    public void setCliente(Usuario cliente) { this.cliente = cliente; }

    public Veiculo getVeiculo() { return veiculo; }
    public void setVeiculo(Veiculo veiculo) { this.veiculo = veiculo; }

    public String getRelatoSintomas() { return relatoSintomas; }
    public void setRelatoSintomas(String relatoSintomas) { this.relatoSintomas = relatoSintomas; }

    public String getChecklistAvarias() { return checklistAvarias; }
    public void setChecklistAvarias(String checklistAvarias) { this.checklistAvarias = checklistAvarias; }

    public EstadoOrdemServico getEstado() { return estado; }
    public void setEstado(EstadoOrdemServico estado) { this.estado = estado; }

    public Usuario getCriadaPor() { return criadaPor; }
    public void setCriadaPor(Usuario criadaPor) { this.criadaPor = criadaPor; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public LocalDateTime getDataAbertura() { return dataAbertura; }
    public void setDataAbertura(LocalDateTime dataAbertura) { this.dataAbertura = dataAbertura; }

    public Usuario getAprovadaPor() { return aprovadaPor; }
    public void setAprovadaPor(Usuario aprovadaPor) { this.aprovadaPor = aprovadaPor; }

    public LocalDateTime getAprovadaEm() { return aprovadaEm; }
    public void setAprovadaEm(LocalDateTime aprovadaEm) { this.aprovadaEm = aprovadaEm; }

    public Usuario getQualidadeValidadaPor() { return qualidadeValidadaPor; }
    public void setQualidadeValidadaPor(Usuario qualidadeValidadaPor) { this.qualidadeValidadaPor = qualidadeValidadaPor; }

    public LocalDateTime getQualidadeValidadaEm() { return qualidadeValidadaEm; }
    public void setQualidadeValidadaEm(LocalDateTime qualidadeValidadaEm) { this.qualidadeValidadaEm = qualidadeValidadaEm; }

    public LocalDateTime getFinalizadaEm() { return finalizadaEm; }
    public void setFinalizadaEm(LocalDateTime finalizadaEm) { this.finalizadaEm = finalizadaEm; }

    public List<ItemOrdemServico> getItens() { return itens; }
    public void setItens(List<ItemOrdemServico> itens) { this.itens = itens; }
}
