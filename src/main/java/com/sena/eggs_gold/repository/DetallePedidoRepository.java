package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {

    // Buscar detalles por pedido
    List<DetallePedido> findByPedidoIdPedidos(Integer idPedido);
}