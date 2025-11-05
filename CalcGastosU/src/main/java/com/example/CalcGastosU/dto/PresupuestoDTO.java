package com.example.CalcGastosU.dto;

import com.example.CalcGastosU.serializer.ObjectIdDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.io.Serializable;

@NoArgsConstructor
@Data
public class PresupuestoDTO implements Serializable {

    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private ObjectId id;
    private Double monto;
    private String descripcion;
    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private ObjectId idEstudiante;
    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private ObjectId idPeriodo;
}
