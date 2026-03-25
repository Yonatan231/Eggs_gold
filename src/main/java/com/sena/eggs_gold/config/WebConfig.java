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

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(roleInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/css/**",
                        "/js/**",
                        "/imagenes/**",
                        "/uploads/**",
                        "/error/**"
                );
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/uploads/perfil/**")
                .addResourceLocations("file:C:/eggs_gold_uploads/perfil/")
                .setCachePeriod(0);

        registry.addResourceHandler("/uploads/productos/**")
                .addResourceLocations("file:C:/eggs_gold_uploads/productos/")
                .setCachePeriod(0);

        registry.addResourceHandler("/uploads/novedades/**")
                .addResourceLocations("file:C:/eggs_gold_uploads/novedades/")
                .setCachePeriod(0);

        registry.addResourceHandler("/imagenes/**")
                .addResourceLocations("classpath:/static/imagenes/")
                .setCachePeriod(3600);
    }
}
