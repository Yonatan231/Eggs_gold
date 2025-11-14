package com.sena.eggs_gold.model.enums;

public enum EstadoPedido {
    PENDIENTE,           // El pedido acaba de crearse
    EN_ALISTAMIENTO,     // El pedido se está preparando
    LISTO,               // El pedido está listo para enviar
    ASIGNADO,            // Se asignó un conductor al pedido
    EN_CAMINO,           // El conductor está llevando el pedido
    ENTREGADO            // El pedido ya llegó al cliente
}