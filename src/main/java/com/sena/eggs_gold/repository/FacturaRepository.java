package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Integer> {

    // Buscar factura por pedido
    Optional<Factura> findByPedidoIdPedidos(Integer idPedido);

    // Obtener el último número de factura
    @Query("SELECT MAX(f.numeroFactura) FROM Factura f")
    Integer findMaxNumeroFactura();
}