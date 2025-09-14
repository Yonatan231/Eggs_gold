package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.CarritoTemporalDTO;
import com.sena.eggs_gold.dto.ConfirmarPedidoRequestDTO;
import com.sena.eggs_gold.dto.ItemCarritoRequestDTO;

import java.util.List;

public interface CarritoService {
    String AgregarOactualizarItem(ItemCarritoRequestDTO itemCarritoRequestDTO);

    List<CarritoTemporalDTO> obtenerCarritoPorUsuario(Integer usuario);

    void eliminarItemPorId(Integer id);

    String confirmarPedido(ConfirmarPedidoRequestDTO dto);




}
