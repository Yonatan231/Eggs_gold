package com.sena.eggs_gold.model.enums;

public enum EstadoPedido {
    PENDIENTE,           // el pedido acaba de crearse, cliente lo envia
    EN_ALISTAMIENTO,     // el pedido se esta preparando, logistica lo toma
    LISTO,               // el pedido está listo para asignarlo a un conductor
    ASIGNADO,            // se asigno  un conductor al pedido
    EN_CAMINO,           // el conductor esta llevando el pedido
    ENTREGADO            // el pedido ya llego al cliente
}