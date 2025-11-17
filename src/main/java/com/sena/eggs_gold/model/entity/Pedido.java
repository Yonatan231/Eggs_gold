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
    private String direccion;  // Dónde se va a entregar el pedido

    @Column(name = "DETALLE_CLIENTE", columnDefinition = "TEXT")
    private String detalleCliente;  // Información extra del cliente (ej: "Casa azul, timbre rojo")

    @Column(name = "OBSERVACION_CONDUCTOR", columnDefinition = "TEXT")
    private String observacionConductor;  // Lo que escriba el conductor (ej: "Entregado en portería")

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false)
    private EstadoPedido estado;  // En qué etapa está el pedido

    @Enumerated(EnumType.STRING)
    @Column(name = "METODO_PAGO")
    private MetodoPago metodoPago;  // Cómo pagó el cliente

    @Column(name = "FECHA_CREACION")
    private LocalDateTime fechaCreacion;  // Cuándo se creó el pedido

    @Column(name = "FECHA_ENTREGA")
    private LocalDateTime fechaEntrega;  // Cuándo se entregó el pedido

    // ===== CANTIDAD TOTAL =====

    @Column(name = "CANTIDAD_TOTAL")
    private Integer cantidadTotal;  // Cuántos productos en total tiene el pedido
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CLIENTE", nullable = false)
    private Usuario cliente;

    // Quién está organizando el pedido (logística)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LOGISTICA")
    private Usuario logistica;

    // Quién va a entregar el pedido (conductor)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CONDUCTOR")
    private Usuario conductor;

    // Los productos que tiene este pedido
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    private List<Venta> ventas;

    @PrePersist
    protected void antesDeGuardar() {
        // Si no tiene fecha de creación, poner la fecha actual
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }

        // Si no tiene estado, ponerlo como PENDIENTE
        if (estado == null) {
            estado = EstadoPedido.PENDIENTE;
        }

        // Si no tiene cantidad total, ponerla en 0
        if (cantidadTotal == null) {
            cantidadTotal = 0;
        }
    }
}