package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.dto.ClientePedidosDTO;
import com.sena.eggs_gold.dto.ConductorPedidosDTO;
import com.sena.eggs_gold.dto.LogisticaDTO;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.TipoDocumento;
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
            "FROM Usuario u LEFT JOIN u.pedidos p " +
            "WHERE u.rol.idRoles = 4 " +
            "GROUP BY u.idUsuarios, u.nombre, u.apellido, u.numDocumento, u.direccionUsuario, u.telefono")
    List<ClientePedidosDTO> findClientesConPedidos();


    @Query(value = """
        SELECT u.ID_USUARIOS, 
               u.NOMBRE, 
               u.APELLIDO, 
               u.NUM_DOCUMENTO, 
               u.DIRECCION_USUARIO, 
               u.TELEFONO,
               (SELECT COUNT(*) 
                FROM pedidos p 
                WHERE p.USUARIOS_ID = u.ID_USUARIOS 
                AND p.ESTADO = 'ENTREGADO') AS pedidos_entregados
        FROM usuarios u
        WHERE u.ROL_ID = 3
        """, nativeQuery = true)
    List<Object[]> findConductoresConPedidosEntregados();

    @Query("SELECT new com.sena.eggs_gold.dto.LogisticaDTO(" +
            "u.idUsuarios, u.nombre, u.apellido, u.direccionUsuario, " +
            "u.numDocumento, u.telefono, u.correo, u.password, '') " + // <-- rol vacío
            "FROM Usuario u WHERE u.rol.idRoles = 2")
    List<LogisticaDTO> findAllLogistica();



}
