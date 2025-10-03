package com.sena.eggs_gold.controller;

import com.sena.eggs_gold.dto.DashboardStatsDTO;
import com.sena.eggs_gold.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/api/dashboard")
    public DashboardStatsDTO getDashboardStats() {
        return dashboardService.obtenerEstadisticas();
    }
}
