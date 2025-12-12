package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.EntradaStockDTO;
import com.sena.eggs_gold.model.entity.EntradaStock;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface EntradaStockService {

    EntradaStock registrarEntrada(Integer idProducto, Integer cantidad, String proveedor);

    List<EntradaStockDTO> listarTodasLasEntradas();

    List<EntradaStockDTO> listarEntradasPendientes();

    boolean aprobarEntrada(Integer idEntrada, Integer idLogistica, Integer cantidadFinal, String observacion);

    Map<String, Object> guardarEntradasDesdeCSV(MultipartFile archivoCSV) throws IOException;
}