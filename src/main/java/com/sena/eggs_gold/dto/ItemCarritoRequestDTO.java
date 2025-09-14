package com.sena.eggs_gold.dto;

import lombok.Data;

@Data
public class ItemCarritoRequestDTO {
    private Integer usuario;
    private Integer producto;
    private Integer cantidad;
}
