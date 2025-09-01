package com.sena.eggs_gold.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


    @Controller
    public class HomeController {

        @GetMapping("/")
        public String inicio() {
            return "inicio"; // busca en templates/inicio.html
        }

        @GetMapping("/promociones")
        public String promociones() {
            return "promociones"; // busca promociones.html en templates
        }

        @GetMapping("/contacto1")
        public String contacto1(){
            return "contacto1";
        }


    }


