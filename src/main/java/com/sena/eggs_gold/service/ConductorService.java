package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.model.entity.Usuario;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface ConductorService {

    void registrarConductor(ConductorDTO dto);

    ConductorDTO login(String numDocumento, String password);

    List<ConductorDTO> obtenerConductoresConPedidosEntregados();

    List<Map<String, Object>> obtenerPedidosAsignados(Integer idConductor);

    List<Map<String, Object>> obtenerPedidosEnCamino(Integer idConductor);

    void aceptarPedido(Integer idPedido, Integer idConductor);

    void marcarPedidoEntregado(Integer idPedido, Integer idConductor, String observacion);

    List<Map<String, Object>> obtenerHistorialPedidos(Integer idConductor);


}