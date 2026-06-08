package com.example.CalcGastosU.entity;

import com.example.CalcGastosU.enums.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@JsonTypeName("usuarios")
@Document(collection = "usuarios")
public class Usuario {

    @Id
    @BsonProperty("_id")
    private ObjectId id;

    @BsonProperty("username")
    private String username;

    @BsonProperty("password")
    private String password;

    @BsonProperty("nombre")
    private String nombre;

    @Indexed(unique = true)
    @BsonProperty("email")
    private String email;

    @BsonProperty("idPerfil")
    private ObjectId idPerfil;

    @BsonProperty("roles")
    private Set<Role> roles = new HashSet<>();

    @BsonProperty("activo")
    private Boolean activo = true;

    @BsonProperty("codigoVerificacion")
    private String codigoVerificacion;

    @BsonProperty("fechaExpiracionCodigo")
    private LocalDateTime fechaExpiracionCodigo;

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

    @JsonProperty("nombre")
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    @JsonProperty("email")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @JsonProperty("idPerfil")
    public ObjectId getIdPerfil() {
        return idPerfil;
    }

    public void setIdPerfil(ObjectId idPerfil) {
        this.idPerfil = idPerfil;
    }

    @JsonProperty("roles")
    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    @JsonProperty("activo")
    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    @JsonProperty("codigoVerificacion")
    public String getCodigoVerificacion() {
        return codigoVerificacion;
    }

    public void setCodigoVerificacion(String codigoVerificacion) {
        this.codigoVerificacion = codigoVerificacion;
    }

    @JsonProperty("fechaExpiracionCodigo")
    public LocalDateTime getFechaExpiracionCodigo() {
        return fechaExpiracionCodigo;
    }

    public void setFechaExpiracionCodigo(LocalDateTime fechaExpiracionCodigo) {
        this.fechaExpiracionCodigo = fechaExpiracionCodigo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Usuario usuario = (Usuario) o;
        return Objects.equals(this.id, usuario.id) &&
                Objects.equals(this.email, usuario.email) &&
                Objects.equals(this.username, usuario.username) &&
                Objects.equals(this.idPerfil, usuario.idPerfil);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email, username, idPerfil);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Usuario {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    email: ").append(toIndentedString(email)).append("\n");
        sb.append("    username: ").append(toIndentedString(username)).append("\n");
        sb.append("    idPerfil: ").append(toIndentedString(idPerfil)).append("\n");
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
