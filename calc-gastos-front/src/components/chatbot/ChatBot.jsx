import React, { useState, useRef, useEffect } from "react";
import { chat } from "../../api/api";
import "./ChatBot.css";

// Sugerencias rápidas que se muestran al abrir el chat.
// Al hacer clic, se envían directamente a la IA.
const QUICK_SUGGESTIONS = [
  "¿Cómo creo un presupuesto?",
  "¿Cómo agrego una necesidad?",
  "¿Qué categorías de gastos existen?",
  "¿Cómo funciona un período?",
];

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al fondo cuando llegan mensajes o cambia el estado de carga.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Foco en el input al abrir la ventana.
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const sendMessage = async (text) => {
    const content = (text ?? input ?? "").trim();
    if (!content || loading) return;

    setError(null);
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setLoading(true);

    try {
      const data = await chat(content);
      const respuesta =
        data?.respuesta ||
        "Lo siento, no pude procesar tu respuesta en este momento.";
      setMessages((prev) => [...prev, { role: "assistant", content: respuesta }]);
    } catch (e) {
      const msg =
        e?.message ||
        "No pude conectarme con el asistente. Inténtalo de nuevo.";
      setMessages((prev) => [...prev, { role: "error", content: msg }]);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const close = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <>
      {/* Botón flotante (FAB) - reemplaza al bombillo por un ícono de IA */}
      <button
        type="button"
        className={`cb-fab ${open ? "cb-fab-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar asistente de IA" : "Abrir asistente de IA"}
        title="Asistente de IA"
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Robot / IA */}
            <rect x="4" y="8" width="16" height="12" rx="3" />
            <path d="M12 4v4" />
            <circle cx="12" cy="3" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="9" cy="13" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="15" cy="13" r="1.4" fill="currentColor" stroke="none" />
            <path d="M9 17h6" />
            <path d="M2 13v2" />
            <path d="M22 13v2" />
          </svg>
        )}
        {/* Punto de notificación si hay mensajes */}
        {messages.length > 0 && !open && (
          <span className="cb-fab-badge">{messages.filter((m) => m.role !== "user").length}</span>
        )}
      </button>

      {/* Ventana flotante del chat */}
      <div className={`cb-window ${open ? "cb-window-open" : ""}`} role="dialog" aria-label="Asistente de IA">
        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-title">
            <div className="cb-avatar">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="8" width="16" height="12" rx="3" />
                <path d="M12 4v4" />
                <circle cx="12" cy="3" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="9" cy="13" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="15" cy="13" r="1.4" fill="currentColor" stroke="none" />
                <path d="M9 17h6" />
              </svg>
            </div>
            <div className="cb-header-text">
              <h4>Asistente de IA</h4>
              <span className="cb-status">
                <span className="cb-status-dot" />
                En línea
              </span>
            </div>
          </div>
          <div className="cb-header-actions">
            <button type="button" className="cb-icon-btn" onClick={close} aria-label="Cerrar chat" title="Cerrar">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cuerpo del chat */}
        <div className="cb-body">
          {messages.length === 0 && (
            <div className="cb-welcome">
              <div className="cb-welcome-icon">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="8" width="16" height="12" rx="3" />
                  <path d="M12 4v4" />
                  <circle cx="12" cy="3" r="1.2" fill="currentColor" stroke="none" />
                  <circle cx="9" cy="13" r="1.4" fill="currentColor" stroke="none" />
                  <circle cx="15" cy="13" r="1.4" fill="currentColor" stroke="none" />
                  <path d="M9 17h6" />
                </svg>
              </div>
              <p className="cb-welcome-text">
                ¡Hola! Soy tu asistente de <strong>Thrifty Tally</strong>.
                Pregúntame sobre la app o finanzas personales.
              </p>
              <div className="cb-suggestions">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className="cb-chip"
                    onClick={() => sendMessage(s)}
                    disabled={loading}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`cb-msg-row cb-msg-${m.role}`}>
              <div className={`cb-bubble cb-bubble-${m.role}`}>{m.content}</div>
            </div>
          ))}

          {loading && (
            <div className="cb-msg-row cb-msg-assistant">
              <div className="cb-bubble cb-bubble-assistant cb-typing-bubble">
                <span className="cb-typing-dot" />
                <span className="cb-typing-dot" />
                <span className="cb-typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input */}
        <div className="cb-footer">
          <input
            ref={inputRef}
            type="text"
            className="cb-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            disabled={loading}
          />
          <button
            type="button"
            className="cb-send"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Enviar mensaje"
            title="Enviar"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
