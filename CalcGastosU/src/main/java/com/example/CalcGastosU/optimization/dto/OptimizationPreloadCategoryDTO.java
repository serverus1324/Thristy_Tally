package com.example.CalcGastosU.optimization.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationPreloadCategoryDTO {
    private String idNecesidad;
    private String name;
    private String descripcion;
    private String tipo;
    private Integer esPredeterminada;
    private Double minimum;
    private Double maximum;
    private Double gastoReal;
}
