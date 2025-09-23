package com.sena.eggs_gold.service;

import com.sena.eggs_gold.dto.AdminDTO;


public interface AdminService {
    AdminDTO login(String documento, String password);
}
