package com.example.CalcGastosU.serializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import org.bson.types.ObjectId;

import java.io.IOException;

/**
 * Permite deserializar un ObjectId de MongoDB desde un String (hex de 24 chars).
 */
public class ObjectIdDeserializer extends JsonDeserializer<ObjectId> {
    @Override
    public ObjectId deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (value == null || value.isEmpty()) {
            return null;
        }
        if (ObjectId.isValid(value)) {
            return new ObjectId(value);
        }
        // Si no es válido, retornamos null para que validaciones posteriores manejen el error
        return null;
    }
}