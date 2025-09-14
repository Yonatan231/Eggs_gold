package com.sena.eggs_gold.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model; // ✅ correcta
import com.sena.eggs_gold.dto.ClienteDTO;
import com.sena.eggs_gold.dto.ProductoDisponibleDTO;
import com.sena.eggs_gold.service.InventarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.boot.origin.Origin;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

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


}
