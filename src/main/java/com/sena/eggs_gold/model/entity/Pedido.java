package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.model.enums.MetodoPago;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

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

    @Column(name = "DETALLE_CLIENTE", columnDefinition = "TEXT")
    private String detalleCliente;

    @Column(name = "OBSERVACION_CONDUCTOR", columnDefinition = "TEXT")
    private String observacionConductor;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoPedido estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "METODO_PAGO")
    private MetodoPago metodoPago;

    @Column(name = "FECHA_CREACION")
    private LocalDateTime fechaCreacion;

    @Column(name = "FECHA_ENTREGA")
    private LocalDateTime fechaEntrega;

    @Column(name = "CANTIDAD_TOTAL")
    private Integer cantidadTotal;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CLIENTE", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LOGISTICA")
    private Usuario logistica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CONDUCTOR")
    private Usuario conductor;

    @PrePersist
    protected void antesDeGuardar() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }

        if (estado == null) {
            estado = EstadoPedido.PENDIENTE;
        }

        if (cantidadTotal == null) {
            cantidadTotal = 0;
        }
    }
}