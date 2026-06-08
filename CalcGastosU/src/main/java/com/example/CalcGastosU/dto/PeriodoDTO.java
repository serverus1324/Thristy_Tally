package com.example.CalcGastosU.dto;

import com.example.CalcGastosU.serializer.ObjectIdDeserializer;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.io.Serializable;
import java.time.LocalDate;

@NoArgsConstructor
@Data
public class PeriodoDTO implements Serializable {

    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private ObjectId id;
    private String nombre;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private ObjectId idPerfil;
}
