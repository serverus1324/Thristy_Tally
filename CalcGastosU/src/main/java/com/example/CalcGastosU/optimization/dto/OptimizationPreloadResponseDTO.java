package com.example.CalcGastosU.optimization.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationPreloadResponseDTO {
    private Boolean success;
    private Double presupuestoDisponible;
    private Double totalMinimos;
    private Double margenDisponible;
    private List<OptimizationPreloadCategoryDTO> categorias;
    private String mensaje;
}
