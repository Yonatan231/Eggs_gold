package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.LoginDTO;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.ui.Model;


    @Controller
    public class HomeController {

        @GetMapping("/")
        public String inicio() {
            return "inicio/inicio";
        }

        @GetMapping("/inicio")
        public String inicio1(){
            return "inicio/inicio";
        }

        @GetMapping("/promociones")
        public String promociones() {
            return "promociones"; // busca promociones.html en templates
        }

        @GetMapping("/contacto")
        public String contacto1(){
            return "inicio/contacto";
        }


        @GetMapping("/iniciar_sesion")
        public String inicioSecion(Model model) {
            // Creamos un objeto vacío para el formulario
            model.addAttribute("loginDTO", new LoginDTO());
            return "iniciar_sesion/iniciar_sesion"; // Thymeleaf buscará templates/inicio_secion.html
        }



        @GetMapping("/logistica")
        public String logistica(){
            return "logistica/logistica";
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

        @GetMapping("mapa_conductor")
        public String mostrarmapaConductor() {
            return "mapa_conductor";
        }


    }


