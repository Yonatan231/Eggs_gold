package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.dto.ClientePedidosDTO;
import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Rol;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.EstadoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario,Integer> {
    Optional<Usuario> findByNombre(String nombre);

    boolean existsByNumDocumento(String numDocumento);

    @Query("SELECT new com.sena.eggs_gold.dto.ClientePedidosDTO( " +
            "u.idUsuarios, u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono, COUNT(p)) " +
            "FROM Usuario u LEFT JOIN Pedido p ON p.cliente.idUsuarios = u.idUsuarios " +
            "WHERE u.rol.idRoles = 4 AND u.estado = com.sena.eggs_gold.model.enums.EstadoUsuario.ACTIVO " +
            "GROUP BY u.idUsuarios, u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono")
    List<ClientePedidosDTO> findClientesConPedidos();

    // ✅ CORREGIDO: Usar JPQL en lugar de SQL nativo y usar ID_CONDUCTOR en lugar de USUARIOS_ID
    @Query("""
        SELECT new com.sena.eggs_gold.dto.ConductorDTO(
            u.idUsuarios, 
            u.nombre, 
            u.apellido, 
            u.numDocumento, 
            u.direccionUsuario, 
            u.telefono, 
            COUNT(p)
        )
        FROM Usuario u
        LEFT JOIN Pedido p ON p.conductor.idUsuarios = u.idUsuarios 
            AND p.estado = com.sena.eggs_gold.model.enums.EstadoPedido.ENTREGADO
        WHERE u.rol.idRoles = 3 AND u.estado = com.sena.eggs_gold.model.enums.EstadoUsuario.ACTIVO
        GROUP BY u.idUsuarios, u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono
    """)
    List<ConductorDTO> findConductoresConPedidosEntregados();

    @Query("""
           SELECT new com.sena.eggs_gold.dto.LogisticaDTO(
               u.idUsuarios,
               u.nombre,
               u.apellido,
               u.direccionUsuario,
               u.numDocumento,
               u.telefono,
               u.correo,
               u.password,
               u.rol.nombreRol
           )
           FROM Usuario u
           WHERE u.rol.idRoles = 2 AND u.estado = com.sena.eggs_gold.model.enums.EstadoUsuario.ACTIVO
           """)
    List<LogisticaDTO> findAllLogistica();

    List<Usuario> findByEstado(EstadoUsuario estado);

    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.rol.idRoles = ?1")
    long countByRolId(int rolId);

    @Query("""
    SELECT new com.sena.eggs_gold.dto.ConductorDTO(u.idUsuarios, u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono, COUNT(p))
    FROM Usuario u
    LEFT JOIN Pedido p ON p.conductor.idUsuarios = u.idUsuarios AND p.estado = com.sena.eggs_gold.model.enums.EstadoPedido.ENTREGADO
    WHERE u.rol.idRoles = 3 AND u.estado = com.sena.eggs_gold.model.enums.EstadoUsuario.ACTIVO
    GROUP BY u.idUsuarios, u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono
""")
    List<ConductorDTO> listarConductoresConPedidosEntregados();

    @Query("SELECT u FROM Usuario u " +
            "WHERE u.rol.idRoles = 4 " +
            "AND u.estado = :estado " +
            "AND CONCAT(u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono) LIKE %:buscar%")
    List<Usuario> buscarClientePorEstado(String buscar, EstadoUsuario estado);

    @Query("SELECT u FROM Usuario u " +
            "WHERE u.rol.idRoles = 3 " +
            "AND u.estado = :estado " +
            "AND CONCAT(u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono) LIKE %:buscar%")
    List<Usuario> buscarConductorPorEstado(String buscar, EstadoUsuario estado);

    @Query("SELECT u FROM Usuario u " +
            "WHERE u.rol.idRoles = 2 " +
            "AND u.estado = :estado " +
            "AND CONCAT(u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono) LIKE %:buscar%")
    List<Usuario> buscarLogisticaPorEstado(String buscar, EstadoUsuario estado);

    // ✅ Trae todos los roles registrados
    @Query("SELECT r FROM com.sena.eggs_gold.model.entity.Rol r")
    List<Rol> findAllRoles();

    @Query("SELECT u.correo FROM Usuario u WHERE u.rol.idRoles IN :rolIds AND u.correo IS NOT NULL")
    List<String> findEmailsByRolIds(List<Integer> rolIds);
}