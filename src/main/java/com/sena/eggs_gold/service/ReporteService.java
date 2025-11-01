package com.sena.eggs_gold.service;

public interface ReporteService
{
    byte[] generarReporteProductos();
    byte[] generarReportePedidosUsuarios();
    byte[] generarReporteCliente();
    byte[] generarReporteConductor();
    byte[] generarReporteLogistica();
}
