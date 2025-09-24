package com.sena.eggs_gold.dto;

public class LoginDTO {
    private String documento;
    private String password;


    public String getDocumento(){
        return documento;
    }

    public void setDocumento(String documento){
        this.documento = documento;
    }

    public String getPassword(){
        return password;
    }

    public void setPassword(String password){
        this.password = password;
    }

}
