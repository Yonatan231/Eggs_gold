package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.*;
import com.sena.eggs_gold.model.entity.Inventario;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model; // ✅ correcta
import com.sena.eggs_gold.service.InventarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.boot.origin.Origin;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {
    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }
    @GetMapping("/disponibles")
    @ResponseBody
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




        @PostMapping("/agregar")
        @ResponseBody
        public ResponseEntity<?> agregarInventario(@RequestBody InventarioRequestDTO dto) {
            inventarioService.agregarInventario(dto);
            return ResponseEntity.ok("Inventario agregado correctamente");
        }


    @GetMapping("/detalle")
    @ResponseBody
    public List<InventarioDetalleDTO> obtenerInventarioCompleto() {
        return inventarioService.obtenerInventarioDetallado();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerInventario(@PathVariable Integer id) {
        Inventario inventario = inventarioService.obtenerPorId(id);
        if (inventario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Producto no encontrado"));
        }
        return ResponseEntity.ok(inventario);
    }

    @PostMapping("/actualizar")
    public ResponseEntity<?> actualizarInventario(@ModelAttribute Inventario inventario) {
        boolean actualizado = inventarioService.actualizarInventario(inventario);
        if (actualizado) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error al actualizar"));
        }
    }
}
