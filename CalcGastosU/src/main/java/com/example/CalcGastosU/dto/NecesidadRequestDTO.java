package com.example.CalcGastosU.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.io.Serializable;
import java.util.List;

@NoArgsConstructor
@Data
public class NecesidadRequestDTO implements Serializable {

    private List<String> descripcionesSeleccionadas; // Ej: ["Alimentación", "Transporte"]
    private ObjectId idEstudiante;
    private ObjectId idPeriodo;
    private ObjectId idPresupuesto;
}
