package com.sena.eggs_gold.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


    @Controller
    public class HomeController {

        @GetMapping("/")
        public String home() {
            return "inicio"; // busca en templates/inicio.html
        }
    }


