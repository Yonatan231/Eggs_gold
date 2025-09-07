package com.sena.eggs_gold.model.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
@DiscriminatorValue("conductor")
public class Conductor extends Usuario {

    @ManyToOne
    @JoinColumn(name = "vehiculo_id", nullable = true)
    private Vehiculo vehiculo;

}
