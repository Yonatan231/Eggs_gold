package com.sena.eggs_gold.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final Cloudinary cloudinary;

    public ProductoServiceImpl(
            ProductoRepository productoRepository,
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret
    ) {
        this.productoRepository = productoRepository;

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
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

        if (!imagenFile.isEmpty()) {
            String urlImagen = guardarImagenProducto(imagenFile);
            producto.setImagen(urlImagen);
        } else {
            producto.setImagen("default.jpg"); // Imagen por defecto
        }

        productoRepository.save(producto);
    }

    private String guardarImagenProducto(MultipartFile archivo) throws IOException {
        try {
            Map uploadResult = cloudinary.uploader().upload(archivo.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "eggs_gold/productos",
                            "resource_type", "image"
                    ));

            String urlImagen = (String) uploadResult.get("secure_url");
            System.out.println(" Imagen subida a Cloudinary: " + urlImagen);

            return urlImagen;

        } catch (IOException e) {
            System.err.println(" Error al subir imagen a Cloudinary: " + e.getMessage());
            throw new IOException("Error al subir la imagen a Cloudinary", e);
        }
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

        producto.setNombre(datosProducto.getNombre());
        producto.setPrecio(datosProducto.getPrecio());
        producto.setCategoria(datosProducto.getCategoria());
        producto.setDescripcion(datosProducto.getDescripcion());
        producto.setEstado(datosProducto.getEstado());

        return productoRepository.save(producto);
    }

    @Override
    public Producto actualizarProductoConImagen(Integer id, Producto datosProducto, MultipartFile imagenFile) throws IOException {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con id " + id));

        producto.setNombre(datosProducto.getNombre());
        producto.setPrecio(datosProducto.getPrecio());
        producto.setCategoria(datosProducto.getCategoria());
        producto.setDescripcion(datosProducto.getDescripcion());
        producto.setEstado(datosProducto.getEstado());

        if (imagenFile != null && !imagenFile.isEmpty()) {
            String urlImagen = guardarImagenProducto(imagenFile);
            producto.setImagen(urlImagen);
        }

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

    @Override
    public Map<String, Object> guardarProductosDesdeCSV(MultipartFile archivoCSV) throws IOException {
        Map<String, Object> resultado = new java.util.HashMap<>();
        int exitosos = 0;
        int fallidos = 0;
        List<String> errores = new ArrayList<>();

        String contenido = new String(archivoCSV.getBytes());
        String[] lineas = contenido.split("\n");

        for (int i = 1; i < lineas.length; i++) {
            String linea = lineas[i].trim();

            if (linea.isEmpty()) {
                continue;
            }

            try {
                String[] datos = linea.split(",");

                if (datos.length < 4) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": Faltan datos (debe tener: nombre,precio,categoria,descripcion)");
                    continue;
                }

                String nombre = datos[0].trim();
                String precioStr = datos[1].trim();
                String categoriaStr = datos[2].trim().toUpperCase();
                String descripcion = datos[3].trim();

                if (nombre.isEmpty()) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": El nombre no puede estar vacío");
                    continue;
                }

                Float precio;
                try {
                    precio = Float.parseFloat(precioStr);
                    if (precio <= 0) {
                        fallidos++;
                        errores.add("Línea " + (i + 1) + ": El precio debe ser mayor a 0");
                        continue;
                    }
                } catch (NumberFormatException e) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": Precio inválido '" + precioStr + "'");
                    continue;
                }

                com.sena.eggs_gold.model.enums.Categoria categoria;
                try {
                    categoria = com.sena.eggs_gold.model.enums.Categoria.valueOf(categoriaStr);
                } catch (IllegalArgumentException e) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": Categoría inválida '" + categoriaStr + "' (debe ser: A, AA o AAA)");
                    continue;
                }

                if (descripcion.isEmpty()) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": La descripción no puede estar vacía");
                    continue;
                }

                Producto producto = new Producto();
                producto.setNombre(nombre);
                producto.setPrecio(precio);
                producto.setCategoria(categoria);
                producto.setDescripcion(descripcion);
                producto.setEstado(EstadoProducto.DISPONIBLE);
                producto.setImagen("default.jpg");

                productoRepository.save(producto);
                exitosos++;

            } catch (Exception e) {
                fallidos++;
                errores.add("Línea " + (i + 1) + ": Error inesperado - " + e.getMessage());
            }
        }

        resultado.put("exitosos", exitosos);
        resultado.put("fallidos", fallidos);
        resultado.put("errores", errores);

        return resultado;
    }
}