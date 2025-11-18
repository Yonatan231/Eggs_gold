package com.sena.eggs_gold.dto;

import com.sena.eggs_gold.model.enums.EstadoPedido;
import com.sena.eggs_gold.model.enums.MetodoPago;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoAdminDTO {

    private Integer idPedido;
    private String nombreCliente;
    private String apellidoCliente;
    private String telefonoCliente;
    private String direccion;
    private String detalleCliente;
    private String observacionConductor;
    private EstadoPedido estado;
    private MetodoPago metodoPago;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaEntrega;
    private Integer cantidadTotal;
    private BigDecimal totalPedido;

    // Información según estado
    private String nombreLogistica;
    private String apellidoLogistica;
    private String nombreConductor;
    private String apellidoConductor;

    // Productos del pedido
    private List<ProductoPedidoDTO> productos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoPedidoDTO {
        private String nombreProducto;
        private String categoria;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}