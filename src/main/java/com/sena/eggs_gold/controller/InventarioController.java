package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.model.entity.Inventario;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model; // ✅ correcta
import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.service.InventarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.boot.origin.Origin;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {
    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }
    @GetMapping("/disponibles")
    public ResponseEntity<List<ProductoDisponibleDTO>>listaProductoDisponible(){
        return ResponseEntity.ok(inventarioService.ListaProductoDisponible());
    }
    @GetMapping("")
    public String mostrarInventario(HttpSession session, Model model) {
        ClienteDTO cliente = (ClienteDTO) session.getAttribute("cliente");

        System.out.println("Cliente en sesión: " + session.getAttribute("cliente"));


        if (cliente == null) {
            return "redirect:/login";
        }

        model.addAttribute("cliente", cliente);
        return "inventario";
    }

//muestra los productos en administrador
    @GetMapping("producto")
    @ResponseBody
    public List<ProductoDisponibleDTO> obtenerProductosDisponibles() {
        return inventarioService.obtenerProductosDisponibles(); // Servicio que implementa la lógica de SQL
    }

    @GetMapping("mostrarProducto")
    @ResponseBody
    public Map<String, Object> obtenerInventario() {
        List<Inventario> inventario = inventarioService.obtenerInventario();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", inventario);

        return response;
    }
}
