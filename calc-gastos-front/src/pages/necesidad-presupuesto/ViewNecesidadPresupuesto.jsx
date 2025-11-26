import React, { useState, useEffect } from "react";
import { getData, postData } from "../../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import "./necesidadPresupuesto.css";
import Navbar from "../../components/navbar/Navbar";

const ViewNecesidadPresupuesto = ({ idUsuario }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const normalizeId = (val) => {
    if (!val) return "";
    if (typeof val === "string") {
      const s = val.trim();
      if (["null", "undefined", "NaN"].includes(s)) return "";
      if (s.startsWith("{") && s.endsWith("}")) {
        try {
          const obj = JSON.parse(s);
          const raw =
            obj.$oid ?? obj.$id ?? obj._id ?? obj.oid ?? obj.id;
          if (raw) return String(raw).trim();
        } catch {}
      }
      const matchHex = s.match(/[a-fA-F0-9]{24}/);
      if (matchHex && matchHex[0]) return matchHex[0];
      const matchNum = s.match(/\d{1,}/);
      if (matchNum && matchNum[0]) return matchNum[0];
      return s;
    }
    if (typeof val === "number") return String(val);
    if (typeof val === "object") {
      const raw =
        val.$oid ??
        val.$id ??
        val.oid ??
        val._id ??
        val.id ??
        val.data?.idEstudiante ??
        val.data?._id;
      if (!raw) return "";
      if (typeof raw === "string" || typeof raw === "number")
        return String(raw);
      if (typeof raw === "object" && raw?.$oid) return String(raw.$oid);
      return "";
    }
    return "";
  };

  const isValidId = (v) =>
    typeof v === "string" &&
    (/^[a-fA-F0-9]{24}$/.test(v) || /^\d+$/.test(v));

  const storeEstudianteIdIfValid = (v) => {
    if (isValidId(v)) {
      try {
        localStorage.setItem("idEstudiante", String(v));
      } catch {}
    }
  };

  let idEstudiante = "";
  try {
    const v = localStorage.getItem("idEstudiante");
    const vNorm = normalizeId(v);
    if (isValidId(vNorm)) idEstudiante = vNorm;
  } catch {}

  if (!isValidId(idEstudiante)) {
    const idFromState =
      location.state?.idEstudiante ??
      location.state?.idUsuario ??
      location.state?.userData?.data?.idEstudiante ??
      location.state?.userData?.data?._id;
    const idFromStateNorm = normalizeId(idFromState);
    if (isValidId(idFromStateNorm)) {
      idEstudiante = idFromStateNorm;
      storeEstudianteIdIfValid(idEstudiante);
    }
  }

  if (!isValidId(idEstudiante)) {
    const vNorm = normalizeId(idUsuario);
    if (isValidId(vNorm)) {
      idEstudiante = vNorm;
      storeEstudianteIdIfValid(idEstudiante);
    }
  }

  // ---------- State principal ----------
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [presupuestos, setPresupuestos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] =
    useState("");
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");
  const [mostrarOpcionesNavegacion, setMostrarOpcionesNavegacion] =
    useState(false);
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
  const [necesidadesPredeterminadas, setNecesidadesPredeterminadas] =
    useState([
      { nombre: "ALIMENTACION", monto: 0, seleccionado: false },
      { nombre: "ALOJAMIENTO", monto: 0, seleccionado: false },
      { nombre: "MATRICULA", monto: 0, seleccionado: false },
      { nombre: "TRANSPORTE", monto: 0, seleccionado: false },
      { nombre: "UTILES", monto: 0, seleccionado: false },
      { nombre: "INESPERADOS", monto: 0, seleccionado: false },
      { nombre: "OTROS", monto: 0, seleccionado: false },
    ]);

  // Paso 4 - Necesidades personalizadas
  const [necesidadesPersonalizadas, setNecesidadesPersonalizadas] =
    useState([{ nombre: "", monto: "", porcentajeAumento: "" }]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const resolvedId = idEstudiante;
        if (!isValidId(resolvedId)) {
          console.warn(
            "[Crear Gasto] idEstudiante inválido para carga inicial:",
            idEstudiante
          );
          toast.warning(
            "No se pudo identificar al estudiante. Regresa al Home y vuelve a entrar."
          );
          return;
        }

        // Presupuestos
        try {
          const presupuestosData = await getData(
            `presupuestos/estudiante/${resolvedId}`
          );
          const arr = Array.isArray(presupuestosData?.data)
            ? presupuestosData.data
            : Array.isArray(presupuestosData)
            ? presupuestosData
            : [];
          setPresupuestos(arr);
        } catch (e) {
          const msg = String(e?.message || "");
          if (msg.includes("404")) {
            setPresupuestos([]);
          } else {
            console.error("Error cargando presupuestos:", e);
            toast.error("Error al cargar presupuestos. Intenta nuevamente.");
          }
        }

        // Periodos
        try {
          const periodosData = await getData(
            `periodos/${resolvedId}/por-estudiante`
          );
          const arr = Array.isArray(periodosData)
            ? periodosData
            : Array.isArray(periodosData?.data)
            ? periodosData.data
            : [];
          setPeriodos(arr);
        } catch (e) {
          const msg = String(e?.message || "");
          if (msg.includes("404")) {
            setPeriodos([]);
          } else {
            console.error("Error cargando periodos:", e);
            toast.error("Error al cargar períodos. Intenta nuevamente.");
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [idEstudiante]);

  const handleNext = () => {
    if (step === 1) {
      if (presupuestoSeleccionado || (presupuesto.nombre && presupuesto.monto)) {
        setStep((prev) => prev + 1);
      } else {
        toast.warning(
          "Debes seleccionar un presupuesto existente o crear uno nuevo"
        );
      }
    } else if (step === 2) {
      if (
        periodoSeleccionado ||
        (periodo.nombre && periodo.fechaInicio && periodo.fechaFin)
      ) {
        setStep((prev) => prev + 1);
      } else {
        toast.warning(
          "Debes seleccionar un periodo existente o crear uno nuevo"
        );
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

  const handleNecesidadPersonalizadaChange = (index, e) => {
    const nuevas = [...necesidadesPersonalizadas];
    nuevas[index] = { ...nuevas[index], [e.target.name]: e.target.value };
    setNecesidadesPersonalizadas(nuevas);
  };

  const addNecesidadPersonalizada = () => {
    setNecesidadesPersonalizadas((prev) => [
      ...prev,
      { nombre: "", monto: "", porcentajeAumento: "" },
    ]);
  };

  const removeNecesidadPersonalizada = (index) => {
    setNecesidadesPersonalizadas((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const toggleNecesidadPredeterminada = (index) => {
    const nuevas = [...necesidadesPredeterminadas];
    nuevas[index].seleccionado = !nuevas[index].seleccionado;
    setNecesidadesPredeterminadas(nuevas);
  };

  const handlePresupuestoSeleccionado = (e) => {
    setPresupuestoSeleccionado(e.target.value);
    if (e.target.value) setPresupuesto({ nombre: "", monto: "" });
  };

  const handlePeriodoSeleccionado = (e) => {
    setPeriodoSeleccionado(e.target.value);
    if (e.target.value)
      setPeriodo({ nombre: "", fechaInicio: "", fechaFin: "" });
  };

  const irAlDashboard = () => {
    storeEstudianteIdIfValid(idEstudiante);
    navigate("/dashboard", { state: { idEstudiante } });
  };

  const irAlHome = () => {
    storeEstudianteIdIfValid(idEstudiante);
    navigate("/home", { state: { idEstudiante } });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let idPresupuestoFinal = presupuestoSeleccionado;
      let idPeriodoFinal = periodoSeleccionado;

      let resolvedId = idEstudiante;
      if (!isValidId(resolvedId)) {
        try {
          const v = localStorage.getItem("idEstudiante");
          const vNorm = normalizeId(v);
          if (isValidId(vNorm)) resolvedId = vNorm;
        } catch {}
      }
      if (!isValidId(resolvedId)) {
        toast.error("ID de estudiante inválido. Inicia sesión nuevamente.");
        setLoading(false);
        return;
      }

      // 1) Crear periodo si hace falta
      if (
        !idPeriodoFinal &&
        periodo.nombre &&
        periodo.fechaInicio &&
        periodo.fechaFin
      ) {
        const periodoResponse = await postData("periodos", {
          nombre: periodo.nombre,
          fechaInicio: periodo.fechaInicio,
          fechaFin: periodo.fechaFin,
          idEstudiante: resolvedId,
        });
        idPeriodoFinal =
          periodoResponse?.id || periodoResponse?.data?.id || idPeriodoFinal;
      }

      // 2) Crear presupuesto si hace falta
      if (!idPresupuestoFinal && presupuesto.nombre && presupuesto.monto) {
        if (!idPeriodoFinal) {
          toast.error(
            "Debes crear o seleccionar un período antes de crear el presupuesto."
          );
          setLoading(false);
          return;
        }
        const presupuestoResponse = await postData("presupuestos", {
          descripcion: presupuesto.nombre,
          monto: parseFloat(presupuesto.monto),
          idEstudiante: resolvedId,
          idPeriodo: idPeriodoFinal,
        });
        idPresupuestoFinal =
          presupuestoResponse?.id ||
          presupuestoResponse?.data?.id ||
          idPresupuestoFinal;

        if (idPresupuestoFinal) {
          setUltimoPresupuestoId(String(idPresupuestoFinal));
          try {
            localStorage.setItem(
              "ultimoPresupuestoId",
              String(idPresupuestoFinal)
            );
          } catch {}
        }
      }

      // Validaciones finales de periodo/presupuesto
      if (
        (!presupuestoSeleccionado &&
          (!presupuesto.nombre || !presupuesto.monto)) ||
        (!periodoSeleccionado &&
          (!periodo.nombre || !periodo.fechaInicio || !periodo.fechaFin))
      ) {
        toast.error(
          "Debe haber un presupuesto y un periodo para crear necesidades"
        );
        setLoading(false);
        return;
      }

      const necesidadesPredeterminadasSeleccionadas =
        necesidadesPredeterminadas.filter((n) => n.seleccionado);
      const necesidadesPredeterminadasValidas =
        necesidadesPredeterminadasSeleccionadas.filter(
          (n) => n.monto > 0
        );

      if (
        necesidadesPredeterminadasSeleccionadas.length > 0 &&
        necesidadesPredeterminadasValidas.length === 0
      ) {
        toast.error(
          "Las necesidades predeterminadas seleccionadas deben tener un monto mayor a 0"
        );
        setLoading(false);
        return;
      }

      const necesidadesPersonalizadasValidas =
        necesidadesPersonalizadas.filter(
          (np) => np.nombre && Number(np.monto) > 0
        );

      const hayNecesidadSeleccionada =
        necesidadesPredeterminadasValidas.length > 0 ||
        necesidadesPersonalizadasValidas.length > 0;

      if (!hayNecesidadSeleccionada) {
        toast.error(
          "Debe seleccionar al menos una necesidad con monto válido"
        );
        setLoading(false);
        return;
      }

      // 3) Construir payload de necesidades
      const necesidadesPayload = [];

      necesidadesPredeterminadasValidas.forEach((n) => {
        necesidadesPayload.push({
          descripcion: n.nombre,
          monto: parseFloat(n.monto),
          esPredeterminada: 1,
          idEstudiante: resolvedId,
          idPeriodo: idPeriodoFinal,
          idPresupuesto: idPresupuestoFinal || null,
        });
      });

      necesidadesPersonalizadasValidas.forEach((np) => {
        necesidadesPayload.push({
          descripcion: np.nombre,
          monto: parseFloat(np.monto),
          esPredeterminada: 0,
          idEstudiante: resolvedId,
          idPeriodo: idPeriodoFinal,
          idPresupuesto: idPresupuestoFinal || null,
        });
      });

      if (necesidadesPayload.length > 0) {
        await postData("necesidades", necesidadesPayload);
      }

      toast.success(
        `${necesidadesPayload.length} necesidad(es) guardada(s) correctamente 🎉`
      );

      setMostrarOpcionesNavegacion(true);

      setTimeout(() => {
        if (idEstudiante) {
          try {
            localStorage.setItem("idEstudiante", String(idEstudiante));
          } catch {}
        }
        navigate("/dashboard", { state: { idEstudiante } });
      }, 5000);

      // Reset formulario
      setStep(1);
      setPresupuesto({ nombre: "", monto: "" });
      setPeriodo({ nombre: "", fechaInicio: "", fechaFin: "" });
      setNecesidadesPersonalizadas([
        { nombre: "", monto: "", porcentajeAumento: "" },
      ]);
      setNecesidadesPredeterminadas((prev) =>
        prev.map((n) => ({ ...n, seleccionado: false }))
      );
      setPresupuestoSeleccionado("");
      setPeriodoSeleccionado("");
      setUltimoPresupuestoId("");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar los datos. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Barra de navegación global */}
      <Navbar />

      <div className="tt-wizard-hero">
        <div className="tt-wizard-stage">
          {/* Encabezado + Stepper */}
          <div className="tt-card-glass">
            <div className="tt-wizard-header">
              <div>
                <div className="tt-chip">Configuración de presupuesto</div>
                <h1 className="tt-wizard-title">
                  Crea tu presupuesto y organiza tus necesidades
                </h1>
                <p className="tt-wizard-subtitle">
                  Sigue los pasos para seleccionar o crear un presupuesto,
                  definir un período y registrar las necesidades que quieres
                  controlar.
                </p>
              </div>

              <div className="tt-stepper">
                <div
                  className={`tt-step ${
                    step === 1 ? "active" : step > 1 ? "done" : ""
                  }`}
                >
                  <div className="tt-step-dot">1</div>
                  <span className="tt-step-label">Presupuesto</span>
                </div>
                <div
                  className={`tt-step ${
                    step === 2 ? "active" : step > 2 ? "done" : ""
                  }`}
                >
                  <div className="tt-step-dot">2</div>
                  <span className="tt-step-label">Periodo</span>
                </div>
                <div
                  className={`tt-step ${
                    step === 3 ? "active" : step > 3 ? "done" : ""
                  }`}
                >
                  <div className="tt-step-dot">3</div>
                  <span className="tt-step-label">Necesidades</span>
                </div>
                <div
                  className={`tt-step ${
                    step === 4 ? "active" : step > 4 ? "done" : ""
                  }`}
                >
                  <div className="tt-step-dot">4</div>
                  <span className="tt-step-label">Resumen y guardado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card principal de pasos */}
          <div className="tt-card-glass tt-step-card">
            {/* Mensaje de éxito */}
            {mostrarOpcionesNavegacion && (
              <div className="tt-success-card tt-card-glass">
                <div className="tt-success-content">
                  <h5 className="tt-card-h3">
                    ¡Presupuesto guardado exitosamente!
                  </h5>
                  <p>¿Qué deseas hacer ahora?</p>
                  <div className="tt-success-actions">
                    <button
                      onClick={irAlDashboard}
                      className="tt-btn-primary"
                      type="button"
                    >
                      Ver en dashboard
                    </button>
                    {ultimoPresupuestoId && (
                      <button
                        type="button"
                        className="tt-btn-warning"
                        onClick={() =>
                          navigate(`/presupuesto/${ultimoPresupuestoId}/editar`)
                        }
                      >
                        Editar presupuesto
                      </button>
                    )}
                    <button
                      onClick={irAlHome}
                      className="tt-btn-ghost"
                      type="button"
                    >
                      Volver al inicio
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <p style={{ color: "#cbd5e1", fontWeight: 600 }}>
                Cargando información...
              </p>
            )}

            {/* Paso 1 */}
            {step === 1 && (
              <>
                {presupuestos.length > 0 && (
                  <div className="tt-field">
                    <label className="tt-label">
                      Seleccionar un presupuesto existente
                    </label>
                    <select
                      className="tt-select"
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

                <div className="tt-divider">O crear un nuevo presupuesto</div>

                <div className="tt-step-card">
                  <div className="tt-field">
                    <label className="tt-label">
                      Nombre del presupuesto
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      className="tt-input"
                      placeholder="Ej.: Presupuesto semestre"
                      value={presupuesto.nombre}
                      onChange={handlePresupuestoChange}
                      disabled={!!presupuestoSeleccionado}
                    />
                  </div>

                  <div className="tt-field">
                    <label className="tt-label">
                      Monto total del presupuesto (COP)
                    </label>
                    <input
                      type="number"
                      name="monto"
                      className="tt-input"
                      placeholder="Ej.: 1500000"
                      value={presupuesto.monto}
                      onChange={handlePresupuestoChange}
                      disabled={!!presupuestoSeleccionado}
                    />
                  </div>

                  <div className="tt-actions-end tt-actions-full">
                    <button
                      type="button"
                      className="tt-btn-primary"
                      onClick={handleNext}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Paso 2 */}
            {step === 2 && (
              <>
                {periodos.length > 0 && (
                  <div className="tt-field">
                    <label className="tt-label">
                      Seleccionar un periodo existente
                    </label>
                    <select
                      className="tt-select"
                      value={periodoSeleccionado}
                      onChange={handlePeriodoSeleccionado}
                    >
                      <option value="">-- Seleccionar periodo --</option>
                      {periodos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} (
                          {new Date(
                            p.fechaInicio
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            p.fechaFin
                          ).toLocaleDateString()}
                          )
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="tt-divider">O crear un nuevo periodo</div>

                <div className="tt-step-card">
                  <div className="tt-field">
                    <label className="tt-label">Nombre del período</label>
                    <input
                      type="text"
                      name="nombre"
                      className="tt-input"
                      placeholder="Ej.: 2025-1"
                      value={periodo.nombre}
                      onChange={handlePeriodoChange}
                      disabled={!!periodoSeleccionado}
                    />
                  </div>

                  <div className="tt-grid-2">
                    <div className="tt-field">
                      <label className="tt-label">Fecha de inicio</label>
                      <input
                        type="date"
                        name="fechaInicio"
                        className="tt-input"
                        value={periodo.fechaInicio}
                        onChange={handlePeriodoChange}
                        disabled={!!periodoSeleccionado}
                      />
                    </div>
                    <div className="tt-field">
                      <label className="tt-label">Fecha de fin</label>
                      <input
                        type="date"
                        name="fechaFin"
                        className="tt-input"
                        value={periodo.fechaFin}
                        onChange={handlePeriodoChange}
                        disabled={!!periodoSeleccionado}
                      />
                    </div>
                  </div>

                  <div className="tt-actions-between tt-actions-full">
                    <button
                      type="button"
                      className="tt-btn-ghost"
                      onClick={handleBack}
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      className="tt-btn-primary"
                      onClick={handleNext}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Paso 3 */}
            {step === 3 && (
              <div className="tt-grid-2">
                {/* Predeterminadas */}
                <div className="tt-step-card">
                  <h3 className="tt-card-h3">
                    Necesidades predeterminadas
                  </h3>
                  <p className="tt-wizard-subtitle">
                    Marca las categorías que usarás y asigna un monto a
                    cada una.
                  </p>

                  <div className="tt-checklist">
                    {necesidadesPredeterminadas.map((necesidad, index) => (
                      <div key={index} className="tt-check-item">
                        <div className="tt-check-row">
                          <input
                            type="checkbox"
                            id={`necesidad-${index}`}
                            checked={necesidad.seleccionado}
                            onChange={() =>
                              toggleNecesidadPredeterminada(index)
                            }
                          />
                          <label
                            htmlFor={`necesidad-${index}`}
                            style={{ cursor: "pointer" }}
                          >
                            {necesidad.nombre}
                          </label>
                        </div>

                        {necesidad.seleccionado && (
                          <div className="tt-inline-input">
                            <span className="tt-inline-prefix">$</span>
                            <input
                              type="number"
                              className="tt-input"
                              placeholder="Monto"
                              value={necesidad.monto}
                              onChange={(e) => {
                                const nuevas = [
                                  ...necesidadesPredeterminadas,
                                ];
                                nuevas[index].monto =
                                  parseInt(e.target.value) || 0;
                                setNecesidadesPredeterminadas(nuevas);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personalizadas */}
                <div className="tt-step-card">
                  <h3 className="tt-card-h3">
                    Necesidades personalizadas
                  </h3>
                  <p className="tt-wizard-subtitle">
                    Agrega conceptos específicos que no estén en la lista
                    anterior.
                  </p>

                  {necesidadesPersonalizadas.map((np, idx) => (
                    <div key={idx} className="tt-review-box">
                      <div className="tt-field">
                        <label className="tt-label">
                          Nombre de la necesidad
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          className="tt-input"
                          placeholder="Ej.: Materiales de laboratorio"
                          value={np.nombre}
                          onChange={(e) =>
                            handleNecesidadPersonalizadaChange(idx, e)
                          }
                        />
                      </div>

                      <div className="tt-grid-2">
                        <div className="tt-field">
                          <label className="tt-label">Monto</label>
                          <input
                            type="number"
                            name="monto"
                            className="tt-input"
                            placeholder="Ej.: 50000"
                            value={np.monto}
                            onChange={(e) =>
                              handleNecesidadPersonalizadaChange(idx, e)
                            }
                          />
                        </div>
                        <div className="tt-field">
                          <label className="tt-label">
                            % de aumento (opcional)
                          </label>
                          <input
                            type="number"
                            name="porcentajeAumento"
                            className="tt-input"
                            placeholder="Ej.: 5"
                            value={np.porcentajeAumento}
                            onChange={(e) =>
                              handleNecesidadPersonalizadaChange(idx, e)
                            }
                          />
                        </div>
                      </div>

                      {necesidadesPersonalizadas.length > 1 && (
                        <button
                          type="button"
                          className="tt-btn-warning"
                          style={{
                            height: 36,
                            marginTop: 8,
                            fontSize: 13,
                          }}
                          onClick={() =>
                            removeNecesidadPersonalizada(idx)
                          }
                        >
                          Quitar esta necesidad
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="tt-btn-ghost"
                    style={{ marginTop: 8 }}
                    onClick={addNecesidadPersonalizada}
                  >
                    Agregar otra necesidad personalizada
                  </button>

                  <div
                    className="tt-actions-between tt-actions-full"
                    style={{ marginTop: 16 }}
                  >
                    <button
                      type="button"
                      className="tt-btn-ghost"
                      onClick={handleBack}
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      className="tt-btn-primary"
                      onClick={handleNext}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 4 */}
            {step === 4 && (
              <div className="tt-review">
                <h3 className="tt-card-h3">Resumen antes de guardar</h3>

                <div className="tt-review-box">
                  <h6>Presupuesto seleccionado</h6>
                  <p>
                    {presupuestoSeleccionado
                      ? presupuestos.find(
                          (p) => p.id === presupuestoSeleccionado
                        )?.descripcion
                      : presupuesto.nombre || "Sin nombre"}
                    {" - "}
                    $
                    {presupuestoSeleccionado
                      ? presupuestos
                          .find(
                            (p) => p.id === presupuestoSeleccionado
                          )
                          ?.monto?.toLocaleString()
                      : presupuesto.monto}
                  </p>
                </div>

                <div className="tt-review-box">
                  <h6>Periodo</h6>
                  <p>
                    {periodoSeleccionado
                      ? periodos.find(
                          (p) => p.id === periodoSeleccionado
                        )?.nombre
                      : periodo.nombre}{" "}
                    (
                    {periodoSeleccionado
                      ? new Date(
                          periodos.find(
                            (p) => p.id === periodoSeleccionado
                          )?.fechaInicio
                        ).toLocaleDateString()
                      : periodo.fechaInicio}{" "}
                    -{" "}
                    {periodoSeleccionado
                      ? new Date(
                          periodos.find(
                            (p) => p.id === periodoSeleccionado
                          )?.fechaFin
                        ).toLocaleDateString()
                      : periodo.fechaFin}
                    )
                  </p>
                </div>

                <div className="tt-review-box">
                  <h6>Necesidades predeterminadas</h6>
                  {necesidadesPredeterminadas.filter(
                    (n) => n.seleccionado
                  ).length > 0 ? (
                    <ul className="tt-review-list">
                      {necesidadesPredeterminadas
                        .filter((n) => n.seleccionado)
                        .map((n, index) => (
                          <li key={index}>
                            <span>{n.nombre}</span>
                            <span>
                              ${n.monto.toLocaleString()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="tt-wizard-subtitle">
                      No se seleccionaron necesidades predeterminadas.
                    </p>
                  )}
                </div>

                <div className="tt-review-box">
                  <h6>Necesidades personalizadas</h6>
                  {necesidadesPersonalizadas.filter(
                    (np) => np.nombre && Number(np.monto) > 0
                  ).length > 0 ? (
                    <ul className="tt-review-list">
                      {necesidadesPersonalizadas
                        .filter(
                          (np) => np.nombre && Number(np.monto) > 0
                        )
                        .map((np, index) => (
                          <li key={index}>
                            <div>
                              <div className="fw-semibold">
                                {np.nombre}
                              </div>
                              {np.porcentajeAumento && (
                                <small>
                                  % aumento: {np.porcentajeAumento}%
                                </small>
                              )}
                            </div>
                            <span>
                              $
                              {parseFloat(
                                np.monto
                              ).toLocaleString()}
                            </span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="tt-wizard-subtitle">
                      No se agregaron necesidades personalizadas.
                    </p>
                  )}
                </div>

                <div className="tt-actions-between tt-actions-full">
                  <button
                    type="button"
                    className="tt-btn-ghost"
                    onClick={handleBack}
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    className="tt-btn-success"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar todo"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewNecesidadPresupuesto;
