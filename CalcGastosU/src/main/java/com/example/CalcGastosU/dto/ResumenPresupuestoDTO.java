package com.example.CalcGastosU.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ResumenPresupuestoDTO {
    private String descripcionPresupuesto;
    private double totalAsignado;
    private double totalGastado;
    private double porcentajeConsumido;
    private double disponible;
}
