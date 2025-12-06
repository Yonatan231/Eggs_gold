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
                        "/error/**"
                ); // Excluir recursos estáticos
    }

    /**
     * Configuración de recursos estáticos
     * ✅ YA NO necesitamos /uploads/** porque las imágenes están en Cloudinary
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configuración para mantener las imágenes por defecto (logo, inicio, etc.)
        registry.addResourceHandler("/imagenes/**")
                .addResourceLocations("classpath:/static/imagenes/")
                .setCachePeriod(3600);  // Caché de 1 hora para recursos estáticos
    }
}