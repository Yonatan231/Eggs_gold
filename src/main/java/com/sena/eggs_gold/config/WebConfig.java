package com.sena.eggs_gold.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CONFIGURACIÓN WEB PARA SERVIR ARCHIVOS EXTERNOS
 *
 * Esta clase le dice a Spring Boot dónde buscar los archivos
 * cuando el navegador pide algo como: /uploads/fotos/imagen.jpg
 *
 * NIVEL PRINCIPIANTE:
 * - Piensa en esto como un "mapa" que le indica a Spring Boot
 *   dónde están guardadas las fotos de perfil
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Este método configura las rutas para servir archivos estáticos
     *
     * IMPORTANTE: Aquí le decimos a Spring Boot:
     * - Cuando el navegador pida: /uploads/fotos/imagen.jpg
     * - Búscala en: C:/eggs-gold-uploads/fotos/imagen.jpg
     */
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


        // NOTA IMPORTANTE PARA LINUX/MAC:
        // Si usas Linux o Mac, cambia la ruta de uploads a:
        // .addResourceLocations("file:/home/tu-usuario/eggs-gold-uploads/fotos/");


        System.out.println("✅ Configuración de archivos estáticos cargada:");
        System.out.println("   📁 /uploads/fotos/** → C:/eggs-gold-uploads/fotos/");
        System.out.println("   📁 /imagenes/** → resources/static/imagenes/");
    }
}