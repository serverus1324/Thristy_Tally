import React, { useEffect, useState } from 'react';
import { getPredictionSchema, getPredictionStatus, scorePrediction, getData } from '../api/api.js';
import Chart from '../components/chart/Chart.jsx';
import { useLocation } from 'react-router-dom';

export default function PrediccionNecesidades() {
  const location = useLocation();
  const [schema, setSchema] = useState(null);
  const [features, setFeatures] = useState({});
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [periodos, setPeriodos] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [selectedPresupuesto, setSelectedPresupuesto] = useState('');
  const [autoComputing, setAutoComputing] = useState(false);
  const [necesidadesList, setNecesidadesList] = useState([]);

  // Refrescar estado de modelo y cargar esquema si está listo
  const handleRefresh = async () => {
    setLoadingSchema(true);
    setError('');
    setResult(null);
    try {
      let ready = false;
      try {
        const st = await getPredictionStatus();
        const sdata = st?.data || st;
        ready = Boolean(sdata?.ready);
        setModelReady(ready);
      } catch (e) {
        console.warn('No se pudo consultar el estado del modelo:', e?.message || e);
      }

      let data = null;
      if (ready) {
        try {
          const res = await getPredictionSchema();
          data = res?.data || res;
        } catch (e) {
          console.warn('Error cargando esquema:', e?.message || e);
        }
      }
      setSchema(data);

      // Inicializar features
      const init = {};
      if (data?.attributes?.length) {
        for (const a of data.attributes) {
          if (!a.isClass) init[a.name] = '';
        }
      }
      setFeatures(init);
    } finally {
      setLoadingSchema(false);
    }
  };

  useEffect(() => {
    async function loadContext() {
      // Resolver id de estudiante
      let idEst = location.state?.idEstudiante || null;
      try {
        const fromStorage = localStorage.getItem('idEstudiante');
        if (!idEst && fromStorage) idEst = String(fromStorage);
      } catch {}
      // Cargar periodos del estudiante
      if (idEst) {
        try {
          const periodosResp = await getData(`periodos/${idEst}/por-estudiante`);
          const pList = periodosResp?.data || periodosResp || [];
          setPeriodos(Array.isArray(pList) ? pList : []);
        } catch (e) {
          // No bloquear la página por errores de contexto
          console.warn('No se pudieron cargar periodos:', e?.message || e);
        }
        try {
          const presupResp = await getData(`presupuestos/estudiante/${idEst}`);
          const prList = presupResp?.data || presupResp || [];
          setPresupuestos(Array.isArray(prList) ? prList : []);
        } catch (e) {
          console.warn('No se pudieron cargar presupuestos:', e?.message || e);
        }
      }
    }
    handleRefresh();
    loadContext();
  }, []);

  // Al seleccionar un periodo, intentar obtener presupuesto asociado a ese periodo
  useEffect(() => {
    async function loadPresupuestoForPeriodo() {
      let idEst = location.state?.idEstudiante || null;
      try { const fromStorage = localStorage.getItem('idEstudiante'); if (!idEst && fromStorage) idEst = String(fromStorage); } catch {}
      if (!idEst || !selectedPeriodo) return;
      try {
        const presupuestoResp = await getData(`presupuestos/por-estudiante-periodo?idEstudiante=${idEst}&idPeriodo=${selectedPeriodo}`);
        const p = presupuestoResp?.data || presupuestoResp;
        if (p && p.id) {
          setSelectedPresupuesto(String(p.id));
        }
      } catch (e) {
        console.warn('No se pudo cargar presupuesto para el periodo:', e?.message || e);
      }
    }
    loadPresupuestoForPeriodo();
  }, [selectedPeriodo]);

  // Utilidad: normalizar nombre de mes del periodo a valores del modelo
  const mapMes = (nombre) => {
    if (!nombre) return '';
    const s = String(nombre).trim().toUpperCase();
    const meses = {
      'ENERO': 'ENERO', 'FEBRERO': 'FEBRERO', 'MARZO': 'MARZO', 'ABRIL': 'ABRIL',
      'MAYO': 'MAYO', 'JUNIO': 'JUNIO', 'JULIO': 'JULIO', 'AGOSTO': 'AGOSTO',
      'SEPTIEMBRE': 'SEPTIEMBRE', 'OCTUBRE': 'OCTUBRE', 'NOVIEMBRE': 'NOVIEMBRE', 'DICIEMBRE': 'DICIEMBRE'
    };
    // Intentar coincidencia por inclusión, ej. "noviembre 2023" -> NOVIEMBRE
    const hit = Object.keys(meses).find(m => s.includes(m));
    return hit ? meses[hit] : s; // si no coincide, dejar tal cual
  };

  // Utilidad: diferencia en días
  const diffDias = (iniStr, finStr) => {
    try {
      const ini = new Date(iniStr);
      const fin = new Date(finStr);
      const ms = Math.abs(fin.getTime() - ini.getTime());
      return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
    } catch {
      return 30;
    }
  };

  // Construir atributos del modelo desde presupuesto/periodo seleccionados y necesidades
  const buildFeaturesFromSelection = async () => {
    if (!selectedPresupuesto) return null;
    setAutoComputing(true);
    try {
      // Buscar objeto presupuesto y periodo
      const presupuestoObj = presupuestos.find(p => String(p.id || p._id) === String(selectedPresupuesto));
      // Periodo según presupuesto
      const periodoObj = presupuestoObj ? periodos.find(per => String(per.id || per._id) === String(presupuestoObj.idPeriodo || presupuestoObj?.idPeriodo)) : periodos.find(per => String(per.id || per._id) === String(selectedPeriodo));
      // Cargar necesidades del presupuesto
      const necResp = await getData(`necesidades/por-presupuesto?idPresupuesto=${selectedPresupuesto}`);
      const necesidades = Array.isArray(necResp?.data) ? necResp.data : (Array.isArray(necResp) ? necResp : []);

      // Agrupar por tipo (o descripcion)
      const normalizeLabel = (t) => String(t || '').trim().toUpperCase();
      const porCategoria = {};
      let totalGastado = 0;
      necesidades.forEach(n => {
        const key = normalizeLabel(n.tipo || n.descripcion);
        const monto = Number(n.monto || 0);
        totalGastado += monto;
        porCategoria[key] = (porCategoria[key] || 0) + monto;
      });

      const categorias = Object.keys(porCategoria);
      const topLabel = categorias.length ? categorias.reduce((a, b) => porCategoria[a] >= porCategoria[b] ? a : b) : 'OTROS';

      const presupuestoTotal = Number(presupuestoObj?.monto || 0);
      const asignadoIgual = (categorias.length > 0) ? (presupuestoTotal / categorias.length) : (presupuestoTotal / Math.max(1, necesidades.length));
      const gastoTop = porCategoria[topLabel] || 0;
      const excedente = Math.max(0, gastoTop - asignadoIgual);
      const restante = presupuestoTotal - totalGastado;
      const pctNec = asignadoIgual > 0 ? (gastoTop / asignadoIgual) * 100 : 0;
      const pctTotal = presupuestoTotal > 0 ? (totalGastado / presupuestoTotal) * 100 : 0;
      const cantNec = necesidades.length;
      const mes = mapMes(periodoObj?.nombre || '');
      const dur = diffDias(periodoObj?.fechaInicio, periodoObj?.fechaFin);

      // Promedio últimos 3 periodos y tendencia
      let promedio3 = 0;
      try {
        let idEst = location.state?.idEstudiante || null;
        try { const fromStorage = localStorage.getItem('idEstudiante'); if (!idEst && fromStorage) idEst = String(fromStorage); } catch {}
        const ordenados = [...periodos].sort((a, b) => new Date(b.fechaFin) - new Date(a.fechaFin));
        const ultimos3 = ordenados.filter(p => String(p.id || p._id) !== String(periodoObj?.id || periodoObj?._id)).slice(0, 3);
        if (idEst && ultimos3.length) {
          let acum = 0; let count = 0;
          for (const per of ultimos3) {
            try {
              const r = await getData(`necesidades/por-estudiante-periodo?idEstudiante=${idEst}&idPeriodo=${per.id || per._id}`);
              const arr = Array.isArray(r?.data) ? r.data : (Array.isArray(r) ? r : []);
              const sum = arr.reduce((s, it) => s + Number(it.monto || 0), 0);
              acum += sum; count += 1;
            } catch {}
          }
          promedio3 = count ? (acum / count) : 0;
        }
      } catch {}
      const tendencia = promedio3 > 0 ? (totalGastado / promedio3) : (totalGastado > 0 ? 1 : 0);

      const built = {
        gastoNecesidadActual: Number(gastoTop.toFixed(2)),
        valorAsignadoNecesidad: Number(asignadoIgual.toFixed(2)),
        excedenteActual: Number(excedente.toFixed(2)),
        promedioUltimos3Periodos: Number(promedio3.toFixed(2)),
        tendenciaGasto: Number(tendencia.toFixed(4)),
        presupuestoTotalPeriodo: Number(presupuestoTotal.toFixed(2)),
        presupuestoRestantePeriodo: Number(restante.toFixed(2)),
        porcentajeGastoNecesidad: Number(pctNec.toFixed(2)),
        porcentajeGastoTotal: Number(pctTotal.toFixed(2)),
        cantidadNecesidadesCreadas: cantNec,
        mes: mes,
        duracionPeriodo: dur
      };

      return { features: built, categorias: porCategoria, topLabel, classAttr: 'necesidadQueExcedio' };
    } finally {
      setAutoComputing(false);
    }
  };

  // Ya no se ejecuta automáticamente: el usuario presiona "Predecir"

  const handleChange = (name, value) => {
    setFeatures(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      // Construir features desde la selección y guardar necesidades para la tabla
      const built = await buildFeaturesFromSelection();
      if (!built) {
        setError('Seleccione periodo y presupuesto primero');
        return;
      }
      const { features: f, categorias, topLabel, classAttr } = built;
      setFeatures(prev => ({ ...prev, ...f }));

      // Cargar lista de necesidades para tabla
      try {
        const necResp = await getData(`necesidades/por-presupuesto?idPresupuesto=${selectedPresupuesto}`);
        const necesidades = Array.isArray(necResp?.data) ? necResp.data : (Array.isArray(necResp) ? necResp : []);
        setNecesidadesList(necesidades);
      } catch {}

      // Intentar con el modelo
      if (modelReady) {
        try {
          const res = await scorePrediction(f);
          setResult(res?.data || res);
          setError('');
          return;
        } catch (e2) {
          console.warn('Predicción con modelo falló, aplicando heurística:', e2?.message || e2);
        }
      }

      // Fallback heurístico
      const total = Object.values(categorias).reduce((s, v) => s + v, 0);
      const distribution = {};
      const labels = ['ALIMENTACION','TRANSPORTE','INESPERADOS','OTROS','MATRICULA','UTILES','ALOJAMIENTO'];
      labels.forEach(lbl => {
        const v = categorias[lbl] || 0;
        distribution[lbl] = total > 0 ? (v / total) : (lbl === topLabel ? 1 : 0);
      });
      setResult({
        predictedLabel: topLabel,
        predictedIndex: labels.indexOf(topLabel),
        distribution,
        classAttribute: classAttr
      });
    } catch (e) {
      setError(e?.message || 'Error realizando predicción');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (a) => {
    const val = features[a.name] ?? '';
    if (a.type === 'nominal' && Array.isArray(a.values)) {
      return (
        <select value={val} onChange={(ev) => handleChange(a.name, ev.target.value)} className="border rounded px-3 py-2 w-full">
          <option value="">-- Seleccione --</option>
          {a.values.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      );
    }
    return (
      <input type="number" value={val} onChange={(ev) => handleChange(a.name, ev.target.value)} className="border rounded px-3 py-2 w-full" placeholder="Ingrese valor" />
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="rounded-lg p-6 text-white" style={{ background: 'linear-gradient(90deg, #1e3a8a, #0ea5e9, #10b981)' }}>
        <h1 className="text-2xl font-semibold">Predicción de necesidades (J48)</h1>
        <p className="opacity-90">Use el esquema del modelo para construir una instancia y obtener la predicción.</p>
        <div className="mt-3 flex items-center gap-3">
          <span className={`px-3 py-1 rounded text-sm ${modelReady ? 'bg-green-600' : 'bg-red-600'}`}>
            {modelReady ? 'Modelo listo' : 'Modelo no disponible'}
          </span>
          <button type="button" onClick={handleRefresh} className="px-3 py-1 rounded bg-white text-blue-800 text-sm">Recargar estado</button>
        </div>
      </div>

      <div className="mt-6 bg-white shadow rounded p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo</label>
            <select className="border rounded px-3 py-2 w-full" value={selectedPeriodo} onChange={(e) => setSelectedPeriodo(e.target.value)}>
              <option value="">-- Seleccione periodo --</option>
              {periodos.map(per => (
                <option key={per.id || per._id || per} value={String(per.id || per._id || per)}>{per.nombre || per.descripcion || per.toString()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto</label>
            <select className="border rounded px-3 py-2 w-full" value={selectedPresupuesto} onChange={(e) => setSelectedPresupuesto(e.target.value)}>
              <option value="">-- Seleccione presupuesto --</option>
              {presupuestos.map(p => (
                <option key={p.id || p._id || p} value={String(p.id || p._id || p)}>{p.descripcion || p.nombre || p.toString()}</option>
              ))}
            </select>
          </div>
        </div>
        {loadingSchema && <p>Cargando esquema...</p>}
        {/* No mostrar errores crudos en UI; usar mensajes suaves */}
        {!modelReady && (
          <div className="rounded border bg-yellow-50 text-yellow-800 p-3 mb-4">
            El modelo aún no está disponible. Verifique que el backend esté arrancado en <code>http://localhost:8081</code>.
          </div>
        )}
        {/* Botón de predicción basado en selección (sin obligar a llenar atributos) */}
        <form onSubmit={handleSubmit}>
          <div className="mt-2 flex gap-3">
            <button type="submit" disabled={submitting || !selectedPresupuesto} className="px-4 py-2 rounded text-white" style={{ backgroundColor: '#1e3a8a' }}>{submitting ? 'Prediciendo...' : 'Predecir'}</button>
            <button type="button" onClick={() => { setResult(null); setError(''); setNecesidadesList([]); }} className="px-4 py-2 rounded text-white" style={{ backgroundColor: '#10b981' }}>Limpiar</button>
            <span className="text-sm text-gray-500 flex items-center">{autoComputing ? 'Calculando desde selección...' : ''}</span>
          </div>
        </form>
      </div>

      {/* Tabla de necesidades */}
      {necesidadesList && necesidadesList.length > 0 && (
        <div className="mt-6 bg-white shadow rounded p-6">
          <h2 className="text-lg font-semibold mb-3">Necesidades del presupuesto seleccionado</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm text-gray-700 border-b">Descripción</th>
                  <th className="px-3 py-2 text-left text-sm text-gray-700 border-b">Tipo</th>
                  <th className="px-3 py-2 text-right text-sm text-gray-700 border-b">Monto</th>
                </tr>
              </thead>
              <tbody>
                {necesidadesList.map((n) => (
                  <tr key={String(n.id || n._id)} className="border-b">
                    <td className="px-3 py-2 text-sm text-gray-800">{n.descripcion}</td>
                    <td className="px-3 py-2 text-sm text-gray-800">{n.tipo}</td>
                    <td className="px-3 py-2 text-right text-sm text-gray-800">{Number(n.monto || 0).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 bg-white shadow rounded p-6">
          <h2 className="text-lg font-semibold mb-2">Resultado</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded" style={{ backgroundColor: '#e0f2fe' }}>
              <div className="text-sm text-gray-600">Etiqueta predicha</div>
              <div className="text-xl font-bold text-blue-800">{result.predictedLabel}</div>
            </div>
            <div className="p-4 rounded" style={{ backgroundColor: '#ecfeff' }}>
              <div className="text-sm text-gray-600">Atributo de clase</div>
              <div className="text-xl font-bold text-teal-700">{result.classAttribute}</div>
            </div>
            <div className="p-4 rounded" style={{ backgroundColor: '#ddf7e6' }}>
              <div className="text-sm text-gray-600">Índice</div>
              <div className="text-xl font-bold text-green-700">{result.predictedIndex}</div>
            </div>
          </div>

          {/* Mensaje destacado de la necesidad que se excederá */}
          <div className="mt-4 p-4 rounded bg-red-50 text-red-700 border border-red-200">
            <strong>Necesidad que se excederá:</strong> {result.predictedLabel}
          </div>

          {result.distribution && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Distribución</div>
              <div className="space-y-2">
                {Object.entries(result.distribution).map(([label, prob]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>{label}</span>
                      <span>{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded">
                      <div className="h-3 bg-blue-500 rounded" style={{ width: `${Math.min(100, Math.max(0, prob * 100))}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Gráfica con Chart.js basada en la tabla (descripcion/monto) */}
          {necesidadesList && necesidadesList.length > 0 && (
            <div className="mt-6">
              <Chart gastos={necesidadesList} highlightLabel={result?.predictedLabel} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}