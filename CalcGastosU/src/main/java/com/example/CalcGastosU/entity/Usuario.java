package com.example.CalcGastosU.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@JsonTypeName("usuarios")
@Document("usuarios")
public class Usuario {

    @BsonProperty("_id")
    private ObjectId id;

    @BsonProperty("username")
    private String username;

    @BsonProperty("password")
    private String password;

    @BsonProperty("idUsuario")
    private ObjectId idUsuario;

    @BsonProperty("idEstudiante")
    private ObjectId idEstudiante;

    public Usuario id(ObjectId id) {
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

    public Usuario idUsuario(ObjectId idUsuario) {
        this.idUsuario = idUsuario;
        return this;
    }

    @JsonProperty("idUsuario")
    public ObjectId getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(ObjectId idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Usuario password(String password) {
        this.password = password;
        return this;
    }

    @JsonProperty("password")
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Usuario username(String username) {
        this.username = username;
        return this;
    }

    @JsonProperty("username")
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Usuario idEstudiante(ObjectId idEstudiante) {
        this.idEstudiante = idEstudiante;
        return this;
    }

    @JsonProperty("idEstudiante")
    public ObjectId getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(ObjectId idEstudiante) {
        this.idEstudiante = idEstudiante;
    }
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Usuario usuarios = (Usuario) o;
        return Objects.equals(this.id, usuarios.id) &&
                Objects.equals(this.idUsuario, usuarios.idUsuario) &&
                Objects.equals(this.password, usuarios.password) &&
                Objects.equals(this.username, usuarios.username) &&
                Objects.equals(this.idEstudiante, usuarios.idEstudiante);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, idUsuario, password, username, idEstudiante);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class UsuariosEntity {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    idUsuario: ").append(toIndentedString(idUsuario)).append("\n");
        sb.append("    password: ").append(toIndentedString(password)).append("\n");
        sb.append("    username: ").append(toIndentedString(username)).append("\n");
        sb.append("    idEstudiante: ").append(toIndentedString(idEstudiante)).append("\n");
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
