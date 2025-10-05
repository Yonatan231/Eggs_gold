package com.sena.eggs_gold.dto;

import com.sena.eggs_gold.model.enums.EstadoPedido;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.Locale;

@Data

public class PedidoConductorHistorialDTO {

    private Integer idPedido;
    private String nombreUsuario;
    private String direccion;
    private EstadoPedido estado;
    private LocalDateTime fechaCreacion;
    private String productos;
    private String totalFormateado;

    public PedidoConductorHistorialDTO(Integer idPedido, String nombreUsuario, String direccion,
                              EstadoPedido estado, LocalDateTime fechaCreacion,
                              String productos, BigDecimal total) {
        this.idPedido = idPedido;
        this.nombreUsuario = nombreUsuario;
        this.direccion = direccion;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
        this.productos = productos;
        this.totalFormateado = NumberFormat.getNumberInstance(new Locale("es", "CO"))
                .format(total.setScale(0, RoundingMode.HALF_UP));
    }
}
