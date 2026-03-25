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


    /**
     * Guarda una imagen de producto en la carpeta externa
     * @param archivo - Archivo MultipartFile de la imagen
     * @return String - Nombre único del archivo guardado
     */
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


    // ============================================
    // NUEVO MÉTODO: Actualizar producto con imagen opcional
    // ============================================
    @Override
    public Producto actualizarProductoConImagen(Integer id, Producto datosProducto, MultipartFile imagenFile) throws IOException {
        // Buscar el producto existente
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con id " + id));


        // Actualizar campos básicos
        producto.setNombre(datosProducto.getNombre());
        producto.setPrecio(datosProducto.getPrecio());
        producto.setCategoria(datosProducto.getCategoria());
        producto.setDescripcion(datosProducto.getDescripcion());
        producto.setEstado(datosProducto.getEstado());


        // Si se envió una nueva imagen, guardarla y actualizar
        if (imagenFile != null && !imagenFile.isEmpty()) {
            String nombreArchivo = guardarImagenProducto(imagenFile);
            producto.setImagen(nombreArchivo);
        }
        // Si no se envió imagen, mantener la imagen actual (no hacer nada)


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


        // Leer el archivo CSV
        String contenido = new String(archivoCSV.getBytes());
        String[] lineas = contenido.split("\n");


        // Procesar cada línea (saltamos la primera que son los encabezados)
        for (int i = 1; i < lineas.length; i++) {
            String linea = lineas[i].trim();


            // Saltar líneas vacías
            if (linea.isEmpty()) {
                continue;
            }


            try {
                // Dividir la línea por comas
                String[] datos = linea.split(",");


                // Validar que tenga los 4 campos necesarios
                if (datos.length < 4) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": Faltan datos (debe tener: nombre,precio,categoria,descripcion)");
                    continue;
                }


                // Extraer datos
                String nombre = datos[0].trim();
                String precioStr = datos[1].trim();
                String categoriaStr = datos[2].trim().toUpperCase();
                String descripcion = datos[3].trim();


                // Validar nombre
                if (nombre.isEmpty()) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": El nombre no puede estar vacío");
                    continue;
                }


                // Validar y convertir precio
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


                // Validar categoría
                com.sena.eggs_gold.model.enums.Categoria categoria;
                try {
                    categoria = com.sena.eggs_gold.model.enums.Categoria.valueOf(categoriaStr);
                } catch (IllegalArgumentException e) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": Categoría inválida '" + categoriaStr + "' (debe ser: A, AA o AAA)");
                    continue;
                }


                // Validar descripción
                if (descripcion.isEmpty()) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": La descripción no puede estar vacía");
                    continue;
                }


                // Crear el producto
                Producto producto = new Producto();
                producto.setNombre(nombre);
                producto.setPrecio(precio);
                producto.setCategoria(categoria);
                producto.setDescripcion(descripcion);
                producto.setEstado(EstadoProducto.DISPONIBLE);
                producto.setImagen("default.jpg"); // Imagen por defecto


                // Guardar en la base de datos
                productoRepository.save(producto);
                exitosos++;


            } catch (Exception e) {
                fallidos++;
                errores.add("Línea " + (i + 1) + ": Error inesperado - " + e.getMessage());
            }
        }


        // Preparar respuesta
        resultado.put("exitosos", exitosos);
        resultado.put("fallidos", fallidos);
        resultado.put("errores", errores);


        return resultado;
    }


}
