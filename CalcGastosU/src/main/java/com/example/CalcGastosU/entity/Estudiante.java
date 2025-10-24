package com.example.CalcGastosU.entity;

import com.example.CalcGastosU.serializer.ObjectIdSerializer;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@JsonTypeName("estudiantes")
@Document("estudiantes")
public class Estudiante {

    @BsonProperty("_id")
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId id;

    @BsonProperty("nombre")
    private String nombre;

    @BsonProperty("email")
    private String email;

    @BsonProperty("telefono")
    private String telefono;

    @BsonProperty("idEstudiante")
    private ObjectId idEstudiante;


    public Estudiante id(ObjectId id) {
        this.id = id;
        return this;
    }

    @JsonProperty("_id")
    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public Estudiante idEstudiante(ObjectId id) {
        this.idEstudiante = id;
        return this;
    }

    @JsonProperty("idEstudiante")
    public ObjectId getIdEstudiante() {
        return id;
    }

    public void setIdEstudiante(ObjectId idEstudiante) {
        this.idEstudiante = id;
    }

    public Estudiante email(String email) {
        this.email = email;
        return this;
    }

    @JsonProperty("email")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Estudiante nombre(String nombre) {
        this.nombre = nombre;
        return this;
    }

    @JsonProperty("nombre")
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Estudiante telefono(String telefono) {
        this.telefono = telefono;
        return this;
    }

    @JsonProperty("telefono")
    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Estudiante estudiantes = (Estudiante) o;
        return Objects.equals(this.id, estudiantes.id) &&
                Objects.equals(this.idEstudiante, estudiantes.idEstudiante) &&
                Objects.equals(this.email, estudiantes.email) &&
                Objects.equals(this.nombre, estudiantes.nombre) &&
                Objects.equals(this.telefono, estudiantes.telefono);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, idEstudiante, email, nombre, telefono);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class EstudiantesEntity {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    idEstudiante: ").append(toIndentedString(id)).append("\n");
        sb.append("    email: ").append(toIndentedString(email)).append("\n");
        sb.append("    nombre: ").append(toIndentedString(nombre)).append("\n");
        sb.append("    telefono: ").append(toIndentedString(telefono)).append("\n");
        sb.append("}");
        return sb.toString();
    }

    private String toIndentedString(Object o) {
        if (o == null) {
            return "null";
        }
        return o.toString().replace("\n", "\n    ");
    }
}
