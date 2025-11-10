package com.sena.eggs_gold.config;

import com.sena.eggs_gold.interceptor.RoleInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final RoleInterceptor roleInterceptor;

    public WebConfig(RoleInterceptor roleInterceptor) {
        this.roleInterceptor = roleInterceptor;
    }

    /**
     * Registrar el interceptor de roles
     * Se ejecuta antes de cada request para validar permisos
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(roleInterceptor)
                .addPathPatterns("/**")  // Aplicar a todas las rutas
                .excludePathPatterns(
                        "/css/**",
                        "/js/**",
                        "/imagenes/**",
                        "/uploads/**",
                        "/error/**"
                ); // Excluir recursos estáticos
    }

    /**
     * Configuración de recursos estáticos
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // carpeta para las fotos de perfil
        registry.addResourceHandler("/uploads/perfil/**")
                .addResourceLocations("file:C:/eggs_gold_uploads/perfil/")
                .setCachePeriod(0);  // Sin caché para fotos de perfil

        // carpeta para las fotos de los productos
        registry.addResourceHandler("/uploads/productos/**")
                .addResourceLocations("file:C:/eggs_gold_uploads/productos/")
                .setCachePeriod(0);  // Sin caché para productos

        // configuracion para mantener las imagenes por defecto (logo, inicio...
        registry.addResourceHandler("/imagenes/**")
                .addResourceLocations("classpath:/static/imagenes/")
                .setCachePeriod(3600);  // Caché de 1 hora para recursos estáticos
    }
}
