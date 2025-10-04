package com.sena.eggs_gold.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.sena.eggs_gold.model.entity.Producto;

import java.util.List;
import java.util.Map;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    @Query(value = """
    SELECT 
        p.ID_PRODUCTOS AS id,
        p.NOMBRE AS nombre,
        p.PRECIO AS precio,
        p.CATEGORIA AS categoria,
        p.DESCRIPCION AS descripcion,
        p.ESTADO AS estado,
        p.IMAGEN AS imagen,
        p.CANTIDAD AS cantidad
    FROM productos p
    WHERE p.CANTIDAD > 0
      AND p.ESTADO = 'DISPONIBLE'
      AND (
            :buscar IS NULL 
            OR :buscar = '' 
            OR CONCAT(p.NOMBRE, ' ', p.CATEGORIA, ' ', p.DESCRIPCION, ' ', p.ESTADO) LIKE %:buscar%
          )
    """, nativeQuery = true)
    List<Map<String, Object>> buscarProductos(@Param("buscar") String buscar);


}