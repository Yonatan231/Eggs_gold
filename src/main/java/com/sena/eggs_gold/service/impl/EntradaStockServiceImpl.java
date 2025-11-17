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

import java.time.format.DateTimeFormatter;
import java.util.List;
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
}