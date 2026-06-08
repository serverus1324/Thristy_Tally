package com.example.CalcGastosU.entity;

import com.example.CalcGastosU.serializer.ObjectIdSerializer;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@JsonTypeName("presupuesto")
@Document("presupuesto")
public class Presupuesto {

    @BsonProperty("_id")
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId id;

    @BsonProperty("descripcion")
    private String descripcion;

    @BsonProperty("monto")
    private Double monto;

    @BsonProperty("frecuenciaCalculo")
    private String frecuenciaCalculo;

    @BsonProperty("porcentajeAumento")
    private Double porcentajeAumento;

    @BsonProperty("idPerfil")
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId idPerfil;

    @BsonProperty("idPeriodo")
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId idPeriodo;

    @JsonProperty("_id")
    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public Presupuesto id(ObjectId id) {
        this.id = id;
        return this;
    }

    public Presupuesto descripcion(String descripcion) {
        this.descripcion = descripcion;
        return this;
    }

    @JsonProperty("descripcion")
    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Presupuesto monto(Double monto) {
        this.monto = monto;
        return this;
    }

    @JsonProperty("monto")
    public Double getMonto() {
        return monto;
    }

    public void setMonto(Double monto) {
        this.monto = monto;
    }

    public Presupuesto idPerfil(ObjectId idPerfil) {
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

    public Presupuesto idPeriodo(ObjectId idPeriodo) {
        this.idPeriodo = idPeriodo;
        return this;
    }

    @JsonProperty("idPeriodo")
    public ObjectId getIdPeriodo() {
        return idPeriodo;
    }

    public void setIdPeriodo(ObjectId idPeriodo) {
        this.idPeriodo = idPeriodo;
    }

    @JsonProperty("frecuenciaCalculo")
    public String getFrecuenciaCalculo() {
        return frecuenciaCalculo;
    }

    public void setFrecuenciaCalculo(String frecuenciaCalculo) {
        this.frecuenciaCalculo = frecuenciaCalculo;
    }

    @JsonProperty("porcentajeAumento")
    public Double getPorcentajeAumento() {
        return porcentajeAumento;
    }

    public void setPorcentajeAumento(Double porcentajeAumento) {
        this.porcentajeAumento = porcentajeAumento;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Presupuesto presupuestos = (Presupuesto) o;
        return Objects.equals(this.id, presupuestos.id) &&
                Objects.equals(this.descripcion, presupuestos.descripcion) &&
                Objects.equals(this.monto, presupuestos.monto) &&
                Objects.equals(this.idPerfil, presupuestos.idPerfil) &&
                Objects.equals(this.idPeriodo, presupuestos.idPeriodo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, id, descripcion, monto, idPerfil, idPeriodo);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class PresupuestosEntity {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    descripcion: ").append(toIndentedString(descripcion)).append("\n");
        sb.append("    monto: ").append(toIndentedString(monto)).append("\n");
        sb.append("    idPerfil: ").append(toIndentedString(idPerfil)).append("\n");
        sb.append("    idPeriodo: ").append(toIndentedString(idPeriodo)).append("\n");
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
