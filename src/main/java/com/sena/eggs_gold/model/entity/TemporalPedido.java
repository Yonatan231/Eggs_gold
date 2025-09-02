package com.sena.eggs_gold.model.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA para la tabla temporal_pedidos
 * Representa pedidos temporales o carrito de compras
 */
@Entity
@Table(name = "temporal_pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemporalPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "confirmado", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean confirmado = false;

    @Column(name = "fecha", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fecha;

    // Relaciones JPA - Many to One (muchos pedidos temporales pueden ser del mismo usuario)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Many to One (muchos pedidos temporales pueden incluir el mismo producto)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @PrePersist
    protected void onCreate() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
        if (confirmado == null) {
            confirmado = false;
        }
    }
}