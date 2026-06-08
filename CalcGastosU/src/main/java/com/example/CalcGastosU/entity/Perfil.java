package com.example.CalcGastosU.entity;

import com.example.CalcGastosU.enums.TipoUsuario;
import com.example.CalcGastosU.serializer.ObjectIdSerializer;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@JsonTypeName("perfiles")
@Document(collection = "perfiles")
public class Perfil {

    @BsonProperty("_id")
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId id;

    @BsonProperty("nombre")
    private String nombre;

    @BsonProperty("email")
    private String email;

    @BsonProperty("telefono")
    private String telefono;

    @BsonProperty("tipoUsuario")
    private TipoUsuario tipoUsuario;

    public Perfil id(ObjectId id) {
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

    public Perfil email(String email) {
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

    public Perfil nombre(String nombre) {
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

    public Perfil telefono(String telefono) {
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

    public Perfil tipoUsuario(TipoUsuario tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
        return this;
    }

    @JsonProperty("tipoUsuario")
    public TipoUsuario getTipoUsuario() {
        return tipoUsuario;
    }

    public void setTipoUsuario(TipoUsuario tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Perfil perfil = (Perfil) o;
        return Objects.equals(id, perfil.id) &&
                Objects.equals(email, perfil.email) &&
                Objects.equals(nombre, perfil.nombre) &&
                Objects.equals(telefono, perfil.telefono);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email, nombre, telefono);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Perfil {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
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
