package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.ConductorDTO;
import com.sena.eggs_gold.model.entity.Usuario;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;

public interface ConductorService {

    // Solo logística puede registrar un conductor
    void registrarConductor(ConductorDTO dto);

    // Para login de conductor
    ConductorDTO login(String numDocumento, String password);

    List<ConductorDTO> obtenerConductoresConPedidosEntregados();

    // ✅ NUEVO: Obtener pedidos asignados al conductor
    List<Map<String, Object>> obtenerPedidosAsignados(Integer idConductor);

    // ✅ NUEVO: Obtener pedidos en camino del conductor
    List<Map<String, Object>> obtenerPedidosEnCamino(Integer idConductor);

    // ✅ NUEVO: Aceptar pedido (cambiar a EN_CAMINO)
    void aceptarPedido(Integer idPedido, Integer idConductor);

    // ✅ MODIFICAR: Marcar pedido como entregado (ahora con observación)
    void marcarPedidoEntregado(Integer idPedido, Integer idConductor, String observacion);

    // ✅ NUEVO: Obtener historial de pedidos entregados
    List<Map<String, Object>> obtenerHistorialPedidos(Integer idConductor);


}