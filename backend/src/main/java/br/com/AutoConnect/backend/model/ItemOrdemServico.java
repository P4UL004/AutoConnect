package br.com.AutoConnect.backend.model;

import java.math.BigDecimal;

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
import jakarta.persistence.Table;

@Entity
@Table(name = "itens_ordem_servico")
public class ItemOrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "os_id", nullable = false)
    private OrdemServico os;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoItemOs tipo;

    @Column(nullable = false, length = 500)
    private String descricao;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valorUnitario;

    // Getters e setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public OrdemServico getOs() { return os; }
    public void setOs(OrdemServico os) { this.os = os; }

    public TipoItemOs getTipo() { return tipo; }
    public void setTipo(TipoItemOs tipo) { this.tipo = tipo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }

    public BigDecimal getValorUnitario() { return valorUnitario; }
    public void setValorUnitario(BigDecimal valorUnitario) { this.valorUnitario = valorUnitario; }
}
