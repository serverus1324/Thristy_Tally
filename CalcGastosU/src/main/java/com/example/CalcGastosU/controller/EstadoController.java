package com.example.CalcGastosU.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EstadoController {

    @GetMapping("/estado")
    public String getEstado() {
        return "API funcionando correctamente";
    }
}