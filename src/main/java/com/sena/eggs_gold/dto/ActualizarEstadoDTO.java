package com.sena.eggs_gold.dto;

import com.sena.eggs_gold.model.enums.EstadoPedido;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActualizarEstadoDTO {
    private Integer idPedido;
    private EstadoPedido estado;
}
