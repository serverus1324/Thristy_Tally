package com.example.CalcGastosU.service;

import com.example.CalcGastosU.entity.Consulta;
import com.example.CalcGastosU.repository.ConsultaRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final ConsultaRepository consultaRepository;

    public ChatService(ChatClient.Builder builder,
                       VectorStore vectorStore,
                       ConsultaRepository consultaRepository) {

        this.consultaRepository = consultaRepository;

        SearchRequest searchRequest = SearchRequest.builder()
                .topK(4)
                .similarityThreshold(0.50)
                .build();

        QuestionAnswerAdvisor ragAdvisor = QuestionAnswerAdvisor
                .builder(vectorStore)
                .searchRequest(searchRequest)
                .build();

        this.chatClient = builder
                .defaultSystem("""
                    Eres el asistente virtual de Thrifty Tally, una 
                    aplicación web de finanzas personales para 
                    estudiantes universitarios y personas naturales.

                    Responde SIEMPRE en español, claro y breve 
                    (máximo 3 frases).

                    Usa EXCLUSIVAMENTE la información del contexto 
                    recuperado.

                    Si la respuesta no está en el contexto, responde 
                    exactamente:
                    "No encuentro esa información en los documentos disponibles."

                    No inventes datos, montos ni políticas.
                    """)
                .defaultAdvisors(ragAdvisor)
                .build();
    }

    public String preguntar(String pregunta) {
        String respuesta = chatClient.prompt()
                .user(pregunta)
                .call()
                .content();

        consultaRepository.save(new Consulta(pregunta, respuesta));
        return respuesta;
    }
}