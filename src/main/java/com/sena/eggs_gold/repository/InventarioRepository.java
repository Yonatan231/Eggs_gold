package com.sena.eggs_gold.repository;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Inventario;
import com.sena.eggs_gold.model.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Integer> {

    @Query("""
                SELECT new com.sena.eggs_gold.dto.ProductoDisponibleDTO(
                    p.idProducto, p.nombre, p.precio, p.categoria,
                    p.descripcion, p.estado, p.imagen,
                    p.cantidad
                )
                FROM Producto p
                WHERE p.cantidad > 0 AND p.estado = com.sena.eggs_gold.model.enums.EstadoProducto.DISPONIBLE
            
            """)

List<ProductoDisponibleDTO> ProductosDisponiblesEnStock();
    @Query("SELECT i FROM Inventario i WHERE i.estado = 'ACTIVO'")
    List<Inventario> listarInventarioActivo();


    @Query(value = """
    SELECT i.ID_INVENTARIO AS idInventario,
           p.NOMBRE AS nombre,
           i.PRECIO AS precio,
           i.CATEGORIA AS categoria,
           i.DESCRIPCION AS descripcion,
           i.ESTADO AS estado,
           i.CANTIDAD_DISPONIBLE AS cantidadDisponible,
           i.UBICACION AS ubicacion,
           i.IMAGEN AS imagen,
           i.FECHA_CADUCIDAD AS fechaCaducidad,
           i.FECHA_ACTUALIZACION AS fechaActualizacion
    FROM inventario i
    JOIN productos p ON i.PRODUCTOS_ID = p.ID_PRODUCTOS
    WHERE LOWER(CONCAT_WS(' ',
        IFNULL(i.ID_INVENTARIO, ''),
        IFNULL(p.NOMBRE, ''),
        IFNULL(p.PRECIO, ''),
        IFNULL(i.CATEGORIA, ''),
        IFNULL(i.DESCRIPCION, ''),
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
