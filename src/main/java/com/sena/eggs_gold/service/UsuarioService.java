package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ClientePedidosDTO;
import com.sena.eggs_gold.dto.ClienteRegistroDTO;
import com.sena.eggs_gold.dto.ConductorPedidosDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Usuario;

import java.util.List;
import java.util.Optional;



public interface UsuarioService {
 boolean documentoYaExistente(String numDocumento);
 List<ClientePedidosDTO>obtenerClientesConPedidos();
    List<ConductorPedidosDTO> obtenerConductoresConPedidosEntregados();

    List<LogisticaDTO> obtenerLogistica();
    Optional<Usuario> actualizarUsuario(Integer idUsuarios, Usuario datosActualizados);

    List<Usuario> listarActivos();
    void eliminarLogico(Integer idUsuarios);
}
