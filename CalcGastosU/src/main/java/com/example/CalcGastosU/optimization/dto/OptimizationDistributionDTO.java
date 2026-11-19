package com.example.CalcGastosU.optimization.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationDistributionDTO {
    private String idNecesidad;
    private String categoria;
    private String descripcion;
    private String tipo;
    private Integer esPredeterminada;
    private Double minimo;
    private Double maximo;
    private Double asignacionOptima;
    private Double gastoReal;
    private Double diferencia;
    private Boolean excedeMaximo;
}
