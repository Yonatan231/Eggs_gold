package com.sena.eggs_gold.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sena.eggs_gold.model.enums.EstadoInventario;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad JPA para la tabla inventario
 */
@Entity
@Table(name = "inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_INVENTARIO")
    private Integer idInventario;

    @Column(name = "CANTIDAD_DISPONIBLE", nullable = false)
    private Integer cantidadDisponible;

    @Column(name = "UBICACION", nullable = false, length = 120)
    private String ubicacion;

    @Column(name = "FECHA_CADUCIDAD", nullable = false)
    private LocalDate fechaCaducidad;

    @Column(name = "FECHA_ACTUALIZACION", nullable = false)
    private LocalDateTime fechaActualizacion;

    @Enumerated(EnumType.STRING)
    @Column(name= "ESTADO")
    private EstadoInventario estado;

    // Relación JPA - Many to One (muchos registros de inventario pueden ser del mismo producto)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCTOS_ID", nullable = false)
    private Producto producto;
}