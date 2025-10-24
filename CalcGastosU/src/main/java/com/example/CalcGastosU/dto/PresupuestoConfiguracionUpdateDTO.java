package com.example.CalcGastosU.dto;

// Puedes añadir validaciones si lo deseas (ej. @NotNull, @Min, @Max para porcentajeAumento)
// import javax.validation.constraints.*; // Si usas Jakarta EE 9+
// import jakarta.validation.constraints.*; // Si usas Jakarta EE 10+


public class PresupuestoConfiguracionUpdateDTO {

    private String frecuenciaCalculo; // Ej: "mensual", "semestral"

    // Asumimos que el porcentajeAumento se guarda como un valor decimal (ej: 0.05 para 5%)
    // Si en el frontend se ingresa como 5 (para 5%), recuerda hacer la conversión (dividir por 100)
    // antes de enviar al backend, o manejarla en el servicio.
    // El frontend ya lo está haciendo (parseFloat(porcentajeAumento) / 100), así que está bien.
    private Double porcentajeAumento;

    // Getters y Setters
    public String getFrecuenciaCalculo() {
        return frecuenciaCalculo;
    }

    public void setFrecuenciaCalculo(String frecuenciaCalculo) {
        this.frecuenciaCalculo = frecuenciaCalculo;
    }

    public Double getPorcentajeAumento() {
        return porcentajeAumento;
    }

    public void setPorcentajeAumento(Double porcentajeAumento) {
        this.porcentajeAumento = porcentajeAumento;
    }
}