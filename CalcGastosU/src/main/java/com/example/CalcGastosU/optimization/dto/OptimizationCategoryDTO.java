package com.example.CalcGastosU.optimization.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OptimizationCategoryDTO {
    private String idNecesidad;
    private String name;
    private String descripcion;
    private String tipo;
    private Integer esPredeterminada;
    private Double gastoReal;
    private Double minimum;
    private Double maximum;
}
