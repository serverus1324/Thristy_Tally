import React, { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../../api/api";
import "./recover-password.css";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    
    const inputRefs = useRef([
        React.createRef(),
        React.createRef(),
        React.createRef(),
        React.createRef(),
        React.createRef(),
        React.createRef()
    ]);

    const handleSendCode = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error("Por favor ingresa tu correo electrónico");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Por favor ingresa un correo electrónico válido");
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            toast.success("Código de verificación enviado a tu correo");
            setStep(2);
            setTimeout(() => {
                if (inputRefs.current[0]) {
                    inputRefs.current[0].current?.focus();
                }
            }, 100);
        } catch (error) {
            console.error("Error sending code:", error);
            toast.error(error.message || "Error al enviar el código de verificación");
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (index, value) => {
        if (value.length > 1) {
            value = value.charAt(value.length - 1);
        }

        if (!/^\d*$/.test(value)) {
            return;
        }

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1].current?.focus();
        }
    };

    const handleCodeKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].current?.focus();
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const codeString = code.join("");

        if (codeString.length !== 6) {
            toast.error("Por favor ingresa el código de 6 dígitos");
            return;
        }

        if (!password || !confirmPassword) {
            toast.error("Por favor completa ambos campos de contraseña");
            return;
        }

        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, codeString, password);
            toast.success("Contraseña restablecida exitosamente");
            setStep(3);
            setTimeout(() => {
                navigate("/login");
            }, 2500);
        } catch (error) {
            console.error("Error resetting password:", error);
            toast.error(error.message || "Error al restablecer la contraseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="recover-page">
            <div className="recover-bg-glow-1"></div>
            <div className="recover-bg-glow-2"></div>

            <div className="recover-card">
                <div className="recover-top-nav">
                    <Link to="/" className="recover-top-logo">
                        Thrifty <span>Tally</span>
                    </Link>
                    <Link to="/" className="recover-top-home-btn">
                        Inicio
                    </Link>
                </div>

                {step === 1 && (
                    <>
                        <h1 className="recover-title">Recupera tu cuenta</h1>
                        <p className="recover-subtitle">
                            Ingresa tu correo electrónico y te enviaremos un código de verificación.
                        </p>

                        <form onSubmit={handleSendCode}>
                            <div className="recover-field">
                                <label htmlFor="email">Correo electrónico</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <button type="submit" className="recover-btn" disabled={loading}>
                                {loading ? "Enviando..." : "Enviar código de verificación"}
                            </button>
                        </form>

                        <Link to="/login" className="recover-back-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Volver al inicio de sesión
                        </Link>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h1 className="recover-title">Verifica tu identidad</h1>
                        <p className="recover-subtitle">
                            Ingresa el código de 6 dígitos que enviamos a <strong>{email}</strong>
                        </p>

                        <form onSubmit={handleResetPassword}>
                            <div className="recover-code-container">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs.current[index]}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                        className="recover-code-input"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            <div className="recover-field">
                                <label htmlFor="password">Nueva contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="recover-field">
                                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <button type="submit" className="recover-btn" disabled={loading}>
                                {loading ? "Restableciendo..." : "Restablecer contraseña"}
                            </button>
                        </form>

                        <button
                            type="button"
                            className="recover-back-link"
                            onClick={() => setStep(1)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "0" }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                            Atrás
                        </button>
                    </>
                )}

                {step === 3 && (
                    <div style={{ textAlign: "center" }}>
                        <div className="recover-success-icon">
                            ✓
                        </div>
                        <h1 className="recover-title" style={{ fontSize: "28px", marginBottom: "16px" }}>
                            ¡Listo!
                        </h1>
                        <p className="recover-success-text">
                            Tu contraseña ha sido restablecida correctamente.
                            Redirigiéndote al inicio de sesión...
                        </p>
                    </div>
                )}
            </div>

            <Toaster />
        </div>
    );
};

export default ForgotPassword;
