package com.example.CalcGastosU.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@Data
public class LoginRequestDTO implements Serializable {
    private String username;
    private String password;
}
