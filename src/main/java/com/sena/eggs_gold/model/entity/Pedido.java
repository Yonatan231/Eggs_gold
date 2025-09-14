package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.EstadoPedido;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad JPA para la tabla pedidos
 */
@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PEDIDOS")
    private Integer idPedidos;

    @Column(name = "DIRECCION", nullable = false, length = 120)
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoPedido estado;

    @Column(name = "FECHA_CREACION", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "TOTAL", nullable = false)
    private BigDecimal total;


    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    private List<Venta> ventas = new ArrayList<>();


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USUARIOS_ID", nullable = false)
    private Usuario usuario;
}
