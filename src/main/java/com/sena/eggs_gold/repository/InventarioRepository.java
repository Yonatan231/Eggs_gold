package com.sena.eggs_gold.repository;

import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Integer> {

    @Query("""
        SELECT new com.sena.eggs_gold.dto.ProductoDisponibleDTO(
            p.idProducto, 
            p.nombre, 
            p.precio, 
            p.categoria,
            p.descripcion, 
            p.estado, 
            p.imagen,
            CAST(COALESCE(SUM(i.cantidadDisponible), 0) AS int)
        )
        FROM Producto p
        LEFT JOIN Inventario i ON i.producto.idProducto = p.idProducto 
            AND i.cantidadDisponible > 0
        WHERE p.estado = com.sena.eggs_gold.model.enums.EstadoProducto.DISPONIBLE
        GROUP BY p.idProducto, p.nombre, p.precio, p.categoria, p.descripcion, p.estado, p.imagen
        HAVING COALESCE(SUM(i.cantidadDisponible), 0) > 0
    """)
    List<ProductoDisponibleDTO> ProductosDisponiblesEnStock();

    @Query("SELECT i FROM Inventario i WHERE i.cantidadDisponible > 0")
    List<Inventario> listarInventarioActivo();

    List<Inventario> findByProductoIdProductoAndCantidadDisponibleGreaterThan(Integer idProducto, Integer cantidad);

    @Query(value = """
        SELECT 
            i.ID_INVENTARIO AS idInventario,
            p.NOMBRE AS nombre,
            p.PRECIO AS precio,
            p.CATEGORIA AS categoria,
            p.DESCRIPCION AS descripcion,
            p.ESTADO AS estado,
            i.CANTIDAD_DISPONIBLE AS cantidadDisponible,
            i.UBICACION AS ubicacion,
            p.IMAGEN AS imagen,
            i.FECHA_CADUCIDAD AS fechaCaducidad,
            i.FECHA_ACTUALIZACION AS fechaActualizacion
        FROM inventario i
        INNER JOIN productos p ON i.PRODUCTOS_ID = p.ID_PRODUCTOS
        WHERE LOWER(CONCAT_WS(' ',
            IFNULL(i.ID_INVENTARIO, ''),
            IFNULL(p.NOMBRE, ''),
            IFNULL(p.PRECIO, ''),
            IFNULL(p.CATEGORIA, ''),
            IFNULL(p.DESCRIPCION, ''),
            IFNULL(p.ESTADO, ''),
            IFNULL(i.CANTIDAD_DISPONIBLE, ''),
            IFNULL(i.UBICACION, ''),
            IFNULL(p.IMAGEN, ''),
            IFNULL(i.FECHA_CADUCIDAD, ''),
            IFNULL(i.FECHA_ACTUALIZACION, '')
        )) LIKE %:buscar%
    """, nativeQuery = true)
    List<Map<String, Object>> buscarInventario(@Param("buscar") String buscar);
}