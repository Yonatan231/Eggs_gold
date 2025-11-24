// ===== EntradaStockService.java =====
package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.EntradaStockDTO;
import com.sena.eggs_gold.model.entity.EntradaStock;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface EntradaStockService {

    // Registrar nueva entrada de stock
    EntradaStock registrarEntrada(Integer idProducto, Integer cantidad, String proveedor);

    // Listar todas las entradas
    List<EntradaStockDTO> listarTodasLasEntradas();

    // Listar solo entradas pendientes (para logística)
    List<EntradaStockDTO> listarEntradasPendientes();

    // Aprobar entrada con parámetros adicionales
    boolean aprobarEntrada(Integer idEntrada, Integer idLogistica, Integer cantidadFinal, String observacion);

    // ✅ NUEVO: Cargar entradas desde CSV
    Map<String, Object> guardarEntradasDesdeCSV(MultipartFile archivoCSV) throws IOException;
}