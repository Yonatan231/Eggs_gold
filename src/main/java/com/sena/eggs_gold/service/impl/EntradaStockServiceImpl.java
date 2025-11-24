package com.sena.eggs_gold.service.impl;

import com.sena.eggs_gold.dto.EntradaStockDTO;
import com.sena.eggs_gold.model.entity.EntradaStock;
import com.sena.eggs_gold.model.entity.Producto;
import com.sena.eggs_gold.model.entity.Usuario;
import com.sena.eggs_gold.model.enums.EstadoEntradaStock;
import com.sena.eggs_gold.repository.EntradaStockRepository;
import com.sena.eggs_gold.repository.ProductoRepository;
import com.sena.eggs_gold.repository.UsuarioRepository;
import com.sena.eggs_gold.service.EntradaStockService;
import com.sena.eggs_gold.service.InventarioService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EntradaStockServiceImpl implements EntradaStockService {

    private final EntradaStockRepository entradaStockRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioService inventarioService;

    public EntradaStockServiceImpl(EntradaStockRepository entradaStockRepository,
                                   ProductoRepository productoRepository,
                                   UsuarioRepository usuarioRepository,
                                   InventarioService inventarioService) {
        this.entradaStockRepository = entradaStockRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.inventarioService = inventarioService;
    }

    @Override
    @Transactional
    public EntradaStock registrarEntrada(Integer idProducto, Integer cantidad, String proveedor) {
        // Buscar el producto
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Crear nueva entrada
        EntradaStock entrada = new EntradaStock();
        entrada.setProducto(producto);
        entrada.setCantidad(cantidad);
        entrada.setProveedor(proveedor);
        // El estado y fecha se setean automáticamente con @PrePersist

        return entradaStockRepository.save(entrada);
    }

    @Override
    public List<EntradaStockDTO> listarTodasLasEntradas() {
        return entradaStockRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EntradaStockDTO> listarEntradasPendientes() {
        return entradaStockRepository.findByEstado(EstadoEntradaStock.PENDIENTE)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // ✅ IMPLEMENTADO: Aprobar entrada y crear inventario
    @Override
    @Transactional
    public boolean aprobarEntrada(Integer idEntrada, Integer idLogistica, Integer cantidadFinal, String observacion) {
        try {
            // 1. Buscar la entrada
            EntradaStock entrada = entradaStockRepository.findById(idEntrada)
                    .orElseThrow(() -> new RuntimeException("Entrada no encontrada"));

            // 2. Verificar que esté pendiente
            if (entrada.getEstado() != EstadoEntradaStock.PENDIENTE) {
                throw new RuntimeException("La entrada ya fue procesada");
            }

            // 3. Buscar usuario de logística
            Usuario logistica = usuarioRepository.findById(idLogistica)
                    .orElseThrow(() -> new RuntimeException("Usuario de logística no encontrado"));

            // 4. Actualizar la entrada
            entrada.setEstado(EstadoEntradaStock.APROBADO);
            entrada.setLogistica(logistica);
            entrada.setCantidad(cantidadFinal); // Actualizar cantidad si fue modificada
            entrada.setObservacion(observacion); // Agregar observación de logística
            entradaStockRepository.save(entrada);

            // 5. Crear registro en inventario
            inventarioService.crearInventarioDesdeEntrada(
                    entrada.getProducto().getIdProducto(),
                    cantidadFinal,
                    "Bodega Principal",  // ✅ Siempre fijo
                    observacion
            );

            return true;

        } catch (Exception e) {
            System.err.println("Error al aprobar entrada: " + e.getMessage());
            return false;
        }
    }

    // Método auxiliar para convertir EntradaStock a DTO
    private EntradaStockDTO convertirADTO(EntradaStock entrada) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        EntradaStockDTO dto = new EntradaStockDTO();
        dto.setId(entrada.getId());
        dto.setIdProducto(entrada.getProducto().getIdProducto());
        dto.setNombreProducto(entrada.getProducto().getNombre());
        dto.setCantidad(entrada.getCantidad());
        dto.setProveedor(entrada.getProveedor());
        dto.setFechaRegistro(entrada.getFechaRegistro().format(formatter));
        dto.setEstado(entrada.getEstado().name());
        dto.setObservacion(entrada.getObservacion());

        return dto;
    }

    @Override
    @Transactional
    public Map<String, Object> guardarEntradasDesdeCSV(MultipartFile archivoCSV) throws IOException {
        Map<String, Object> resultado = new java.util.HashMap<>();
        int exitosos = 0;
        int fallidos = 0;
        List<String> errores = new java.util.ArrayList<>();

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

                // Validar que tenga los 3 campos necesarios
                if (datos.length < 3) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": Faltan datos (debe tener: nombreProducto,cantidad,proveedor)");
                    continue;
                }

                // Extraer datos
                String nombreProducto = datos[0].trim();
                String cantidadStr = datos[1].trim();
                String proveedor = datos[2].trim();

                // Validar nombre del producto
                if (nombreProducto.isEmpty()) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": El nombre del producto no puede estar vacío");
                    continue;
                }

                // Buscar el producto por nombre (ignora mayúsculas/minúsculas)
                Producto producto = productoRepository.findByNombreIgnoreCase(nombreProducto)
                        .orElse(null);

                if (producto == null) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": Producto '" + nombreProducto + "' no encontrado");
                    continue;
                }

                // Validar y convertir cantidad
                Integer cantidad;
                try {
                    cantidad = Integer.parseInt(cantidadStr);
                    if (cantidad <= 0) {
                        fallidos++;
                        errores.add("Línea " + (i + 1) + ": La cantidad debe ser mayor a 0");
                        continue;
                    }
                } catch (NumberFormatException e) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": Cantidad inválida '" + cantidadStr + "'");
                    continue;
                }

                // Validar proveedor
                if (proveedor.isEmpty()) {
                    fallidos++;
                    errores.add("Línea " + (i + 1) + ": El proveedor no puede estar vacío");
                    continue;
                }

                // Crear la entrada de stock
                EntradaStock entrada = new EntradaStock();
                entrada.setProducto(producto);
                entrada.setCantidad(cantidad);
                entrada.setProveedor(proveedor);
                // El estado y fecha se setean automáticamente con @PrePersist

                // Guardar en la base de datos
                entradaStockRepository.save(entrada);
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