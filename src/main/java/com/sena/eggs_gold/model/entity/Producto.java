package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.Categoria;
import com.sena.eggs_gold.model.enums.EstadoProducto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

/**
 * Entidad JPA para la tabla productos
 */
@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PRODUCTOS")
    private Integer idProducto;

    @Column(name = "NOMBRE", nullable = false, length = 45)
    private String nombre;

    @Column(name = "PRECIO", nullable = false)
    private Float precio;

    @Enumerated(EnumType.STRING)
    @Column(name = "CATEGORIA", nullable = false)
    private Categoria categoria;

    @Column(name = "DESCRIPCION", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoProducto estado;

    @Column(name = "CANTIDAD", length = 255)
    private Integer cantidad;

    @Column(name = "imagen", nullable = false, length = 255)
    private String imagen;
}
