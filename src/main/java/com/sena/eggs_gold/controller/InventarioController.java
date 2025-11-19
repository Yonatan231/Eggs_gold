package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.InventarioDetalleDTO;
import com.sena.eggs_gold.dto.InventarioVistaDTO;
import com.sena.eggs_gold.model.entity.Inventario;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.model.enums.Categoria;
import com.sena.eggs_gold.model.enums.EstadoProducto;
import com.sena.eggs_gold.repository.ProductoRepository;
import com.sena.eggs_gold.service.InventarioService;
import com.sena.eggs_gold.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * CONTROLADOR DE INVENTARIO
 * Maneja las operaciones de la vista de inventario:
 * - Mostrar lista completa agrupada por producto
 * - Buscar productos
 * - Filtrar por estado
 * - Actualizar productos
 */
@Controller
public class InventarioController {

    // ============================================
    // INYECCIÓN DE DEPENDENCIAS
    // ============================================
    @Autowired
    private InventarioService inventarioService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ProductoService productoService;

    // ============================================
    // MOSTRAR VISTA DE INVENTARIO
    // GET /inventario
    // ============================================
    @GetMapping("/inventario")
    public String mostrarInventario(Model model) {
        try {
            // Obtener todos los registros de inventario
            List<InventarioDetalleDTO> inventarios = inventarioService.obtenerInventarioDetallado();

            // Convertir a InventarioVistaDTO agrupando por producto
            List<InventarioVistaDTO> inventariosVista = convertirAVistaDTO(inventarios);

            // Enviar datos a la vista
            model.addAttribute("inventarios", inventariosVista);

            return "administrador/inventario";

        } catch (Exception e) {
            model.addAttribute("error", "Error al cargar el inventario: " + e.getMessage());
            return "administrador/inventario";
        }
    }

    // ============================================
    // OBTENER INVENTARIO (API REST)
    // GET /api/inventario/lista
    // ============================================
    @GetMapping("/api/inventario/lista")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerInventario() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<InventarioDetalleDTO> inventarios = inventarioService.obtenerInventarioDetallado();
            List<InventarioVistaDTO> inventariosVista = convertirAVistaDTO(inventarios);

