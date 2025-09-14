package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
}
