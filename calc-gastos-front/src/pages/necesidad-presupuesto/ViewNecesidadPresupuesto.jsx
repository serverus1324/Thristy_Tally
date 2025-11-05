import React, { useState, useEffect } from "react";
import { getData, postData } from "../../api/api";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";

const ViewNecesidadPresupuesto = ({ idUsuario }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Asegura que trabajamos siempre con el ObjectId del estudiante
  const idEstudiante = (() => {
    // Priorizar ID desde state de navegación (diversas claves posibles)
    const idFromState = location.state?.idEstudiante
      ?? location.state?.idUsuario
      ?? location.state?.userData?.data?.idEstudiante
      ?? location.state?.userData?.data?._id;
    const candidate = idFromState ?? idUsuario;

    if (candidate) {
      // Si accidentalmente llega un objeto, intentar extraer id
      if (typeof candidate === 'object' && candidate !== null) {
        const extracted = candidate.idEstudiante
          ?? candidate._id
          ?? candidate.data?.idEstudiante
          ?? candidate.data?._id;
        if (extracted) return String(extracted);
        // Último recurso: evitar usar "[object Object]"
        return '';
      }
      return String(candidate);
    }
    // fallback: localStorage
    try {
      const v = localStorage.getItem('idEstudiante');
      return v ? String(v) : "";
    } catch {
      return "";
    }
  })();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [presupuestos, setPresupuestos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState("");
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");
  const [mostrarOpcionesNavegacion, setMostrarOpcionesNavegacion] = useState(false);
  const [ultimoPresupuestoId, setUltimoPresupuestoId] = useState("");

  // Paso 1 - Presupuesto
  const [presupuesto, setPresupuesto] = useState({
    nombre: "",
    monto: "",
  });

  // Paso 2 - Periodo
  const [periodo, setPeriodo] = useState({
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
  });

  // Paso 3 - Necesidades predeterminadas
  const [necesidadesPredeterminadas, setNecesidadesPredeterminadas] = useState([
    { nombre: "ALIMENTACION", monto: 0, seleccionado: false },
    { nombre: "ALOJAMIENTO", monto: 0, seleccionado: false },
    { nombre: "MATRICULA", monto: 0, seleccionado: false },
    { nombre: "TRANSPORTE", monto: 0, seleccionado: false },
    { nombre: "UTILES", monto: 0, seleccionado: false },
    { nombre: "INESPERADOS", monto: 0, seleccionado: false },
    { nombre: "OTROS", monto: 0, seleccionado: false },
  ]);

  // Paso 4 - Necesidad personalizada
  const [necesidadPersonalizada, setNecesidadPersonalizada] = useState({
    nombre: "",
    monto: "",
    porcentajeAumento: "",
  });

  // Cargar presupuestos y periodos existentes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // Cargar presupuestos del estudiante
        const presupuestosData = await getData(`presupuestos/estudiante/${idEstudiante}`);
        if (presupuestosData && presupuestosData.data) {
          setPresupuestos(presupuestosData.data);
        }
        
        // Cargar periodos del estudiante
        const periodosData = await getData(`periodos/${idEstudiante}/por-estudiante`);
        if (periodosData) {
          setPeriodos(periodosData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar datos. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [idEstudiante]);

  // ---- Handlers generales ----
  const handleNext = () => {
    // Validaciones antes de avanzar
    if (step === 1) {
      if (presupuestoSeleccionado || (presupuesto.nombre && presupuesto.monto)) {
        setStep((prev) => prev + 1);
      } else {
        toast.warning("Debes seleccionar un presupuesto existente o crear uno nuevo");
      }
    } else if (step === 2) {
      if (periodoSeleccionado || (periodo.nombre && periodo.fechaInicio && periodo.fechaFin)) {
        setStep((prev) => prev + 1);
      } else {
        toast.warning("Debes seleccionar un periodo existente o crear uno nuevo");
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };
  
  const handleBack = () => setStep((prev) => prev - 1);

  const handlePresupuestoChange = (e) => {
    setPresupuesto({ ...presupuesto, [e.target.name]: e.target.value });
  };

  const handlePeriodoChange = (e) => {
    setPeriodo({ ...periodo, [e.target.name]: e.target.value });
  };

  const handleNecesidadPersonalizadaChange = (e) => {
    setNecesidadPersonalizada({
      ...necesidadPersonalizada,
      [e.target.name]: e.target.value,
    });
  };

  const toggleNecesidadPredeterminada = (index) => {
    const nuevas = [...necesidadesPredeterminadas];
    nuevas[index].seleccionado = !nuevas[index].seleccionado;
    setNecesidadesPredeterminadas(nuevas);
  };

  const handlePresupuestoSeleccionado = (e) => {
    setPresupuestoSeleccionado(e.target.value);
    // Si se selecciona un presupuesto existente, limpiar el formulario de nuevo presupuesto
    if (e.target.value) {
      setPresupuesto({ nombre: "", monto: "" });
    }
  };

  const handlePeriodoSeleccionado = (e) => {
    setPeriodoSeleccionado(e.target.value);
    // Si se selecciona un periodo existente, limpiar el formulario de nuevo periodo
    if (e.target.value) {
      setPeriodo({ nombre: "", fechaInicio: "", fechaFin: "" });
    }
  };

  // Funciones de navegación
  const irAlDashboard = () => {
    if (idEstudiante) { try { localStorage.setItem('idEstudiante', String(idEstudiante)); } catch {} }
    navigate('/dashboard', { state: { idEstudiante } });
  };

  const irAlHome = () => {
    if (idEstudiante) { try { localStorage.setItem('idEstudiante', String(idEstudiante)); } catch {} }
    navigate('/home', { state: { idEstudiante } });
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      let idPresupuestoFinal = presupuestoSeleccionado;
      let idPeriodoFinal = periodoSeleccionado;

      // Validar ID del estudiante (permitir ObjectId o numérico)
      const isValidId = (v) => typeof v === 'string' && (/^[a-fA-F0-9]{24}$/.test(v) || /^\d+$/.test(v));
      if (!isValidId(String(idEstudiante))) {
        toast.error("ID de estudiante inválido. Inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      // 1️⃣ Crear Periodo si no se seleccionó uno existente (primero para poder asociarlo al presupuesto)
      if (!idPeriodoFinal && periodo.nombre && periodo.fechaInicio && periodo.fechaFin) {
        console.log('Creando nuevo periodo:', periodo);
        const periodoResponse = await postData("periodos", {
          nombre: periodo.nombre,
          fechaInicio: periodo.fechaInicio,
          fechaFin: periodo.fechaFin,
          idEstudiante: idEstudiante,
        });
        console.log('Respuesta del periodo:', periodoResponse);
        // Backend responde con { success, id }
        idPeriodoFinal = periodoResponse?.id || periodoResponse?.data?.id || idPeriodoFinal;
      }

      // 2️⃣ Crear Presupuesto si no se seleccionó uno existente, incluyendo idPeriodo
      if (!idPresupuestoFinal && presupuesto.nombre && presupuesto.monto) {
        if (!idPeriodoFinal) {
          toast.error("Debes crear o seleccionar un período antes de crear el presupuesto.");
          setLoading(false);
          return;
        }
        console.log('Creando nuevo presupuesto:', presupuesto);
        const presupuestoResponse = await postData("presupuestos", {
          descripcion: presupuesto.nombre,
          monto: parseFloat(presupuesto.monto),
          idEstudiante: idEstudiante,
          idPeriodo: idPeriodoFinal,
        });
        console.log('Respuesta del presupuesto:', presupuestoResponse);
        // Backend responde con { success, id }
        idPresupuestoFinal = presupuestoResponse?.id || presupuestoResponse?.data?.id || idPresupuestoFinal;
        if (idPresupuestoFinal) {
          setUltimoPresupuestoId(String(idPresupuestoFinal));
          try { localStorage.setItem('ultimoPresupuestoId', String(idPresupuestoFinal)); } catch {}
        }
      }

      // Verificar que tenemos un presupuesto y un periodo
      if ((!presupuestoSeleccionado && (!presupuesto.nombre || !presupuesto.monto)) || 
          (!periodoSeleccionado && (!periodo.nombre || !periodo.fechaInicio || !periodo.fechaFin))) {
        toast.error("Debe haber un presupuesto y un periodo para crear necesidades");
        setLoading(false);
        return;
      }

      // Validar necesidades predeterminadas seleccionadas
      const necesidadesPredeterminadasSeleccionadas = necesidadesPredeterminadas.filter(n => n.seleccionado);
      const necesidadesPredeterminadasValidas = necesidadesPredeterminadasSeleccionadas.filter(n => n.monto > 0);
      
      if (necesidadesPredeterminadasSeleccionadas.length > 0 && necesidadesPredeterminadasValidas.length === 0) {
        toast.error("Las necesidades predeterminadas seleccionadas deben tener un monto mayor a 0");
        setLoading(false);
        return;
      }

      // Verificar que al menos una necesidad esté seleccionada
      const hayNecesidadSeleccionada = necesidadesPredeterminadasValidas.length > 0 || 
                                      (necesidadPersonalizada.nombre && necesidadPersonalizada.monto);
      
      if (!hayNecesidadSeleccionada) {
        toast.error("Debe seleccionar al menos una necesidad con monto válido");
        setLoading(false);
        return;
      }

      // 3️⃣ Construir y guardar necesidades seleccionadas y personalizada
      const necesidadesPayload = [];
      
      // Agregar necesidades predeterminadas válidas
      necesidadesPredeterminadasValidas.forEach(n => {
        necesidadesPayload.push({
          descripcion: n.nombre,
          monto: parseFloat(n.monto),
          esPredeterminada: 1,
          idEstudiante: idEstudiante,
          idPeriodo: idPeriodoFinal,
          idPresupuesto: idPresupuestoFinal || null,
        });
      });
      
      // Agregar necesidad personalizada si existe
      if (necesidadPersonalizada.nombre && necesidadPersonalizada.monto) {
        necesidadesPayload.push({
          descripcion: necesidadPersonalizada.nombre,
          monto: parseFloat(necesidadPersonalizada.monto),
          esPredeterminada: 0,
          idEstudiante: idEstudiante,
          idPeriodo: idPeriodoFinal,
          idPresupuesto: idPresupuestoFinal || null,
        });
      }

      console.log('Payload de necesidades a enviar:', necesidadesPayload);

      if (necesidadesPayload.length > 0) {
        const necesidadesResponse = await postData("necesidades", necesidadesPayload);
        console.log('Respuesta de necesidades:', necesidadesResponse);
      }

      toast.success(`${necesidadesPayload.length} necesidad(es) guardada(s) correctamente 🎉`);

      // Mostrar opciones de navegación
      setMostrarOpcionesNavegacion(true);

      // Redirección automática al dashboard después de 5 segundos
      setTimeout(() => {
        if (idEstudiante) { try { localStorage.setItem('idEstudiante', String(idEstudiante)); } catch {} }
        navigate('/dashboard', { state: { idEstudiante } });
      }, 5000);

      // Reiniciar formulario
      setStep(1);
      setPresupuesto({ nombre: "", monto: "" });
      setPeriodo({ nombre: "", fechaInicio: "", fechaFin: "" });
      setNecesidadPersonalizada({
        nombre: "",
        monto: "",
        porcentajeAumento: "",
      });
      setNecesidadesPredeterminadas((prev) =>
        prev.map((n) => ({ ...n, seleccionado: false }))
      );
      setPresupuestoSeleccionado("");
      setPeriodoSeleccionado("");
      setUltimoPresupuestoId("");
      
      // No recargamos datos reales ya que estamos simulando
      // Podríamos agregar datos ficticios si fuera necesario
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar los datos. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Renderizado por pasos ----
  return (
    <div className="form-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", borderRadius: "8px", backgroundColor: "#fff" }}>
      <h2 className="text-center mb-4" style={{ color: "#2c3e50", fontWeight: "bold" }}>
        {step === 1 && "Paso 1: Seleccionar o Crear Presupuesto"}
        {step === 2 && "Paso 2: Seleccionar o Crear Periodo"}
        {step === 3 && "Paso 3: Gestionar Necesidades"}
        {step === 4 && "Paso 4: Revisar y Guardar"}
      </h2>
      
      {/* Mensaje de éxito con opciones de navegación */}
      {mostrarOpcionesNavegacion && (
        <div className="alert alert-success" role="alert">
          <div className="d-flex flex-column align-items-center">
            <p className="fw-bold mb-2">¡Presupuesto guardado exitosamente!</p>
            <p className="mb-4">¿Qué deseas hacer ahora?</p>
            <div className="d-flex gap-3">
              <button
                onClick={irAlDashboard}
                className="btn btn-primary"
              >
                Ver en Dashboard
              </button>
              {ultimoPresupuestoId && (
                <button
                  onClick={() => navigate(`/presupuesto/${ultimoPresupuestoId}/editar`)}
                  className="btn btn-warning"
                >
                  Editar Presupuesto
                </button>
              )}
              <button
                onClick={irAlHome}
                className="btn btn-secondary"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="text-center mb-3" style={{ color: "#3498db" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando...</p>
      </div>}

      {/* Paso 1 */}
      {step === 1 && (
        <div>
          {presupuestos.length > 0 && (
            <div className="mb-4">
              <label className="form-label">Seleccionar un presupuesto existente</label>
              <select 
                className="form-select mb-3" 
                value={presupuestoSeleccionado} 
                onChange={handlePresupuestoSeleccionado}
              >
                <option value="">-- Seleccionar presupuesto --</option>
                {presupuestos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.descripcion} - ${p.monto}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <h5 className="mb-3">O crear un nuevo presupuesto</h5>
            <label className="form-label">Nombre del Presupuesto</label>
            <input
              type="text"
              name="nombre"
              value={presupuesto.nombre}
              onChange={handlePresupuestoChange}
              className="form-control mb-3"
              disabled={!!presupuestoSeleccionado}
            />
            <label className="form-label">Monto del Presupuesto</label>
            <input
              type="number"
              name="monto"
              value={presupuesto.monto}
              onChange={handlePresupuestoChange}
              className="form-control mb-3"
              disabled={!!presupuestoSeleccionado}
            />
          </div>
          <button onClick={handleNext} className="btn btn-primary w-100">
            Siguiente
          </button>
        </div>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <div>
          {periodos.length > 0 && (
            <div className="mb-4">
              <label className="form-label">Seleccionar un periodo existente</label>
              <select 
                className="form-select mb-3" 
                value={periodoSeleccionado} 
                onChange={handlePeriodoSeleccionado}
              >
                <option value="">-- Seleccionar periodo --</option>
                {periodos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({new Date(p.fechaInicio).toLocaleDateString()} - {new Date(p.fechaFin).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <h5 className="mb-3">O crear un nuevo periodo</h5>
            <label className="form-label">Nombre del Periodo</label>
            <input
              type="text"
              name="nombre"
              value={periodo.nombre}
              onChange={handlePeriodoChange}
              className="form-control mb-3"
              disabled={!!periodoSeleccionado}
            />
            <label className="form-label">Fecha de Inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={periodo.fechaInicio}
              onChange={handlePeriodoChange}
              className="form-control mb-3"
              disabled={!!periodoSeleccionado}
            />
            <label className="form-label">Fecha de Fin</label>
            <input
              type="date"
              name="fechaFin"
              value={periodo.fechaFin}
              onChange={handlePeriodoChange}
              className="form-control mb-3"
              disabled={!!periodoSeleccionado}
            />
          </div>
          <div className="d-flex justify-content-between">
            <button onClick={handleBack} className="btn btn-secondary">
              Atrás
            </button>
            <button onClick={handleNext} className="btn btn-primary">
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Paso 3 */}
      {step === 3 && (
        <div>
          <div className="row">
            <div className="col-md-6">
                <div className="card mb-4" style={{ borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                  <div className="card-header" style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                    <h5 className="mb-0" style={{ color: "#2c3e50" }}>Necesidades Predeterminadas</h5>
                  </div>
                  <div className="card-body">
                    {necesidadesPredeterminadas.map((necesidad, index) => (
                      <div key={index} className="mb-3">
                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`necesidad-${index}`}
                            checked={necesidad.seleccionado}
                            onChange={() => toggleNecesidadPredeterminada(index)}
                          />
                          <label
                            htmlFor={`necesidad-${index}`}
                            className="form-check-label ms-2"
                          >
                            {necesidad.nombre}
                          </label>
                        </div>
                        {necesidad.seleccionado && (
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Monto"
                              value={necesidad.monto}
                              onChange={(e) => {
                                const nuevas = [...necesidadesPredeterminadas];
                                nuevas[index].monto = parseInt(e.target.value) || 0;
                                setNecesidadesPredeterminadas(nuevas);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            
            <div className="col-md-6">
              <div className="card" style={{ borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <div className="card-header" style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
                  <h5 className="mb-0" style={{ color: "#2c3e50" }}>Agregar Necesidad Personalizada</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre de la Necesidad</label>
                    <input
                      type="text"
                      name="nombre"
                      value={necesidadPersonalizada.nombre}
                      onChange={handleNecesidadPersonalizadaChange}
                      className="form-control"
                      placeholder="Ej: Matrícula universitaria"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Monto</label>
                    <input
                      type="number"
                      name="monto"
                      value={necesidadPersonalizada.monto}
                      onChange={handleNecesidadPersonalizadaChange}
                      className="form-control"
                      placeholder="Ej: 50000"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">% de Aumento (opcional)</label>
                    <input
                      type="number"
                      name="porcentajeAumento"
                      value={necesidadPersonalizada.porcentajeAumento}
                      onChange={handleNecesidadPersonalizadaChange}
                      className="form-control"
                      placeholder="Ej: 5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-between mt-4">
            <button onClick={handleBack} className="btn btn-secondary">
              Atrás
            </button>
            <button onClick={handleNext} className="btn btn-primary">
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Paso 4 */}
      {step === 4 && (
        <div>
          <div className="card mb-4" style={{ borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <div className="card-header" style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #e9ecef" }}>
              <h5 className="mb-0" style={{ color: "#2c3e50" }}>Resumen de Selecciones</h5>
            </div>
            <div className="card-body">
              <h6 className="mb-3">Presupuesto:</h6>
              <p>{presupuestoSeleccionado ? 
                presupuestos.find(p => p.id === presupuestoSeleccionado)?.descripcion : 
                presupuesto.nombre} - ${presupuestoSeleccionado ? 
                presupuestos.find(p => p.id === presupuestoSeleccionado)?.monto : 
                presupuesto.monto}</p>
              
              <h6 className="mb-3 mt-4">Periodo:</h6>
              <p>{periodoSeleccionado ? 
                periodos.find(p => p.id === periodoSeleccionado)?.nombre : 
                periodo.nombre} ({periodoSeleccionado ? 
                new Date(periodos.find(p => p.id === periodoSeleccionado)?.fechaInicio).toLocaleDateString() : 
                periodo.fechaInicio} - {periodoSeleccionado ? 
                new Date(periodos.find(p => p.id === periodoSeleccionado)?.fechaFin).toLocaleDateString() : 
                periodo.fechaFin})</p>
              
              <h6 className="mb-3 mt-4">Necesidades Predeterminadas Seleccionadas:</h6>
              {necesidadesPredeterminadas.filter(n => n.seleccionado).length > 0 ? (
                <ul className="list-group">
                  {necesidadesPredeterminadas.filter(n => n.seleccionado).map((n, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      {n.nombre}
                      <span className="badge bg-primary rounded-pill">${n.monto.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No se seleccionaron necesidades predeterminadas</p>
              )}
              
              {necesidadPersonalizada.nombre && (
                <>
                  <h6 className="mb-3 mt-4">Necesidad Personalizada:</h6>
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">{necesidadPersonalizada.nombre}</h6>
                      <p className="card-text">Monto: ${parseFloat(necesidadPersonalizada.monto).toLocaleString()}</p>
                      {necesidadPersonalizada.porcentajeAumento && (
                        <p className="card-text">% de Aumento: {necesidadPersonalizada.porcentajeAumento}%</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="d-flex justify-content-between">
            <button onClick={handleBack} className="btn btn-secondary">
              Atrás
            </button>
            <button 
              onClick={handleSubmit} 
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : "Guardar Todo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewNecesidadPresupuesto;
