package com.example.CalcGastosU.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.io.Serializable;

@NoArgsConstructor
@Data
public class PresupuestoDTO implements Serializable {

    private ObjectId id;
    private Double monto;
    private String descripcion;
    private ObjectId idEstudiante;
    private ObjectId idPeriodo;
}
