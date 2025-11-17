package com.sena.eggs_gold.model.enums;

public enum EstadoPedido {
    PENDIENTE,           // El pedido acaba de crearse, cliente lo envia
    EN_ALISTAMIENTO,     // El pedido se está preparando, logistica lo toma
    LISTO,               // El pedido está listo para enviar, lo
    ASIGNADO,            // Se asignó un conductor al pedido
    EN_CAMINO,           // El conductor está llevando el pedido
    ENTREGADO            // El pedido ya llegó al cliente
}