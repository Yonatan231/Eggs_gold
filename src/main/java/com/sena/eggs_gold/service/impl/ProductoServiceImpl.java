package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ProductoDTO;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.model.enums.EstadoProducto;
import com.sena.eggs_gold.repository.ProductoRepository;
import com.sena.eggs_gold.service.ProductoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoServiceImpl(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Override
    public void guardarProducto(ProductoDTO productoDTO, MultipartFile imagenFile) throws IOException {
        Producto producto = new Producto();
        producto.setNombre(productoDTO.getNombre());
        producto.setDescripcion(productoDTO.getDescripcion());
        producto.setPrecio(productoDTO.getPrecio());
        producto.setCategoria(productoDTO.getCategoria());
        producto.setCantidad(productoDTO.getCantidad());
        if (productoDTO.getEstado() == null) {
            producto.setEstado(EstadoProducto.DISPONIBLE); // valor por defecto
        } else {
            producto.setEstado(productoDTO.getEstado());
        }

        // Guardar imagen como nombre único
        if (!imagenFile.isEmpty()) {
            String fileName = imagenFile.getOriginalFilename();
            producto.setImagen(fileName);
        }

        productoRepository.save(producto);
    }

    @Override
    public List<ProductoDTO> listaProductos() {
        return productoRepository.findAll()
                .stream()
                .map(prod -> new ProductoDTO(
                        prod.getIdProducto(),
                        prod.getNombre(),
                        prod.getPrecio(),
                        prod.getCategoria(),
                        prod.getCantidad(),
                        prod.getDescripcion(),
                        prod.getImagen(),
                        prod.getEstado()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public Producto actualizarProducto(Integer id, Producto datosProducto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con id " + id));

        // Actualizar campos
        producto.setNombre(datosProducto.getNombre());
        producto.setPrecio(datosProducto.getPrecio());
        producto.setCategoria(datosProducto.getCategoria());
        producto.setDescripcion(datosProducto.getDescripcion());
        producto.setEstado(datosProducto.getEstado());
        producto.setCantidad(datosProducto.getCantidad());


        return productoRepository.save(producto);
    }

}
