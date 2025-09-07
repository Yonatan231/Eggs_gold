package com.sena.eggs_gold.model.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Entidad JPA para la tabla rutas_completas
 */
@Entity
@Table(name = "rutas_completas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RutaCompletada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_RUTAS_COMPLETADAS")
    private Integer idRutasCompletadas;

    @Column(name = "FECHA", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "DISTANCIA", nullable = false)
    private Float distancia;

    @Column(name = "DURACION", nullable = false)
    private LocalTime duracion;

    @Column(name = "TARIFA_KM", nullable = false)
    private Float tarifaKm;

    @Column(name = "TOTAL", nullable = false)
    private Float total;

    // Relaciones JPA - Many to One (muchas rutas pueden usar la misma venta)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VENTAS_ID_VENTAS", nullable = false)
    private Venta venta;

    // Many to One (muchas rutas pueden usar el mismo vehículo)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VEHICULOS_ID_VEHICULOS", nullable = false)
    private Vehiculo vehiculo;


}
