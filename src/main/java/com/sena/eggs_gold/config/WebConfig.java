package com.sena.eggs_gold.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // carpeta para las fotos de perfil
        registry.addResourceHandler("/uploads/perfil/**")
                .addResourceLocations("file:C:/eggs_gold_uploads/perfil/");

        // carpeta para las fotos de los productos
        registry.addResourceHandler("/uploads/productos/**")
                .addResourceLocations("file:C:/eggs_gold_uploads/productos/");


        // configuracion para mantener las imagenes por defecto (logo, inicio...)
        registry.addResourceHandler("/imagenes/**")
                .addResourceLocations("classpath:/static/imagenes/");

    }
}