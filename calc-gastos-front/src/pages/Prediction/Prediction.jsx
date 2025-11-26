import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import {
  getModeloStatus,
  getModeloSchema,
  predictNecesidad,
  getData,
} from "../../api/api.js";

import "./prediction.css";

export default function Prediction() {
  const [status, setStatus] = useState(null);
  const [schema, setSchema] = useState(null);
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const location = useLocation();
  const [periodos, setPeriodos] = useState([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [resumen, setResumen] = useState(null);
  const [necesidades, setNecesidades] = useState([]);
  const [prom3, setProm3] = useState(0);
  const [durMes, setDurMes] = useState(30);

  const className = useMemo(
    () => schema?.classAttribute || null,
    [schema]
  );

  const attrs = useMemo(
    () =>
      Array.isArray(schema?.attributes)
        ? schema.attributes.filter((a) => !a.isClass)
        : [],
    [schema]
  );

  const resumenCalc = useMemo(() => {
    const periodoObj = periodos.find(
      (per) => String(per.id || per._id) === String(selectedPeriodo)
    );

    const totalGastado = Number(
      resumen?.totalGastado ||
        necesidades.reduce((acc, n) => acc + Number(n.monto || 0), 0)
    );
    const totalAsignado = Number(resumen?.totalAsignado || 0);
    const disponible = Number(
      resumen?.disponible || Math.max(0, totalAsignado - totalGastado)
    );
    const pct = Number(
      resumen?.porcentajeConsumido ||
        (totalAsignado > 0 ? totalGastado / totalAsignado : 0)
    );
    const mes = mapMes(periodoObj?.nombre);
    const duracion =
      durMes || diffDias(periodoObj?.fechaInicio, periodoObj?.fechaFin);

    return {
      totalGastado,
      totalAsignado,
      disponible,
      pct,
      cantidad: necesidades.length,
      mes,
      duracion,
    };
  }, [resumen, necesidades, periodos, selectedPeriodo, durMes]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      setResult(null);

      try {
        const st = await getModeloStatus();
        const sdata = st?.data || st;
        if (mounted) setStatus(sdata);

        const sc = await getModeloSchema();
        const scData = sc?.data || sc;
        if (mounted) setSchema(scData);

        const init = {};
        for (const a of Array.isArray(scData?.attributes)
          ? scData.attributes
          : []) {
          if (a.isClass) continue;
          if (a.isNumeric) init[a.name] = 0;
          else if (Array.isArray(a.values) && a.values.length)
            init[a.name] = a.values[0];
          else init[a.name] = "";
        }
        if (mounted) setFeatures(init);
      } catch (e) {
        if (mounted) setError(String(e?.message || "Error"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function mapMes(nombre) {
    if (!nombre) return "";
    const s = String(nombre).trim().toUpperCase();
    const meses = {
      ENERO: "ENERO",
      FEBRERO: "FEBRERO",
      MARZO: "MARZO",
      ABRIL: "ABRIL",
      MAYO: "MAYO",
      JUNIO: "JUNIO",
      JULIO: "JULIO",
      AGOSTO: "AGOSTO",
      SEPTIEMBRE: "SEPTIEMBRE",
      OCTUBRE: "OCTUBRE",
      NOVIEMBRE: "NOVIEMBRE",
      DICIEMBRE: "DICIEMBRE",
    };
    const hit = Object.keys(meses).find((m) => s.includes(m));
    return hit ? meses[hit] : s;
  }

  function diffDias(iniStr, finStr) {
    try {
      const ini = new Date(iniStr);
      const fin = new Date(finStr);
      const ms = Math.abs(fin.getTime() - ini.getTime());
      return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
    } catch {
      return 30;
    }
  }

  // Cargar periodos del estudiante
  useEffect(() => {
    async function loadPeriodos() {
      let idEst = location.state?.idEstudiante || null;
      try {
        const fromStorage = localStorage.getItem("idEstudiante");
        if (!idEst && fromStorage) idEst = String(fromStorage);
      } catch {}
      if (!idEst) return;

      try {
        const periodosResp = await getData(
          `periodos/${idEst}/por-estudiante`
        );
        const pList = periodosResp?.data || periodosResp || [];
        setPeriodos(Array.isArray(pList) ? pList : []);
      } catch (e) {
        setError(String(e?.message || "Error cargando periodos"));
      }
    }
    loadPeriodos();
  }, [location.state]);

  useEffect(() => {
    async function loadContextForPeriodo() {
      let idEst = location.state?.idEstudiante || null;
      try {
        const fromStorage = localStorage.getItem("idEstudiante");
        if (!idEst && fromStorage) idEst = String(fromStorage);
      } catch {}
      if (!idEst || !selectedPeriodo) return;

      try {
        const r = await getData(
          `necesidades/resumen-presupuesto?idEstudiante=${idEst}&idPeriodo=${selectedPeriodo}`
        );
        setResumen(r?.data || r);
      } catch {}

      try {
        const n = await getData(
          `necesidades/por-estudiante-periodo?idEstudiante=${idEst}&idPeriodo=${selectedPeriodo}`
        );
        setNecesidades(
          Array.isArray(n?.data) ? n.data : Array.isArray(n) ? n : []
        );
      } catch {}
    }

    loadContextForPeriodo();
  }, [selectedPeriodo, location.state]);

  useEffect(() => {
    if (!schema || !selectedPeriodo) return;

    const periodoObj = periodos.find(
      (per) => String(per.id || per._id) === String(selectedPeriodo)
    );

    const totalGastado = Number(
      resumen?.totalGastado ||
        necesidades.reduce((acc, n) => acc + Number(n.monto || 0), 0)
    );
    const totalAsignado = Number(resumen?.totalAsignado || 0);
    const disponible = Number(
      resumen?.disponible || Math.max(0, totalAsignado - totalGastado)
    );
    const pct = Number(resumen?.porcentajeConsumido || 0);
    const pctFrac = pct > 1 ? pct / 100 : pct;

    const auto = {};
    for (const a of attrs) {
      if (a.name === "gastoNecesidadActual") auto[a.name] = totalGastado;
      else if (a.name === "valorAsignadoNecesidad") auto[a.name] = 0;
      else if (a.name === "excedenteActual") auto[a.name] = disponible;
      else if (a.name === "promedioUltimos3Periodos") auto[a.name] = prom3;
      else if (a.name === "tendenciaGasto")
        auto[a.name] = prom3 > 0 ? totalGastado / prom3 : 0;
      else if (a.name === "presupuestoTotalPeriodo")
        auto[a.name] = totalAsignado;
      else if (a.name === "presupuestoRestantePeriodo")
        auto[a.name] = disponible;
      else if (a.name === "porcentajeGastoNecesidad") auto[a.name] = 0;
      else if (a.name === "porcentajeGastoTotal")
        auto[a.name] =
          totalAsignado > 0 ? totalGastado / totalAsignado : pctFrac;
      else if (a.name === "cantidadNecesidadesCreadas")
        auto[a.name] = necesidades.length;
      else if (a.name === "mes") auto[a.name] = mapMes(periodoObj?.nombre);
      else if (a.name === "duracionPeriodo")
        auto[a.name] =
          durMes || diffDias(periodoObj?.fechaInicio, periodoObj?.fechaFin);
    }

    setFeatures((prev) => ({ ...prev, ...auto }));
  }, [schema, attrs, selectedPeriodo, resumen, necesidades, prom3, durMes, periodos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const enriched = {
        ...features,
        tendenciaGasto:
          prom3 > 0 ? Number(features.gastoNecesidadActual || 0) / prom3 : 0,
        promedioUltimos3Periodos: prom3,
        duracionPeriodo: durMes,
      };

      const res = await predictNecesidad(enriched);
      const data = res?.data || res;
      setResult(data);
    } catch (e2) {
      setError(String(e2?.message || "Error"));
    }
  };

  return (
    <div className="pred-page">
      <Navbar />

      <main className="pred-hero">
        <section className="pred-card">
          {/* Encabezado */}
          <div className="pred-pill">ANÁLISIS</div>
          <h1 className="pred-title">Predicción con modelo J48</h1>
          <p className="pred-subtitle">
            Seleccione un período, ajuste los valores de referencia y obtenga la
            predicción de qué necesidad podría exceder el presupuesto.
          </p>

          <div className="pred-divider" />

          {/* Configuración del período */}
          <section className="pred-section">
            <h2 className="pred-section-title">
              Configuración del período
            </h2>

            <div className="pred-grid-2">
              <div className="pred-field">
                <label className="pred-label">Periodo</label>
                <p className="pred-help">
                  Al seleccionar un período se cargan automáticamente el
                  presupuesto total, el gasto acumulado y las necesidades
                  registradas.
                </p>
                <select
                  className="pred-input"
                  value={selectedPeriodo}
                  onChange={(e) => setSelectedPeriodo(e.target.value)}
                >
                  <option value="">-- Seleccione período --</option>
                  {periodos.map((per) => (
                    <option
                      key={String(per.id || per._id)}
                      value={String(per.id || per._id)}
                    >
                      {per.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pred-field">
                <label className="pred-label">
                  Promedio últimos 3 períodos
                </label>
                <p className="pred-help">
                  Referencia para estimar la tendencia de gasto. Por ejemplo, el
                  promedio del gasto total de los tres últimos períodos.
                </p>
                <input
                  type="number"
                  className="pred-input"
                  value={prom3}
                  onChange={(e) => setProm3(Number(e.target.value))}
                />
              </div>

              <div className="pred-field pred-field--full">
                <label className="pred-label">
                  Duración del mes (días)
                </label>
                <p className="pred-help">
                  Puede dejar el valor detectado o ajustar a 30/31 según el
                  período seleccionado.
                </p>
                <input
                  type="number"
                  className="pred-input"
                  value={durMes}
                  onChange={(e) => setDurMes(Number(e.target.value))}
                />
              </div>
            </div>
          </section>

          {/* Resumen del periodo */}
          <section className="pred-section">
            <h2 className="pred-section-title">
              Resumen del período seleccionado
            </h2>

            <div className="pred-summary-grid">
              <div className="pred-summary-card">
                <span className="pred-summary-label">
                  Total asignado
                </span>
                <span className="pred-summary-value">
                  {resumenCalc.totalAsignado}
                </span>
              </div>
              <div className="pred-summary-card">
                <span className="pred-summary-label">
                  Total gastado
                </span>
                <span className="pred-summary-value">
                  {resumenCalc.totalGastado}
                </span>
              </div>
              <div className="pred-summary-card">
                <span className="pred-summary-label">
                  Disponible
                </span>
                <span className="pred-summary-value">
                  {resumenCalc.disponible}
                </span>
              </div>
              <div className="pred-summary-card">
                <span className="pred-summary-label">
                  Porcentaje consumido
                </span>
                <span className="pred-summary-value">
                  {`${(resumenCalc.pct * 100).toFixed(1)}%`}
                </span>
              </div>
              <div className="pred-summary-card">
                <span className="pred-summary-label">
                  Necesidades registradas
                </span>
                <span className="pred-summary-value">
                  {resumenCalc.cantidad}
                </span>
              </div>
              <div className="pred-summary-card">
                <span className="pred-summary-label">Mes</span>
                <span className="pred-summary-value">
                  {resumenCalc.mes || "-"}
                </span>
              </div>
            </div>

            <div className="pred-footer-row">
              <button
                type="button"
                className="pred-btn-primary"
                onClick={handleSubmit}
                disabled={loading || !selectedPeriodo}
              >
                {loading ? "Cargando..." : "Obtener predicción"}
              </button>

              <div className="pred-model-status">
                <span
                  className={
                    "pred-status-dot " +
                    (status?.ready ? "pred-status-dot--ok" : "")
                  }
                />
                <span className="pred-status-text">
                  Modelo:{" "}
                  {status?.ready ? "Listo para predecir" : "No disponible"}
                </span>
              </div>
            </div>
          </section>

          {/* Resultado */}
          {error && (
            <div className="pred-alert pred-alert--error">{error}</div>
          )}

          {result && (
            <section className="pred-section pred-result">
              <h2 className="pred-section-title">Resultado de la predicción</h2>
              <p className="pred-result-main">
                {String(result?.resultado ?? "")}
              </p>
              <p className="pred-help">
                Esta es la necesidad que el modelo estima que podría exceder el
                presupuesto según los datos del período seleccionado.
              </p>

              <div className="pred-result-meta">
                <span>Clase: {className ?? "-"}</span>
                <span>Atributos: {attrs.length}</span>
                <span>
                  Estado del modelo:{" "}
                  {status?.ready ? "Listo" : "No disponible"}
                </span>
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
