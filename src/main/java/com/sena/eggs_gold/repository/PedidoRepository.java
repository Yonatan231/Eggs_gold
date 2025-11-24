package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    // Buscar pedidos por usuario
    List<Pedido> findByClienteIdUsuarios(Integer idCliente);

    // Buscar pedidos por estado
    List<Pedido> findByEstado(EstadoPedido estado);

    // Buscar pedidos pendientes para logística
    List<Pedido> findByEstadoOrderByFechaCreacionDesc(EstadoPedido estado);

    // ✅ NUEVO: Buscar pedidos por conductor y estado
    List<Pedido> findByConductorIdUsuariosAndEstado(Integer idConductor, EstadoPedido estado);

    // ✅ NUEVO: Buscar pedidos asignados a conductor (estado ASIGNADO)
    List<Pedido> findByConductorIdUsuariosAndEstadoOrderByFechaCreacionDesc(Integer idConductor, EstadoPedido estado);

    // ✅ NUEVO: Buscar pedidos entregados por conductor
    List<Pedido> findByConductorIdUsuariosAndEstadoOrderByFechaEntregaDesc(Integer idConductor, EstadoPedido estado);

    // ========== CONSULTAS PARA ESTADÍSTICAS ==========

    // Contar pedidos por estado
    @Query("SELECT p.estado, COUNT(p) FROM Pedido p GROUP BY p.estado")
    List<Object[]> countPedidosPorEstado();

    // Contar pedidos por método de pago
    @Query("SELECT p.metodoPago, COUNT(p) FROM Pedido p WHERE p.metodoPago IS NOT NULL GROUP BY p.metodoPago")
    List<Object[]> countPedidosPorMetodoPago();

    // Crecimiento de pedidos por mes (formato: YYYY-MM)
    @Query("SELECT FUNCTION('DATE_FORMAT', p.fechaCreacion, '%Y-%m') as mes, COUNT(p) " +
            "FROM Pedido p " +
            "GROUP BY FUNCTION('DATE_FORMAT', p.fechaCreacion, '%Y-%m') " +
            "ORDER BY mes")
    List<Object[]> countPedidosPorMes();
}