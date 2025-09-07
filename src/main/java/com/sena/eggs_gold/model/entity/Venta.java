package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.EstadoVenta;
import com.sena.eggs_gold.model.enums.MetodoPago;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA para la tabla ventas
 */
@Entity
@Table(name = "ventas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_VENTAS")
    private Integer idVentas;

    @Column(name = "FECHA", nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(name = "METODO_PAGO", nullable = false)
    private MetodoPago metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoVenta estado;

    // Relaciones JPA - Many to One (muchas ventas pueden ser del mismo cliente)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USUARIOS_ID_USUARIOS_CLIENTE", nullable = false)
    private Usuario cliente;

    // Many to One (muchas ventas pueden usar el mismo vehículo)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VEHICULOS_ID_VEHICULOS", nullable = false)
    private Vehiculo vehiculo;
}