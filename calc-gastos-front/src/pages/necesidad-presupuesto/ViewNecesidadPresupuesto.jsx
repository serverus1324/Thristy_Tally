import React, { useState } from "react";
import { getData, postData } from "../../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewNecesidadPresupuesto = ({ idUsuario }) => {
  const [step, setStep] = useState(1);

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
    { nombre: "Alimentación", seleccionado: false },
    { nombre: "Transporte", seleccionado: false },
    { nombre: "Educación", seleccionado: false },
    { nombre: "Servicios", seleccionado: false },
    { nombre: "Otros", seleccionado: false },
  ]);

  // Paso 4 - Necesidad personalizada
  const [necesidadPersonalizada, setNecesidadPersonalizada] = useState({
    nombre: "",
    monto: "",
    porcentajeAumento: "",
  });

  // ---- Handlers generales ----
  const handleNext = () => setStep((prev) => prev + 1);
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

  // ---- Envío final ----
  const handleSubmit = async () => {
    try {
      // 1️⃣ Crear Presupuesto
      const presupuestoResponse = await postData("presupuestos", {
        nombre: presupuesto.nombre,
        monto: parseFloat(presupuesto.monto),
        idEstudiante: idUsuario,
      });

      // 2️⃣ Crear Periodo
      const periodoResponse = await postData("periodos", {
        nombre: periodo.nombre,
        fechaInicio: periodo.fechaInicio,
        fechaFin: periodo.fechaFin,
        idEstudiante: idUsuario,
      });

      // 3️⃣ Crear Necesidades predeterminadas seleccionadas
      const seleccionadas = necesidadesPredeterminadas.filter(
        (n) => n.seleccionado
      );

      for (const necesidad of seleccionadas) {
        await postData("necesidades", {
          descripcion: necesidad.nombre,
          monto: 0,
          esPredeterminada: true,
          idPresupuesto: presupuestoResponse.id,
          idPeriodo: periodoResponse.id,
          idEstudiante: idUsuario,
        });
      }

      // 4️⃣ Crear necesidad personalizada (si se completó)
      if (necesidadPersonalizada.nombre && necesidadPersonalizada.monto) {
        await postData("necesidades", {
          descripcion: necesidadPersonalizada.nombre,
          monto: parseFloat(necesidadPersonalizada.monto),
          esPredeterminada: false,
          porcentajeAumento:
            parseFloat(necesidadPersonalizada.porcentajeAumento) || 0,
          idPresupuesto: presupuestoResponse.id,
          idPeriodo: periodoResponse.id,
          idEstudiante: idUsuario,
          
        });
      }

      toast.success("Datos guardados correctamente 🎉");

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
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar los datos. Inténtalo nuevamente.");
    }
  };

  // ---- Renderizado por pasos ----
  return (
    <div className="form-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 className="text-center mb-4">
        {step === 1 && "Paso 1: Crear Presupuesto"}
        {step === 2 && "Paso 2: Crear Periodo"}
        {step === 3 && "Paso 3: Seleccionar Necesidades Predeterminadas"}
        {step === 4 && "Paso 4: Agregar Necesidad Personalizada"}
      </h2>

      {/* Paso 1 */}
      {step === 1 && (
        <div>
          <label>Nombre del Presupuesto</label>
          <input
            type="text"
            name="nombre"
            value={presupuesto.nombre}
            onChange={handlePresupuestoChange}
            className="form-control mb-3"
          />
          <label>Monto del Presupuesto</label>
          <input
            type="number"
            name="monto"
            value={presupuesto.monto}
            onChange={handlePresupuestoChange}
            className="form-control mb-3"
          />
          <button onClick={handleNext} className="btn btn-primary w-100">
            Siguiente
          </button>
        </div>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <div>
          <label>Nombre del Periodo</label>
          <input
            type="text"
            name="nombre"
            value={periodo.nombre}
            onChange={handlePeriodoChange}
            className="form-control mb-3"
          />
          <label>Fecha de Inicio</label>
          <input
            type="date"
            name="fechaInicio"
            value={periodo.fechaInicio}
            onChange={handlePeriodoChange}
            className="form-control mb-3"
          />
          <label>Fecha de Fin</label>
          <input
            type="date"
            name="fechaFin"
            value={periodo.fechaFin}
            onChange={handlePeriodoChange}
            className="form-control mb-3"
          />
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
          <h5>Selecciona las necesidades predeterminadas:</h5>
          {necesidadesPredeterminadas.map((necesidad, index) => (
            <div key={index} className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id={`necesidad-${index}`}
                checked={necesidad.seleccionado}
                onChange={() => toggleNecesidadPredeterminada(index)}
              />
              <label
                htmlFor={`necesidad-${index}`}
                className="form-check-label"
              >
                {necesidad.nombre}
              </label>
            </div>
          ))}
          <div className="d-flex justify-content-between mt-3">
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
          <label>Nombre de la Necesidad</label>
          <input
            type="text"
            name="nombre"
            value={necesidadPersonalizada.nombre}
            onChange={handleNecesidadPersonalizadaChange}
            className="form-control mb-3"
          />
          <label>Monto</label>
          <input
            type="number"
            name="monto"
            value={necesidadPersonalizada.monto}
            onChange={handleNecesidadPersonalizadaChange}
            className="form-control mb-3"
          />
          <label>% de Aumento (opcional)</label>
          <input
            type="number"
            name="porcentajeAumento"
            value={necesidadPersonalizada.porcentajeAumento}
            onChange={handleNecesidadPersonalizadaChange}
            className="form-control mb-3"
          />
          <div className="d-flex justify-content-between">
            <button onClick={handleBack} className="btn btn-secondary">
              Atrás
            </button>
            <button onClick={handleSubmit} className="btn btn-success">
              Guardar Todo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewNecesidadPresupuesto;
