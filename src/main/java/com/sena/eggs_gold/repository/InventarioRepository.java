package com.sena.eggs_gold.repository;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Inventario;
import com.sena.eggs_gold.model.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Integer> {

    @Query("""
                SELECT new com.sena.eggs_gold.dto.ProductoDisponibleDTO(
                    p.idProducto, p.nombre, p.precio, p.categoria,
                    p.descripcion, p.estado, p.imagen,
                    i.cantidadDisponible
                )
                FROM Inventario i
                JOIN i.producto p
                WHERE i.cantidadDisponible > 0
            
            """)

List<ProductoDisponibleDTO> ProductosDisponiblesEnStock();
    List<Inventario>findByProducto(Producto producto);



}
