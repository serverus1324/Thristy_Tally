package com.example.CalcGastosU.dto;

import com.example.CalcGastosU.serializer.ObjectIdDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.io.Serializable;

@NoArgsConstructor
@Data
public class NecesidadDTO implements Serializable {

    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private ObjectId id;
    private String descripcion;
    private Double monto;
    private Integer esPredeterminada;
    private Boolean excedePresupuesto = false;
    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private ObjectId idEstudiante;
    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private ObjectId idPeriodo;
    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private ObjectId idPresupuesto;
}
