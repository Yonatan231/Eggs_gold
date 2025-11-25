package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.VehiculoDTO;
import com.sena.eggs_gold.dto.VehiculoResponseDTO;
import com.sena.eggs_gold.service.VehiculoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class VehiculoController {

    @Autowired
    private VehiculoService vehiculoService;

    // ==========================================
    // MOSTRAR LA PÁGINA PRINCIPAL
    // ==========================================
    @GetMapping("/registro_vehiculo")
    public String mostrarPagina(HttpSession session, Model model) {
        // Verificar que hay un conductor en sesión
        Integer idConductor = (Integer) session.getAttribute("usuario_id");
        if (idConductor == null) {
            return "redirect:/login";
        }

        // Cargar los vehículos del conductor (ya como DTOs)
        List<VehiculoResponseDTO> vehiculos = vehiculoService.listarVehiculosPorConductor(idConductor);
        model.addAttribute("vehiculos", vehiculos);

        return "registros/registro_vehiculo";
    }

    // ==========================================
    // API REST - LISTAR VEHÍCULOS (retorna DTOs)
    // ==========================================
    @GetMapping("/api/vehiculos/listar")
    @ResponseBody
    public ResponseEntity<List<VehiculoResponseDTO>> listarVehiculos(HttpSession session) {
        Integer idConductor = (Integer) session.getAttribute("usuario_id");
        if (idConductor == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // El servicio ya retorna DTOs, sin referencias circulares
        List<VehiculoResponseDTO> vehiculos = vehiculoService.listarVehiculosPorConductor(idConductor);
        return ResponseEntity.ok(vehiculos);
    }

    // ==========================================
    // API REST - CREAR VEHÍCULO (retorna DTO)
    // ==========================================
    @PostMapping("/api/vehiculos/crear")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> crearVehiculo(
            @RequestBody VehiculoDTO vehiculoDTO,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        // Obtener ID del conductor desde la sesión
        Integer idConductor = (Integer) session.getAttribute("usuario_id");
        if (idConductor == null) {
            response.put("exito", false);
            response.put("mensaje", "No se pudo identificar al conductor.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            // Registrar vehículo (retorna DTO, sin referencias circulares)
            VehiculoResponseDTO vehiculoRegistrado = vehiculoService.registrarVehiculo(vehiculoDTO, idConductor);

            if (vehiculoRegistrado == null) {
                response.put("exito", false);
                response.put("mensaje", "Ya existe un vehículo con esa placa.");
                return ResponseEntity.badRequest().body(response);
            }

            response.put("exito", true);
            response.put("mensaje", "Vehículo registrado correctamente.");
            response.put("vehiculo", vehiculoRegistrado);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al registrar el vehículo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==========================================
    // API REST - ACTUALIZAR VEHÍCULO (retorna DTO)
    // ==========================================
    @PutMapping("/api/vehiculos/actualizar/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarVehiculo(
            @PathVariable Integer id,
            @RequestBody VehiculoDTO vehiculoDTO,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        Integer idConductor = (Integer) session.getAttribute("usuario_id");
        if (idConductor == null) {
            response.put("exito", false);
            response.put("mensaje", "No se pudo identificar al conductor.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            // Actualizar vehículo (retorna DTO, sin referencias circulares)
            VehiculoResponseDTO vehiculoActualizado = vehiculoService.actualizarVehiculo(id, vehiculoDTO, idConductor);

            if (vehiculoActualizado == null) {
                response.put("exito", false);
                response.put("mensaje", "Ya existe un vehículo con esa placa.");
                return ResponseEntity.badRequest().body(response);
            }

            response.put("exito", true);
            response.put("mensaje", "Vehículo actualizado correctamente.");
            response.put("vehiculo", vehiculoActualizado);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("exito", false);
            response.put("mensaje", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("exito", false);
            response.put("mensaje", "Error al actualizar el vehículo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==========================================
    // API REST - CAMBIAR ESTADO (retorna DTO)
    // ==========================================
    @PatchMapping("/api/vehiculos/cambiar-estado/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cambiarEstado(
            @PathVariable Integer id,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        Integer idConductor = (Integer) session.getAttribute("usuario_id");
        if (idConductor == null) {
            response.put("exito", false);
            response.put("mensaje", "No se pudo identificar al conductor.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        try {
            // Cambiar estado (retorna DTO, sin referencias circulares)
            VehiculoResponseDTO vehiculoActualizado = vehiculoService.cambiarEstado(id, idConductor);

            response.put("exito", true);
            response.put("mensaje", "Estado actualizado correctamente.");
            response.put("vehiculo", vehiculoActualizado);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("exito", false);
            response.put("mensaje", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==========================================
    // API REST - BUSCAR VEHÍCULO POR ID (retorna DTO)
    // ==========================================
    @GetMapping("/api/vehiculos/{id}")
    @ResponseBody
    public ResponseEntity<VehiculoResponseDTO> buscarVehiculo(@PathVariable Integer id) {
        // El servicio ya retorna DTO, sin referencias circulares
        VehiculoResponseDTO vehiculo = vehiculoService.buscarPorId(id);

        if (vehiculo == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(vehiculo);
    }
}