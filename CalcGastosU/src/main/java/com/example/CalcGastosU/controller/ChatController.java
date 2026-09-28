package com.example.CalcGastosU.controller;


import com.example.CalcGastosU.entity.Consulta;
import com.example.CalcGastosU.repository.ConsultaRepository;
import com.example.CalcGastosU.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;
    private final ConsultaRepository consultaRepository;

    public ChatController(ChatService chatService,
                          ConsultaRepository consultaRepository) {
        this.chatService = chatService;
        this.consultaRepository = consultaRepository;
    }

    @PostMapping("/chat")
    public Map<String, String> preguntar(@RequestBody Map<String, String> body) {
        String pregunta = body.get("pregunta");
        if (pregunta == null || pregunta.isBlank()) {
            return Map.of("respuesta", "Debe ingresar una pregunta.");
        }
        return Map.of("respuesta", chatService.preguntar(pregunta));
    }

    @GetMapping("/consultas")
    public List<Consulta> historial() {
        return consultaRepository.findAll();
    }

    @GetMapping("/salud")
    public Map<String, String> salud() {
        return Map.of("estado", "OK", "aplicacion", "Thrifty Tally RAG");
    }
}