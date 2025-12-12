package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.EstadoEntradaStock;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "entrada_stock")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntradaStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "proveedor", length = 100)
    private String proveedor;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    private EstadoEntradaStock estado;

    @ManyToOne
    @JoinColumn(name = "id_logistica")
    private Usuario logistica;

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;

    @PrePersist
    protected void onCreate() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
        if (estado == null) {
            estado = EstadoEntradaStock.PENDIENTE;
        }
    }
}