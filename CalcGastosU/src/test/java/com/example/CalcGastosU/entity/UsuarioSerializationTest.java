package com.example.CalcGastosU.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UsuarioSerializationTest {

    @Test
    void serializaElIdComoCadenaHexadecimal() throws Exception {
        ObjectId id = new ObjectId("507f1f77bcf86cd799439011");
        Usuario usuario = new Usuario();
        usuario.setId(id);
        ObjectMapper mapper = new ObjectMapper();

        JsonNode json = mapper.readTree(mapper.writeValueAsString(usuario));

        assertTrue(json.get("_id").isTextual());
        assertEquals(id.toHexString(), json.get("_id").asText());
    }
}
