package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ConductorDTO;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ConductorService {

    // Solo logística puede registrar un conductor
    void registrarConductor(ConductorDTO dto);

    // Para login de conductor
    ConductorDTO login(String numDocumento, String password);

    @Query("""
    SELECT new com.sena.eggs_gold.dto.ConductorDTO(u.idUsuarios, u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono, COUNT(p))
    FROM Usuario u
    JOIN u.rol r
    LEFT JOIN Pedido p ON p.usuario.idUsuarios = u.idUsuarios AND p.estado = 'ENTREGADO'
    WHERE r.idRoles = 3 AND u.estado = 'ACTIVO'
    GROUP BY u.idUsuarios, u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono
""")
    List<ConductorDTO> obtenerConductoresConPedidosEntregados();
}


