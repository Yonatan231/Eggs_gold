package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.EstadoPedido;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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
    private Float total;

    // Relaciones JPA - Many to One (muchos pedidos pueden estar asociados a la misma venta)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VENTAS_ID_VENTAS_CLIENTE", nullable = false)
    private Venta venta;

    // Many to One (muchos pedidos pueden ser gestionados por el mismo usuario)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USUARIOS_ID_USUARIOS", nullable = false)
    private Usuario usuario;
}
