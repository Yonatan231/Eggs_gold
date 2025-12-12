package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ProductoBusquedaDTO;
import com.sena.eggs_gold.dto.ProductoDTO;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.model.entity.Producto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface ProductoService {

    void guardarProducto(ProductoDTO productoDTO, MultipartFile imagenFile) throws IOException;

    List<ProductoDTO> listaProductos();
    Producto actualizarProducto(Integer id, Producto datosProducto);

    Producto actualizarProductoConImagen(Integer id, Producto datosProducto, MultipartFile imagenFile) throws IOException;
    boolean marcarComoDescontinuado(Integer idProducto);

    List<ProductoBusquedaDTO> buscarProductos(String buscar);

    Map<String, Object> guardarProductosDesdeCSV(MultipartFile archivoCSV) throws IOException;
}