package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Conductor;
import com.sena.eggs_gold.dto.ConductorDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConductorRepository extends JpaRepository<Conductor, Integer> {

    Optional<Conductor> findByNumDocumentoAndPassword(String numDocumento, String password);

    // Método para el reporte de conductores - ACTUALIZADO para usar tu DTO
    @Query("""
    SELECT new com.sena.eggs_gold.dto.ConductorDTO(
        u.idUsuarios, u.nombre, u.apellido, u.numDocumento, 
        u.direccionUsuario, u.telefono, COUNT(p))
    FROM Usuario u
    JOIN u.rol r
    LEFT JOIN Pedido p ON p.conductor.idUsuarios = u.idUsuarios AND p.estado = 'ENTREGADO'
    WHERE r.idRoles = 3 AND u.estado = 'ACTIVO'
    GROUP BY u.idUsuarios, u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono
    """)
    List<ConductorDTO> listarConductoresConPedidosEntregados();
}