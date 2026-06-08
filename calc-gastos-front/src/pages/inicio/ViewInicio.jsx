import { Link } from "react-router-dom";
import "./inicio.css";

const ViewInicio = () => {
  const useCases = [
    {
      icon: "🎓",
      title: "Estudiantes",
      description: "Controla tus gastos de pensión, comida, transporte y materiales académicos para evitar desbalances en tu presupuesto mensual.",
    },
    {
      icon: "💼",
      title: "Trabajadores",
      description: "Organiza tus gastos fijos, ahorros y gastos personales para alcanzar tus metas financieras a mediano y largo plazo.",
    },
    {
      icon: "🛠️",
      title: "Independientes",
      description: "Gestiona ingresos variables, gastos operativos y ahorros para impuestos de forma clara y organizada.",
    },
    {
      icon: "🏢",
      title: "Empresarios",
      description: "Monitorea gastos de negocio, inversionistas y flujo de caja para tomar decisiones empresariales más inteligentes.",
    },
  ];

  const faqs = [
    {
      question: "¿Es gratis usar Thrifty Tally?",
      answer: "¡Sí! Nuestra plataforma es completamente gratuita para todos los usuarios. No hay planes premium ni costos ocultos.",
    },
    {
      question: "¿Puedo usar Thrifty Tally desde cualquier dispositivo?",
      answer: "Claro que sí! Es responsive y funciona perfectamente en celulares, tablets y computadoras.",
    },
    {
      question: "¿Mis datos están seguros?",
      answer: "Absolutamente! Almacenamos tu información de forma segura y nunca compartimos tus datos con terceros sin tu consentimiento.",
    },
    {
      question: "¿Necesito experiencia en finanzas?",
      answer: "Para nada! Hemos diseñado la plataforma para que sea intuitiva y fácil de usar, incluso si nunca has gestionado un presupuesto.",
    },
  ];

  return (
    <>
      {/* HEADER */}
      <header className="hero-header">
        <div className="hero-header-inner">
          <Link to="/" className="hero-logo">
            Thrifty <span>Tally</span>
          </Link>
          <nav className="hero-nav">
            <a href="#mision-vision" className="hero-nav-link">Misión & Visión</a>
            <a href="#casos" className="hero-nav-link">Casos de uso</a>
            <a href="#preguntas" className="hero-nav-link">Preguntas</a>
            <Link to="/signup" className="hero-nav-cta-secondary">
              Registrarse
            </Link>
            <Link to="/login" className="hero-nav-cta">
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO PRINCIPAL */}
      <main className="hero-main">
        <div className="hero-blur-1"></div>
        <div className="hero-blur-2"></div>
        <div className="hero-main-inner">
          <div className="hero-main-content">
            <div className="hero-badge">✨ Bienvenido a tu futuro financiero</div>
            <h1 className="hero-title">
              Gestiona tu dinero
              <br />
              con <span>simplicidad</span> y <span>estilo</span>
            </h1>
            <p className="hero-subtitle">
              La plataforma financiera perfecta para estudiantes, trabajadores, independientes y empresarios.
              Organiza tus gastos, planifica tu presupuesto y alcanza tus metas.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="hero-primary-btn">
                Crear cuenta gratis
              </Link>
              <Link to="/login" className="hero-secondary-btn">
                Iniciar sesión
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <p className="hero-stat-number">+1k</p>
                <p className="hero-stat-label">Usuarios felices</p>
              </div>
              <div className="hero-stat">
                <p className="hero-stat-number">+50k</p>
                <p className="hero-stat-label">Gastos registrados</p>
              </div>
              <div className="hero-stat">
                <p className="hero-stat-number">100%</p>
                <p className="hero-stat-label">Gratis</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MISION & VISION */}
      <section id="mision-vision" className="mision-vision-section">
        <div className="mision-vision-inner">
          <div className="mv-card mv-card-mision">
            <div className="mv-icon">🎯</div>
            <h2 className="mv-title">Misión</h2>
            <p className="mv-text">
              Empoderar a las personas a tomar el control de su vida financiera mediante herramientas
              intuitivas, visuales y accesibles para todos.
            </p>
          </div>
          <div className="mv-card mv-card-vision">
            <div className="mv-icon">🚀</div>
            <h2 className="mv-title">Visión</h2>
            <p className="mv-text">
              Ser la plataforma líder en gestión financiera personal en América Latina, transformando
              la relación de las personas con su dinero.
            </p>
          </div>
        </div>
      </section>

      {/* CASOS DE USO */}
      <section id="casos" className="use-cases-section">
        <div className="use-cases-inner">
          <div className="section-header">
            <span className="section-badge">Casos de uso</span>
            <h2 className="section-title">¿Para quién es perfecto?</h2>
            <p className="section-subtitle">
              Hemos diseñado Thrifty Tally para adaptarse a todas las etapas de tu vida financiera.
            </p>
          </div>
          <div className="use-cases-grid">
            {useCases.map((useCase, index) => (
              <div key={index} className="use-case-card">
                <div className="use-case-icon">{useCase.icon}</div>
                <h3 className="use-case-title">{useCase.title}</h3>
                <p className="use-case-description">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section id="preguntas" className="faq-section">
        <div className="faq-inner">
          <div className="section-header">
            <span className="section-badge">Preguntas frecuentes</span>
            <h2 className="section-title">Todo lo que necesitas saber</h2>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-blur"></div>
          <h2 className="cta-title">¿Listo para empezar?</h2>
          <p className="cta-text">
            Crea tu cuenta en menos de un minuto y comienza tu camino hacia la libertad financiera.
          </p>
          <Link to="/signup" className="cta-button">
            Empezar ahora
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-section">
        <div className="footer-inner">
          <div className="footer-brand">
            Thrifty <span>Tally</span>
          </div>
          <p className="footer-copy">© 2025 Thrifty Tally. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  );
};

export default ViewInicio;
