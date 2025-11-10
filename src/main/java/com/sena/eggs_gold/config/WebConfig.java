package com.sena.eggs_gold.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // CONFIGURACIÓN 1: Carpeta de UPLOADS (fotos de perfil)
        // ==================================================
        // Cuando el navegador pide: http://localhost:8080/uploads/fotos/perfil_123.jpg
        // Spring Boot busca en: C:/eggs-gold-uploads/fotos/perfil_123.jpg
        registry.addResourceHandler("/uploads/fotos/**")  // URL que escribirá el navegador
                .addResourceLocations("file:C:/eggs-gold-uploads/fotos/");  // Carpeta real en tu PC


        // CONFIGURACIÓN 2: Imágenes estáticas del proyecto (logos, productos, etc.)
        // =========================================================================
        // Esta configuración mantiene funcionando las imágenes que ya tienes
        // Cuando el navegador pide: http://localhost:8080/imagenes/logo.jpg
        // Spring Boot busca en: src/main/resources/static/imagenes/logo.jpg
        registry.addResourceHandler("/imagenes/**")
                .addResourceLocations("classpath:/static/imagenes/");

    }
}