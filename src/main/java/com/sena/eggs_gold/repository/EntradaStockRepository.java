package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.model.entity.EntradaStock;
import com.sena.eggs_gold.model.enums.EstadoEntradaStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntradaStockRepository extends JpaRepository<EntradaStock, Integer> {

    // Buscar todas las entradas pendientes
    List<EntradaStock> findByEstado(EstadoEntradaStock estado);

    // Buscar entradas por producto
    List<EntradaStock> findByProductoIdProducto(Integer idProducto);
}
