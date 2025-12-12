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

        @GetMapping("/contacto")
        public String contacto1(){
            return "inicio/contacto";
        }


        @GetMapping("/iniciar_sesion")
        public String inicioSecion(Model model) {
            model.addAttribute("loginDTO", new LoginDTO());
            return "iniciar_sesion/iniciar_sesion"; // Thymeleaf buscará templates/inicio_secion
        }

    }


