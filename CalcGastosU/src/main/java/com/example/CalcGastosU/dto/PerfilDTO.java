package com.example.CalcGastosU.dto;

import com.example.CalcGastosU.enums.TipoUsuario;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;

import java.io.Serializable;

@NoArgsConstructor
@Data
public class PerfilDTO implements Serializable {

    private ObjectId id;
    private String nombre;
    private String email;
    private String telefono;
    private String username;
    private String password;
    private TipoUsuario tipoUsuario;
}
