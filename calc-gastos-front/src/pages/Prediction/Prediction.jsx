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

  useEffect(() => {
    async function loadPeriodos() {
      let idEst = location.state?.idPerfil || null;
      try {
        const fromStorage = localStorage.getItem("idPerfil");
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
      let idEst = location.state?.idPerfil || null;
      try {
        const fromStorage = localStorage.getItem("idPerfil");
        if (!idEst && fromStorage) idEst = String(fromStorage);
      } catch {}
      if (!idEst || !selectedPeriodo) return;

      try {
        const r = await getData(
          `necesidades/resumen-presupuesto?idPerfil=${idEst}&idPeriodo=${selectedPeriodo}`
        );
        setResumen(r?.data || r);
      } catch {}

      try {
        const n = await getData(
          `necesidades/por-estudiante-periodo?idPerfil=${idEst}&idPeriodo=${selectedPeriodo}`
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
        <div className="pred-stage">
          {/* Header Section */}
          <div className="pred-header">
            <div className="pred-pill">
              <span className="pred-pill-dot"></span>
              ANÁLISIS INTELIGENTE
            </div>
            <h1 className="pred-title">Predicción de Necesidades</h1>
            <p className="pred-subtitle">
              Selecciona un período y ajusta los parámetros para predecir cuál necesidad podría exceder tu presupuesto.
            </p>
          </div>

          {/* Configuración Section */}
          <section className="pred-section">
            <h2 className="pred-section-title">Configuración</h2>
            <div className="pred-config-grid">
              {/* Card 1 - Periodo */}
              <div className="pred-config-card">
                <label className="pred-config-label">
                  <span className="pred-config-icon blue">📅</span>
                  Período
                </label>
                <p className="pred-config-help">
                  Selecciona un período para cargar sus datos automáticamente
                </p>
                <select
                  className="pred-input"
                  value={selectedPeriodo}
                  onChange={(e) => setSelectedPeriodo(e.target.value)}
                >
                  <option value="">-- Selecciona un período --</option>
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

              {/* Card 2 - Promedio */}
              <div className="pred-config-card">
                <label className="pred-config-label">
                  <span className="pred-config-icon teal">📊</span>
                  Promedio últimos 3 períodos
                </label>
                <p className="pred-config-help">
                  Valor de referencia para calcular la tendencia de gasto
                </p>
                <input
                  type="number"
                  className="pred-input"
                  value={prom3}
                  onChange={(e) => setProm3(Number(e.target.value))}
                />
              </div>

              {/* Card 3 - Duración */}
              <div className="pred-config-card">
                <label className="pred-config-label">
                  <span className="pred-config-icon green">⏱️</span>
                  Duración del mes (días)
                </label>
                <p className="pred-config-help">
                  Ajusta la duración según el período seleccionado
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

          {/* Resumen Section */}
          <section className="pred-section">
            <h2 className="pred-section-title">Resumen del Período</h2>
            <div className="pred-summary-grid">
              <div className="pred-summary-card">
                <div className="pred-summary-icon blue"></div>
                <div className="pred-summary-content">
                  <p className="pred-summary-label">Total Asignado</p>
                  <h4 className="pred-summary-value">
                    ${Number(resumenCalc.totalAsignado || 0).toLocaleString()}
                  </h4>
                </div>
              </div>

              <div className="pred-summary-card">
                <div className="pred-summary-icon red"></div>
                <div className="pred-summary-content">
                  <p className="pred-summary-label">Total Gastado</p>
                  <h4 className="pred-summary-value">
                    ${Number(resumenCalc.totalGastado || 0).toLocaleString()}
                  </h4>
                </div>
              </div>

              <div className="pred-summary-card">
                <div className="pred-summary-icon green"></div>
                <div className="pred-summary-content">
                  <p className="pred-summary-label">Disponible</p>
                  <h4 className="pred-summary-value">
                    ${Number(resumenCalc.disponible || 0).toLocaleString()}
                  </h4>
                </div>
              </div>

              <div className="pred-summary-card">
                <div className="pred-summary-icon purple"></div>
                <div className="pred-summary-content">
                  <p className="pred-summary-label">% Consumido</p>
                  <h4 className="pred-summary-value">
                    {`${Math.min(100, Number((resumenCalc.pct * 100) || 0)).toFixed(1)}%`}
                  </h4>
                </div>
              </div>

              <div className="pred-summary-card">
                <div className="pred-summary-icon orange"></div>
                <div className="pred-summary-content">
                  <p className="pred-summary-label">Necesidades</p>
                  <h4 className="pred-summary-value">
                    {resumenCalc.cantidad}
                  </h4>
                </div>
              </div>

              <div className="pred-summary-card">
                <div className="pred-summary-icon cyan"></div>
                <div className="pred-summary-content">
                  <p className="pred-summary-label">Mes</p>
                  <h4 className="pred-summary-value">
                    {resumenCalc.mes || "-"}
                  </h4>
                </div>
              </div>
            </div>

            {/* Action Button & Model Status */}
            <div className="pred-action-section">
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

              <button
                type="button"
                className="pred-btn-primary"
                onClick={handleSubmit}
                disabled={loading || !selectedPeriodo}
              >
                {loading ? "Procesando..." : "Obtener Predicción"}
              </button>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="pred-alert pred-alert--error">{error}</div>
          )}

          {/* Result */}
          {result && (
            <section className="pred-section pred-result">
              <div className="pred-result-card">
                <h2 className="pred-result-title">Resultado de la Predicción</h2>
                <div className="pred-result-main">
                  {String(result?.resultado || "Sin resultados")}
                </div>
                <p className="pred-config-help">
                  Esta es la necesidad que el modelo estima podría exceder el presupuesto según los datos del período.
                </p>

                <div className="pred-result-meta">
                  <span className="pred-result-meta-item">
                    Clase: <strong>{className || "-"}</strong>
                  </span>
                  <span className="pred-result-meta-item">
                    Atributos: <strong>{attrs.length}</strong>
                  </span>
                  <span className="pred-result-meta-item">
                    Estado: <strong>{status?.ready ? "Listo" : "No disponible"}</strong>
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
