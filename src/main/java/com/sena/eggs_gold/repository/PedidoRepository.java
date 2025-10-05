package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    // Traer pedidos por estado
    List<Pedido> findByEstado(EstadoPedido estado);

    // Traer todos los pedidos (si es admin)
    List<Pedido> findAllByOrderByFechaCreacionDesc();


    @Query("SELECT COALESCE(SUM(p.total),0) FROM Pedido p WHERE FUNCTION('DATE', p.fechaCreacion) = CURRENT_DATE")
    double sumTotalByFechaActual();


    @Modifying
    @Query("""
    UPDATE Pedido p SET p.conductor.idUsuarios = :conductorId, p.estado = 'ASIGNADO'
    WHERE p.idPedidos = :pedidoId
""")
    void asignarConductor(@Param("pedidoId") Integer pedidoId, @Param("conductorId") Integer conductorId);


    @Query(value = """
    SELECT p.ID_PEDIDOS AS idPedidos,
           u.NOMBRE AS nombreUsuario,
           pr.NOMBRE AS nombreProducto,
           pr.PRECIO AS precio,
           v.CANTIDAD AS cantidad,
           p.DIRECCION AS direccion,
           p.ESTADO AS estado,
           p.FECHA_CREACION AS fechaCreacion,
           p.TOTAL AS total
    FROM pedidos p
    JOIN usuarios u ON p.USUARIOS_ID = u.ID_USUARIOS
    JOIN ventas v ON v.PEDIDO_ID = p.ID_PEDIDOS
    JOIN productos pr ON v.PRODUCTO_ID = pr.ID_PRODUCTOS
    WHERE CONCAT(
        p.ID_PEDIDOS, u.NOMBRE, pr.NOMBRE, pr.PRECIO, v.CANTIDAD,
        p.DIRECCION, p.ESTADO, p.FECHA_CREACION, p.TOTAL
    ) LIKE %:buscar%
    """, nativeQuery = true)
    List<Map<String, Object>> buscarPedidos(@Param("buscar") String buscar);



    @Query(value = """
    SELECT 
        p.ID_PEDIDOS AS idPedido,
        c.NOMBRE AS nombreCliente,
        c.APELLIDO AS apellidoCliente,
        c.TELEFONO AS telefono,
        p.DIRECCION AS direccion,
        p.ESTADO AS estado,
        GROUP_CONCAT(CONCAT(pr.NOMBRE, ' (x', v.CANTIDAD, ')') SEPARATOR ', ') AS productos
    FROM pedidos p
    JOIN usuarios c ON p.USUARIOS_ID = c.ID_USUARIOS
    JOIN ventas v ON v.PEDIDO_ID = p.ID_PEDIDOS
    JOIN productos pr ON v.PRODUCTO_ID = pr.ID_PRODUCTOS
    WHERE p.CONDUCTOR_ID = :conductorId AND p.ESTADO IN ('Asignado','En_camino')
    GROUP BY p.ID_PEDIDOS
    """, nativeQuery = true)
    List<Map<String, Object>> obtenerPedidosAsignados(@Param("conductorId") Integer conductorId);


    @Modifying
    @Query("""
    UPDATE Pedido p SET p.estado = :estado,
    p.fechaEntrega = CASE WHEN :estado = 'ENTREGADO' THEN CURRENT_TIMESTAMP ELSE p.fechaEntrega END
    WHERE p.idPedidos = :idPedido
""")
    void actualizarEstado(@Param("idPedido") Integer idPedido, @Param("estado") EstadoPedido estado);




}
