package com.sena.eggs_gold;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EggsGoldApplication {

    public static void main(String[] args) {
        SpringApplication.run(EggsGoldApplication.class, args);
    }

}