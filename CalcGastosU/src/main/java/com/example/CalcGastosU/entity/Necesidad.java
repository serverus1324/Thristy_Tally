package com.example.CalcGastosU.entity;

import com.example.CalcGastosU.serializer.ObjectIdSerializer;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.bson.codecs.pojo.annotations.BsonProperty;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Objects;

@JsonTypeName("necesidad")
@Document("necesidad")
public class Necesidad {

    @Id
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId id;

    @BsonProperty("esPredeterminada")
    private Integer esPredeterminada;

    @BsonProperty("descripcion")
    private String descripcion;

    @BsonProperty("tipo")
    private String tipo;

    @BsonProperty("monto")
    private Double monto;

    @BsonProperty
    private Boolean excedePresupuesto = false;

    @BsonProperty("idPerfil")
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId idPerfil;

    @BsonProperty("idPeriodo")
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId idPeriodo;

    @BsonProperty("idPresupuesto")
    @JsonSerialize(using = ObjectIdSerializer.class)
    private ObjectId idPresupuesto;

    @JsonProperty("id")
    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public Necesidad descripcion(String descripcion) {
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

    public Necesidad esPredeterminada(Integer esPredeterminada) {
        this.esPredeterminada = esPredeterminada;
        return this;
    }

    @JsonProperty("esPredeterminada")
    public Integer getEsPredeterminada() {
        return esPredeterminada;
    }

    public void setEsPredeterminada(Integer esPredeterminada) {
        this.esPredeterminada = esPredeterminada;
    }

    public Necesidad monto(Double monto) {
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

    public Necesidad tipo(String tipo) {
        this.tipo = tipo;
        return this;
    }

    @JsonProperty("tipo")
    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Boolean getExcedePresupuesto() {
        return excedePresupuesto;
    }

    public void setExcedePresupuesto(Boolean excedePresupuesto) {
        this.excedePresupuesto = excedePresupuesto;
    }

    public Necesidad idPerfil(ObjectId idPerfil) {
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

    public Necesidad idPeriodo(ObjectId idPeriodo) {
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

    public Necesidad idPresupuesto(ObjectId idPresupuesto) {
        this.idPresupuesto = idPresupuesto;
        return this;
    }

    @JsonProperty("idPresupuesto")
    public ObjectId getIdPresupuesto() {
        return idPresupuesto;
    }

    public void setIdPresupuesto(ObjectId idPresupuesto) {
        this.idPresupuesto = idPresupuesto;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Necesidad necesidades = (Necesidad) o;
        return Objects.equals(this.id, necesidades.id) &&
                Objects.equals(this.descripcion, necesidades.descripcion) &&
                Objects.equals(this.esPredeterminada, necesidades.esPredeterminada) &&
                Objects.equals(this.monto, necesidades.monto) &&
                Objects.equals(this.tipo, necesidades.tipo) &&
                Objects.equals(this.idPerfil, necesidades.idPerfil) &&
                Objects.equals(this.idPeriodo, necesidades.idPeriodo) &&
                Objects.equals(this.idPresupuesto, necesidades.idPresupuesto);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, id, descripcion, esPredeterminada, monto, tipo, idPerfil, idPeriodo, idPresupuesto);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("class NecesidadesEntity {\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    id: ").append(toIndentedString(id)).append("\n");
        sb.append("    descripcion: ").append(toIndentedString(descripcion)).append("\n");
        sb.append("    esPredeterminada: ").append(toIndentedString(esPredeterminada)).append("\n");
        sb.append("    monto: ").append(toIndentedString(monto)).append("\n");
        sb.append("    tipo: ").append(toIndentedString(tipo)).append("\n");
        sb.append("    idPerfil: ").append(toIndentedString(idPerfil)).append("\n");
        sb.append("    idPeriodo: ").append(toIndentedString(idPeriodo)).append("\n");
        sb.append("    idPresupuesto: ").append(toIndentedString(idPresupuesto)).append("\n");
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
