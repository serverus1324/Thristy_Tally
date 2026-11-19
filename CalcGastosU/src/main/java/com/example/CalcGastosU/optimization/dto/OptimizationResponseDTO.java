package com.example.CalcGastosU.optimization.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationResponseDTO {
    private Boolean success;
    private String status;
    private Double presupuestoDisponible;
    private Double totalGastosOptimizados;
    private Double ahorroMaximo;
    private Double porcentajeAhorro;
    private List<OptimizationDistributionDTO> distribucion;
    private String mensaje;
}
