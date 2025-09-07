package com.sena.eggs_gold.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@EqualsAndHashCode(callSuper = false)
@Data
@DiscriminatorValue("cliente")
public class Cliente extends Usuario {


}
