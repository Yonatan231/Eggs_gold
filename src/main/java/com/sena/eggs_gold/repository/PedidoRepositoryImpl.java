package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.dto.PedidoConductorDTO;
import com.sena.eggs_gold.dto.PedidoConductorHistorialDTO;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Repository
public class PedidoRepositoryImpl implements PedidoRepositoryHistorial {

    @PersistenceContext
    private EntityManager em;

    @Override
    public List<PedidoConductorHistorialDTO> buscarPedidosPorConductor(Integer conductorId) {
        String sql = """
            SELECT 
                p.ID_PEDIDOS,
                u.NOMBRE AS nombre_usuario,
                p.DIRECCION,
                p.ESTADO,
                p.FECHA_CREACION,
                GROUP_CONCAT(CONCAT(prod.NOMBRE, ' (x', v.CANTIDAD, ')') SEPARATOR ', ') AS productos,
                SUM(v.CANTIDAD * prod.PRECIO) AS total
            FROM pedidos p
            JOIN ventas v ON v.PEDIDO_ID = p.ID_PEDIDOS
            JOIN productos prod ON v.PRODUCTO_ID = prod.ID_PRODUCTOS
            JOIN usuarios u ON p.USUARIOS_ID = u.ID_USUARIOS
            WHERE p.CONDUCTOR_ID = :conductorId
            GROUP BY p.ID_PEDIDOS
            ORDER BY p.FECHA_CREACION DESC
        """;

        Query query = em.createNativeQuery(sql);
        query.setParameter("conductorId", conductorId);

        List<Object[]> rows = query.getResultList();
        List<PedidoConductorHistorialDTO> pedidos = new ArrayList<>();

        for (Object[] row : rows) {
            BigDecimal total = BigDecimal.valueOf(((Number) row[6]).doubleValue());

            pedidos.add(new PedidoConductorHistorialDTO(
                    ((Number) row[0]).intValue(),
                    (String) row[1],
                    (String) row[2],
                    EstadoPedido.valueOf((String) row[3]),
                    ((Timestamp) row[4]).toLocalDateTime(),
                    (String) row[5],
                    total
            ));
        }

        return pedidos;
    }
}
