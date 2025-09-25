package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ClientePedidosDTO;
import com.sena.eggs_gold.dto.ClienteRegistroDTO;
import com.sena.eggs_gold.dto.ConductorPedidosDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Usuario;

import java.util.List;

public interface UsuarioService {
 boolean documentoYaExistente(String numDocumento);
 List<ClientePedidosDTO>obtenerClientesConPedidos();
    List<ConductorPedidosDTO> obtenerConductoresConPedidosEntregados();

    List<LogisticaDTO> obtenerLogistica();
}
