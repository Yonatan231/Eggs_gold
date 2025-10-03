package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.LoginDTO;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.ui.Model;


    @Controller
    public class HomeController {

        @GetMapping("/")
        public String inicio() {
            return "inicio"; // busca en templates/inicio.html
        }

        @GetMapping("/inicio")
        public String inicio1(){
            return "inicio";
        }

        @GetMapping("/promociones")
        public String promociones() {
            return "promociones"; // busca promociones.html en templates
        }

        @GetMapping("/contacto1")
        public String contacto1(){
            return "contacto1";
        }


        @GetMapping("/inicio_secion")
        public String inicioSecion(Model model) {
            // Creamos un objeto vacío para el formulario
            model.addAttribute("loginDTO", new LoginDTO());
            return "inicio_secion"; // Thymeleaf buscará templates/inicio_secion.html
        }



        @GetMapping("/logistica")
        public String logistica(){
            return "logistica";
        }

        @GetMapping("/historial_productos")
        public String mostrarHistorial() {
            return "historial_productos";
        }

        @GetMapping("/productos")
        public String mostrarProductos() {
            return "productos"; // nombre del archivo productos.html en /templates
        }

        @GetMapping("Registro_conductor")
        public String registroConductor() {
            return "registro_conductor";
        }

        @GetMapping("conductor")
       public String mostrarConductor() {
            return "conductor";
        }


    }


