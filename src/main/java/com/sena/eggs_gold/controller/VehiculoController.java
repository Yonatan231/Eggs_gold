package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.VehiculoDTO;
import com.sena.eggs_gold.model.entity.Vehiculo;
import com.sena.eggs_gold.service.VehiculoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class VehiculoController {

    @Autowired
    private VehiculoService vehiculoService;


@GetMapping("/registro_vehiculo")
public String mostrarFormulario(Model model) {
    model.addAttribute("vehiculo", new VehiculoDTO());
    return "registros/registro_vehiculo"; // nombre del HTML sin extensión
}

 // Procesar el formulario de registro de vehículo

@PostMapping("/registro_vehiculo")
public String registrarVehiculo(@ModelAttribute("vehiculo") VehiculoDTO vehiculoDTO,
                                HttpSession session,
                                Model model) {
    // Obtener id del conductor desde la sesión
    Integer idConductor = (Integer) session.getAttribute("idConductor");
    if (idConductor == null) {
        model.addAttribute("error", "No se pudo identificar al conductor.");
        return "registros/registro_vehiculo";
    }

    // Registrar vehículo
    Vehiculo vehiculoRegistrado = vehiculoService.registrarVehiculo(vehiculoDTO, idConductor);

    if (vehiculoRegistrado == null) {
        model.addAttribute("error", "Ya existe un vehículo con esa placa.");
        return "registros/registro_vehiculo";
    }

    // Mensaje de éxito y limpiar formulario
    model.addAttribute("exito", "Vehículo registrado correctamente.");
    model.addAttribute("vehiculo", new VehiculoDTO());

    return "registros/registro_vehiculo";
}
}





