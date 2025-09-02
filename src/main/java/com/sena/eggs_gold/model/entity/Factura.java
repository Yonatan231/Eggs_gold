package com.sena.eggs_gold.model.entity;

import com.sena.eggs_gold.model.enums.MetodoPago;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Entidad JPA para la tabla factura
 */
@Entity
@Table(name = "factura")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_FACTURA")
    private Integer idFactura;

    @Column(name = "CANTIDAD_PRODUCTOS", nullable = false)
    private Integer cantidadProductos;

    @Column(name = "PRECIO_UNITARIO_PRODUCTO", nullable = false, precision = 10, scale = 0)
    private BigDecimal precioUnitarioProducto;

    @Enumerated(EnumType.STRING)
    @Column(name = "METODO_PAGO", nullable = false)
    private MetodoPago metodoPago;

    @Column(name = "SUBTOTAL", nullable = false)
    private Float subtotal;

    @Column(name = "IVA", nullable = false)
    private Float iva;

    @Column(name = "TOTAL", nullable = false)
    private Float total;

    // Relaciones JPA - Many to One (muchas facturas pueden estar asociadas a la misma venta)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VENTAS_ID_VENTAS", nullable = false)
    private Venta venta;

    // Many to One (muchas facturas pueden incluir el mismo producto)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCTOS_ID_PRODUCTOS", nullable = false)
    private Producto producto;
}