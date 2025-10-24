package com.example.CalcGastosU.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.io.Serializable;

@NoArgsConstructor
@Data
public class NecesidadDTO implements Serializable {

    private ObjectId id;
    private String descripcion;
    private Double monto;
    private Integer esPredeterminada;
    private Boolean excedePresupuesto = false;
    private ObjectId idEstudiante;
    private ObjectId idPeriodo;
    private ObjectId idPresupuesto;
}
