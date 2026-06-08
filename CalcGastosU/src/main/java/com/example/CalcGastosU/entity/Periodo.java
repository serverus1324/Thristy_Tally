package com.example.CalcGastosU.entity;

import com.example.CalcGastosU.serializer.ObjectIdSerializer;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.Objects;

@JsonTypeName("periodo")
@Document("periodo")
public class Periodo {

    @BsonProperty("_id")
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId id;

    @BsonProperty("nombre")
    private String nombre;

    @BsonProperty("fechaInicio")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaInicio;

    @BsonProperty("fechaFin")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fechaFin;

    @BsonProperty("idPerfil")
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId idPerfil;

    public Periodo id(ObjectId id) {
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

    public Periodo fechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
        return this;
    }

    @JsonProperty("fechaFin")
    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Periodo fechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
        return this;
    }

    @JsonProperty("fechaInicio")
    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public Periodo nombre(String nombre) {
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

    public Periodo idPerfil(ObjectId idPerfil) {
        this.idPerfil = idPerfil;
        return this;
    }

    @JsonProperty("idPerfil")
    public ObjectId getIdPerfil() {
        return idPerfil;
    }

    public void setIdPerfil(ObjectId idPerfil) {
        this.idPerfil = idPerfil;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Periodo periodo = (Periodo) o;
        return Objects.equals(id, periodo.id) &&
                Objects.equals(fechaFin, periodo.fechaFin) &&
                Objects.equals(fechaInicio, periodo.fechaInicio) &&
                Objects.equals(nombre, periodo.nombre) &&
                Objects.equals(idPerfil, periodo.idPerfil);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, fechaFin, fechaInicio, nombre, idPerfil);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class Periodo {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    fechaFin: ").append(toIndentedString(fechaFin)).append("\n");
        sb.append("    fechaInicio: ").append(toIndentedString(fechaInicio)).append("\n");
        sb.append("    nombre: ").append(toIndentedString(nombre)).append("\n");
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
