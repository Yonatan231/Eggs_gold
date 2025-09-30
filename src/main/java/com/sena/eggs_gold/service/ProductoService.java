package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ProductoDTO;
import com.sena.eggs_gold.model.entity.Producto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ProductoService {

    void guardarProducto(ProductoDTO productoDTO, MultipartFile imagenFile) throws IOException;

    List<ProductoDTO> listaProductos();
    Producto actualizarProducto(Integer id, Producto datosProducto);
}
