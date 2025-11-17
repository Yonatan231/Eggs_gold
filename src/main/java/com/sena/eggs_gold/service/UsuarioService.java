package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ClientePedidosDTO;
import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface UsuarioService {

    boolean documentoYaExistente(String numDocumento);

    List<ClientePedidosDTO> obtenerClientesConPedidos();

    // ✅ CORREGIDO: Cambiado de ConductorPedidosDTO a ConductorDTO
    List<ConductorDTO> obtenerConductoresConPedidosEntregados();

    List<LogisticaDTO> obtenerLogistica();

    Optional<Usuario> actualizarUsuario(Integer idUsuarios, Usuario datosActualizados);

    List<Usuario> listarActivos();

    void eliminarLogico(Integer idUsuarios);

    List<Usuario> buscarClientePorEstado(String buscar, EstadoUsuario estado);

    List<Usuario> buscarConductorPorEstado(String buscar, EstadoUsuario estado);

    List<Usuario> buscarLogisticaPorEstado(String buscar, EstadoUsuario estado);

    String guardarFotoPerfil(Integer usuarioId, MultipartFile foto) throws IOException;
}