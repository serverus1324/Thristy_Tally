package com.example.CalcGastosU.optimization.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class OptimizationRequestDTO {
    private Double presupuestoDisponible;
    private String idPeriodo;
    private String idPresupuesto;
    private List<OptimizationCategoryDTO> categorias;
}