            response.put("success", true);
            response.put("data", inventariosVista);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener inventario: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ============================================
    // BUSCAR Y FILTRAR INVENTARIO (API REST)
    // GET /api/inventario/buscar
    // ============================================
    @GetMapping("/api/inventario/buscar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> buscarInventario(
            @RequestParam(required = false, defaultValue = "") String buscar,
            @RequestParam(required = false, defaultValue = "todos") String estado) {

        Map<String, Object> response = new HashMap<>();

        try {
            List<InventarioDetalleDTO> inventarios = inventarioService.obtenerInventarioDetallado();
            List<InventarioVistaDTO> inventariosVista = convertirAVistaDTO(inventarios);

            // Aplicar filtros
            List<InventarioVistaDTO> inventariosFiltrados = inventariosVista.stream()
                    .filter(inv -> {
                        if (buscar == null || buscar.trim().isEmpty()) {
                            return true;
                        }
                        String textoBuscar = buscar.toLowerCase();
                        return inv.getNombre().toLowerCase().contains(textoBuscar) ||
                                inv.getCategoria().toLowerCase().contains(textoBuscar) ||
                                inv.getDescripcion().toLowerCase().contains(textoBuscar);
                    })
                    .filter(inv -> {
                        if (estado.equals("todos")) {
                            return true;
                        }
                        // Filtrar por estado del producto (DISPONIBLE, DESCONTINUADO, AGOTADO)
                        return inv.getEstado().equalsIgnoreCase(estado);
                    })
                    .collect(Collectors.toList());

            response.put("success", true);
            response.put("data", inventariosFiltrados);
            response.put("total", inventariosFiltrados.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al buscar: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ============================================
    // OBTENER PRODUCTO POR ID
    // GET /api/inventario/producto/{id}
    // ============================================
    @GetMapping("/api/inventario/producto/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerProductoPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Buscar el producto por ID
            Producto producto = productoRepository.findById(id).orElse(null);

            if (producto == null) {
                response.put("success", false);
                response.put("message", "Producto no encontrado");
                return ResponseEntity.status(404).body(response);
            }

            // Preparar datos del producto para enviar
            Map<String, Object> datos = new HashMap<>();
            datos.put("idProducto", producto.getIdProducto());
            datos.put("nombre", producto.getNombre());
            datos.put("precio", producto.getPrecio());
            datos.put("categoria", producto.getCategoria().name());
            datos.put("descripcion", producto.getDescripcion());
            datos.put("estado", producto.getEstado().name());
            datos.put("imagen", producto.getImagen());

            response.put("success", true);
            response.put("data", datos);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al obtener producto: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ============================================
    // ACTUALIZAR PRODUCTO
    // POST /api/inventario/actualizar
    // Body JSON: solo campos del producto
    // ============================================
    @PostMapping("/api/inventario/actualizar")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarProducto(@RequestBody Map<String, Object> datos) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Obtener ID del producto
            Integer idProducto = Integer.parseInt(datos.get("idProducto").toString());

            // Buscar el producto existente
            Producto producto = productoRepository.findById(idProducto).orElse(null);

            if (producto == null) {
                response.put("success", false);
                response.put("message", "Producto no encontrado");
                return ResponseEntity.status(404).body(response);
            }

            // Actualizar campos del PRODUCTO
            if (datos.containsKey("nombre")) {
                producto.setNombre(datos.get("nombre").toString());
            }

            if (datos.containsKey("precio")) {
                producto.setPrecio(Float.parseFloat(datos.get("precio").toString()));
            }

            if (datos.containsKey("categoria")) {
                producto.setCategoria(Categoria.valueOf(datos.get("categoria").toString()));
            }

            if (datos.containsKey("descripcion")) {
                producto.setDescripcion(datos.get("descripcion").toString());
            }

            if (datos.containsKey("estado")) {
                producto.setEstado(EstadoProducto.valueOf(datos.get("estado").toString()));
            }

            if (datos.containsKey("imagen")) {
                producto.setImagen(datos.get("imagen").toString());
            }

            // Guardar producto actualizado
            productoRepository.save(producto);

            response.put("success", true);
            response.put("message", "Producto actualizado correctamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ============================================
    // ACTUALIZAR PRODUCTO CON IMAGEN
    // POST /api/inventario/actualizar-con-imagen
    // Recibe FormData con campos del producto e imagen opcional
    // ============================================
    @PostMapping("/api/inventario/actualizar-con-imagen")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarProductoConImagen(
            @RequestParam("idProducto") Integer idProducto,
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") Float precio,
            @RequestParam("categoria") String categoria,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("estado") String estado,
            @RequestParam(value = "imagenFile", required = false) MultipartFile imagenFile) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Crear objeto Producto con los datos recibidos
            Producto producto = new Producto();
            producto.setNombre(nombre);
            producto.setPrecio(precio);
            producto.setCategoria(Categoria.valueOf(categoria));
            producto.setDescripcion(descripcion);
            producto.setEstado(EstadoProducto.valueOf(estado));

            // Actualizar producto (con o sin imagen)
            Producto actualizado = productoService.actualizarProductoConImagen(idProducto, producto, imagenFile);

            response.put("success", true);
            response.put("message", "Producto actualizado correctamente");
            response.put("imagen", actualizado.getImagen());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ============================================
    // MÉTODO AUXILIAR: CONVERTIR A VISTA DTO
    // Agrupa inventarios por producto y suma cantidades
    // ============================================
    private List<InventarioVistaDTO> convertirAVistaDTO(List<InventarioDetalleDTO> inventarios) {
        // Agrupar por nombre de producto y sumar cantidades
        Map<String, InventarioVistaDTO> mapaProductos = new HashMap<>();

        for (InventarioDetalleDTO inv : inventarios) {
            String key = inv.getNombre();

            if (mapaProductos.containsKey(key)) {
                // Si ya existe, sumar la cantidad
                InventarioVistaDTO existente = mapaProductos.get(key);
                existente.setCantidadDisponible(
                        existente.getCantidadDisponible() + inv.getCantidadDisponible()
                );

                // Actualizar fecha si es más reciente
                if (inv.getFechaActualizacion().isAfter(existente.getFechaActualizacion())) {
                    existente.setFechaActualizacion(inv.getFechaActualizacion());
                }
            } else {
                // Crear nuevo registro
                InventarioVistaDTO nuevoDTO = new InventarioVistaDTO();
                nuevoDTO.setIdProducto(inv.getIdInventario()); // Temporal, se corregirá
                nuevoDTO.setNombre(inv.getNombre());
                nuevoDTO.setPrecio(inv.getPrecio());
                nuevoDTO.setCategoria(inv.getCategoria());
                nuevoDTO.setDescripcion(inv.getDescripcion());
                nuevoDTO.setEstado("DISPONIBLE"); // Por defecto
                nuevoDTO.setImagen(inv.getImagen());
                nuevoDTO.setCantidadDisponible(inv.getCantidadDisponible());
                nuevoDTO.setFechaActualizacion(inv.getFechaActualizacion());

                mapaProductos.put(key, nuevoDTO);
            }
        }

        // Obtener IDs reales de productos
        List<InventarioVistaDTO> resultado = mapaProductos.values().stream().toList();
        for (InventarioVistaDTO dto : resultado) {
            // Buscar producto por nombre para obtener su ID real
            Producto producto = productoRepository.findAll().stream()
                    .filter(p -> p.getNombre().equals(dto.getNombre()))
                    .findFirst()
                    .orElse(null);

            if (producto != null) {
                dto.setIdProducto(producto.getIdProducto());
                dto.setEstado(producto.getEstado().name());
            }
        }

        return resultado;
    }
}