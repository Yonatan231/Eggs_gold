package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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
    UPDATE Pedido p SET p.usuario.idUsuarios = :conductorId, p.estado = 'ASIGNADO'
    WHERE p.idPedidos = :pedidoId
""")
    void asignarConductor(@Param("pedidoId") Integer pedidoId, @Param("conductorId") Integer conductorId);
}
