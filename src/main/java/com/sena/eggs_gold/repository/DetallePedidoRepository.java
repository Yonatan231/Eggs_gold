package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {

    // Buscar detalles por pedido
    List<DetallePedido> findByPedidoIdPedidos(Integer idPedido);

    // ========== CONSULTAS PARA ESTADÍSTICAS ==========

    // Calcular ventas totales por mes (formato: YYYY-MM)
    @Query("SELECT FUNCTION('DATE_FORMAT', p.fechaCreacion, '%Y-%m') as mes, SUM(d.total) " +
            "FROM DetallePedido d " +
            "JOIN d.pedido p " +
            "WHERE p.estado = com.sena.eggs_gold.model.enums.EstadoPedido.ENTREGADO " +
            "GROUP BY FUNCTION('DATE_FORMAT', p.fechaCreacion, '%Y-%m') " +
            "ORDER BY mes")
    List<Object[]> calcularVentasPorMes();
}