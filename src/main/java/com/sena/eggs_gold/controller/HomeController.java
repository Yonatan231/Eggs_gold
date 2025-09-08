package com.sena.eggs_gold.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


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
        public String inicioSecion(){
            return "inicio_secion";
        }

        @GetMapping("/inventario")
        public String inventario(){
            return "inventario";
        }

        @GetMapping("/logistica")
        public String logistica(){
            return "logistica";
        }


    }


