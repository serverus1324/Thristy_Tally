package com.example.CalcGastosU.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.io.Serializable;
import java.time.LocalDate;

@NoArgsConstructor
@Data
public class PeriodoDTO implements Serializable {

    private ObjectId id;
    private String nombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private ObjectId idEstudiante;
}
