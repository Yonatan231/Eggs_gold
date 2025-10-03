package com.sena.eggs_gold.dto;

import com.sena.eggs_gold.model.entity.Inventario;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InventarioDTO {
    private Integer idInventario;
    private Integer productoId;
    private String nombreProducto;
    private int cantidadDisponible;
    private String ubicacion;
    private LocalDate fechaCaducidad;
    private LocalDateTime fechaActualizacion;

    public InventarioDTO(Inventario inventario) {
        this.idInventario = inventario.getIdInventario();
        this.productoId = inventario.getProducto() != null ? inventario.getProducto().getIdProducto() : null;
        this.nombreProducto = inventario.getProducto() != null ? inventario.getProducto().getNombre() : null;
        this.cantidadDisponible = inventario.getCantidadDisponible();
        this.ubicacion = inventario.getUbicacion();
        this.fechaCaducidad = inventario.getFechaCaducidad();
        this.fechaActualizacion = inventario.getFechaActualizacion();
    }

}
