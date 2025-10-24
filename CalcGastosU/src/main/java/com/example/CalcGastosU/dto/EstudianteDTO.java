package com.example.CalcGastosU.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.io.Serializable;

@NoArgsConstructor
@Data
public class EstudianteDTO implements Serializable {

    private ObjectId id;
    private String nombre;
    private String email;
    private String telefono;
    private String username;
    private String password;
}
