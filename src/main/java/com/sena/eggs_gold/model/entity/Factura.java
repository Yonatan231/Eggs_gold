package com.sena.eggs_gold.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sena.eggs_gold.model.enums.MetodoPago;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "facturas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_FACTURA")
    private Integer idFactura;

    @Column(name = "NUMERO_FACTURA", nullable = false, unique = true)
    private Integer numeroFactura;

    @Enumerated(EnumType.STRING)
    @Column(name = "METODO_PAGO", nullable = false)
    private MetodoPago metodoPago;

    @Column(name = "TOTAL_PAGADO", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPagado;

    @Column(name = "FECHA_PAGO", nullable = false)
    private LocalDateTime fechaPago;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PEDIDO", nullable = false)
    private Pedido pedido;
}
