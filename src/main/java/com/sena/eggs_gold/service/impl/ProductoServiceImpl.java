package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.ProductoBusquedaDTO;
import com.sena.eggs_gold.dto.ProductoDTO;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.model.enums.EstadoProducto;
import com.sena.eggs_gold.repository.ProductoRepository;
import com.sena.eggs_gold.service.ProductoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;

    @Value("${app.upload.path}")
    private String uploadBasePath;

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

        if (productoDTO.getEstado() == null) {
            producto.setEstado(EstadoProducto.DISPONIBLE);
        } else {
            producto.setEstado(productoDTO.getEstado());
        }

        // Guardar imagen físicamente en el disco
        if (!imagenFile.isEmpty()) {
            String nombreArchivo = guardarImagenProducto(imagenFile);
            producto.setImagen(nombreArchivo);
        }

        productoRepository.save(producto);
    }

    private String guardarImagenProducto(MultipartFile archivo) throws IOException {
        Path directorioProductos = Paths.get(uploadBasePath + "productos");

        if (!Files.exists(directorioProductos)) {
            Files.createDirectories(directorioProductos);
        }

        String nombreOriginal = archivo.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }

        String nombreUnico = "producto_" + UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + extension;
        Path rutaArchivo = directorioProductos.resolve(nombreUnico);
        Files.copy(archivo.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);

        return nombreUnico;
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

        // Actualizar campos (sin cantidad)
        producto.setNombre(datosProducto.getNombre());
        producto.setPrecio(datosProducto.getPrecio());
        producto.setCategoria(datosProducto.getCategoria());
        producto.setDescripcion(datosProducto.getDescripcion());
        producto.setEstado(datosProducto.getEstado());

        return productoRepository.save(producto);
    }

    @Override
    public boolean marcarComoDescontinuado(Integer idProducto) {
        Optional<Producto> productoOpt = productoRepository.findById(idProducto);
        if (productoOpt.isPresent()) {
            Producto producto = productoOpt.get();
            producto.setEstado(EstadoProducto.DESCONTINUADO);
            productoRepository.save(producto);
            return true;
        }
        return false;
    }

    @Override
    public List<ProductoBusquedaDTO> buscarProductos(String buscar) {
        List<Map<String, Object>> rows = productoRepository.buscarProductos(buscar);
        List<ProductoBusquedaDTO> resultado = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            ProductoBusquedaDTO dto = new ProductoBusquedaDTO();
            dto.setIdProducto((Integer) row.get("id"));
            dto.setNombre((String) row.get("nombre"));
            Object rawPrecio = row.get("precio");
            dto.setPrecio(rawPrecio != null ? ((Number) rawPrecio).doubleValue() : null);
            dto.setCategoria((String) row.get("categoria"));
            dto.setDescripcion((String) row.get("descripcion"));
            dto.setEstado((String) row.get("estado"));
            dto.setImagen((String) row.get("imagen"));
            resultado.add(dto);
        }

        return resultado;
    }
}