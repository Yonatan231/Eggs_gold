package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Pedido;
import com.sena.eggs_gold.model.enums.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    // Traer pedidos por estado
    List<Pedido> findByEstado(EstadoPedido estado);

    // Traer todos los pedidos (si es admin)
    List<Pedido> findAllByOrderByFechaCreacionDesc();
}
