import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getModeloStatus, getModeloSchema, predictNecesidad, getData } from '../../api/api.js'

export default function Prediction() {
  const [status, setStatus] = useState(null)
  const [schema, setSchema] = useState(null)
  const [features, setFeatures] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const location = useLocation()
  const [periodos, setPeriodos] = useState([])
  const [selectedPeriodo, setSelectedPeriodo] = useState('')
  const [resumen, setResumen] = useState(null)
  const [necesidades, setNecesidades] = useState([])
  const [prom3, setProm3] = useState(0)
  const [durMes, setDurMes] = useState(30)
  const className = useMemo(() => schema?.classAttribute || null, [schema])
  const attrs = useMemo(() => Array.isArray(schema?.attributes) ? schema.attributes.filter(a => !a.isClass) : [], [schema])
  const resumenCalc = useMemo(() => {
    const periodoObj = periodos.find(per => String(per.id || per._id) === String(selectedPeriodo))
    const totalGastado = Number(resumen?.totalGastado || necesidades.reduce((acc, n) => acc + Number(n.monto || 0), 0))
    const totalAsignado = Number(resumen?.totalAsignado || 0)
    const disponible = Number(resumen?.disponible || Math.max(0, totalAsignado - totalGastado))
    const pct = Number(resumen?.porcentajeConsumido || (totalAsignado > 0 ? (totalGastado / totalAsignado) : 0))
    const mes = mapMes(periodoObj?.nombre)
    const duracion = durMes || diffDias(periodoObj?.fechaInicio, periodoObj?.fechaFin)
    return { totalGastado, totalAsignado, disponible, pct, cantidad: necesidades.length, mes, duracion }
  }, [resumen, necesidades, periodos, selectedPeriodo, durMes])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError('')
      setResult(null)
      try {
        const st = await getModeloStatus()
        const sdata = st?.data || st
        if (mounted) setStatus(sdata)
        const sc = await getModeloSchema()
        const scData = sc?.data || sc
        if (mounted) setSchema(scData)
        const init = {}
        for (const a of Array.isArray(scData?.attributes) ? scData.attributes : []) {
          if (a.isClass) continue
          if (a.isNumeric) init[a.name] = 0
          else if (Array.isArray(a.values) && a.values.length) init[a.name] = a.values[0]
          else init[a.name] = ''
        }
        if (mounted) setFeatures(init)
      } catch (e) {
        if (mounted) setError(String(e?.message || 'Error'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleChange = (name, value) => {
    setFeatures(prev => ({ ...prev, [name]: value }))
  }

  function mapMes(nombre) {
    if (!nombre) return ''
    const s = String(nombre).trim().toUpperCase()
    const meses = {
      'ENERO': 'ENERO', 'FEBRERO': 'FEBRERO', 'MARZO': 'MARZO', 'ABRIL': 'ABRIL',
      'MAYO': 'MAYO', 'JUNIO': 'JUNIO', 'JULIO': 'JULIO', 'AGOSTO': 'AGOSTO',
      'SEPTIEMBRE': 'SEPTIEMBRE', 'OCTUBRE': 'OCTUBRE', 'NOVIEMBRE': 'NOVIEMBRE', 'DICIEMBRE': 'DICIEMBRE'
    }
    const hit = Object.keys(meses).find(m => s.includes(m))
    return hit ? meses[hit] : s
  }

  function diffDias(iniStr, finStr) {
    try {
      const ini = new Date(iniStr)
      const fin = new Date(finStr)
      const ms = Math.abs(fin.getTime() - ini.getTime())
      return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
    } catch {
      return 30
    }
  }

  useEffect(() => {
    async function loadPeriodos() {
      let idEst = location.state?.idEstudiante || null
      try {
        const fromStorage = localStorage.getItem('idEstudiante')
        if (!idEst && fromStorage) idEst = String(fromStorage)
      } catch {}
      if (!idEst) return
      try {
        const periodosResp = await getData(`periodos/${idEst}/por-estudiante`)
        const pList = periodosResp?.data || periodosResp || []
        setPeriodos(Array.isArray(pList) ? pList : [])
      } catch (e) {
        setError(String(e?.message || 'Error cargando periodos'))
      }
    }
    loadPeriodos()
  }, [])

  useEffect(() => {
    async function loadContextForPeriodo() {
      let idEst = location.state?.idEstudiante || null
      try {
        const fromStorage = localStorage.getItem('idEstudiante')
        if (!idEst && fromStorage) idEst = String(fromStorage)
      } catch {}
      if (!idEst || !selectedPeriodo) return
      try {
        const r = await getData(`necesidades/resumen-presupuesto?idEstudiante=${idEst}&idPeriodo=${selectedPeriodo}`)
        setResumen(r?.data || r)
      } catch {}
      try {
        const n = await getData(`necesidades/por-estudiante-periodo?idEstudiante=${idEst}&idPeriodo=${selectedPeriodo}`)
        setNecesidades(Array.isArray(n?.data) ? n.data : (Array.isArray(n) ? n : []))
      } catch {}
    }
    loadContextForPeriodo()
  }, [selectedPeriodo])

  useEffect(() => {
    if (!schema || !selectedPeriodo) return
    const periodoObj = periodos.find(per => String(per.id || per._id) === String(selectedPeriodo))
    const totalGastado = Number(resumen?.totalGastado || necesidades.reduce((acc, n) => acc + Number(n.monto || 0), 0))
    const totalAsignado = Number(resumen?.totalAsignado || 0)
    const disponible = Number(resumen?.disponible || Math.max(0, totalAsignado - totalGastado))
    const pct = Number(resumen?.porcentajeConsumido || 0)
    const pctFrac = pct > 1 ? (pct / 100) : pct
    const auto = {}
    for (const a of attrs) {
      if (a.name === 'gastoNecesidadActual') auto[a.name] = totalGastado
      else if (a.name === 'valorAsignadoNecesidad') auto[a.name] = 0
      else if (a.name === 'excedenteActual') auto[a.name] = disponible
      else if (a.name === 'promedioUltimos3Periodos') auto[a.name] = prom3
      else if (a.name === 'tendenciaGasto') auto[a.name] = prom3 > 0 ? (totalGastado / prom3) : 0
      else if (a.name === 'presupuestoTotalPeriodo') auto[a.name] = totalAsignado
      else if (a.name === 'presupuestoRestantePeriodo') auto[a.name] = disponible
      else if (a.name === 'porcentajeGastoNecesidad') auto[a.name] = 0
      else if (a.name === 'porcentajeGastoTotal') auto[a.name] = totalAsignado > 0 ? (totalGastado / totalAsignado) : pctFrac
      else if (a.name === 'cantidadNecesidadesCreadas') auto[a.name] = necesidades.length
      else if (a.name === 'mes') auto[a.name] = mapMes(periodoObj?.nombre)
      else if (a.name === 'duracionPeriodo') auto[a.name] = durMes || diffDias(periodoObj?.fechaInicio, periodoObj?.fechaFin)
    }
    setFeatures(prev => ({ ...prev, ...auto }))
  }, [schema, attrs, selectedPeriodo, resumen, necesidades, prom3, durMes, periodos])


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    try {
      const enriched = { ...features, tendenciaGasto: prom3 > 0 ? (Number(features.gastoNecesidadActual || 0) / prom3) : 0, promedioUltimos3Periodos: prom3, duracionPeriodo: durMes }
      const res = await predictNecesidad(enriched)
      const data = res?.data || res
      setResult(data)
    } catch (e2) {
      setError(String(e2?.message || 'Error'))
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="rounded-lg p-6 text-white" style={{ background: 'linear-gradient(90deg, #1e3a8a, #0ea5e9, #10b981)' }}>
        <h1 className="text-2xl font-semibold">Predicción con modelo J48</h1>
        <p className="opacity-90">Selecciona un período, ajusta dos valores y obtén la predicción de qué necesidad podría exceder el presupuesto.</p>
      </div>
      <div className="mt-6 bg-white shadow rounded p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Periodo</label>
            <p className="text-xs text-gray-500 mb-2">Elige un período existente. Con esto se cargan automáticamente el gasto acumulado, el presupuesto total y las necesidades registradas.</p>
            <select className="border rounded px-3 py-2 w-full" value={selectedPeriodo} onChange={(e) => setSelectedPeriodo(e.target.value)}>
              <option value="">-- Seleccione periodo --</option>
              {periodos.map(per => (
                <option key={String(per.id || per._id)} value={String(per.id || per._id)}>{per.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Promedio últimos 3 periodos</label>
            <p className="text-xs text-gray-500 mb-2">Valor de referencia para estimar la tendencia. Puedes usar el promedio del gasto total de tus tres últimos períodos.</p>
            <input type="number" className="border rounded px-3 py-2 w-full" value={prom3} onChange={(e) => setProm3(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duración del mes</label>
            <p className="text-xs text-gray-500 mb-2">Cantidad de días del mes seleccionado. Si no estás seguro, deja el valor detectado o indica 30/31 según corresponda.</p>
            <input type="number" className="border rounded px-3 py-2 w-full" value={durMes} onChange={(e) => setDurMes(Number(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Total asignado</div>
            <div className="text-lg font-semibold">{resumenCalc.totalAsignado}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Total gastado</div>
            <div className="text-lg font-semibold">{resumenCalc.totalGastado}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Disponible</div>
            <div className="text-lg font-semibold">{resumenCalc.disponible}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Porcentaje consumido</div>
            <div className="text-lg font-semibold">{resumenCalc.pct}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Necesidades</div>
            <div className="text-lg font-semibold">{resumenCalc.cantidad}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">Mes</div>
            <div className="text-lg font-semibold">{resumenCalc.mes}</div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <button type="submit" className="px-4 py-2 rounded text-white" style={{ backgroundColor: '#1e3a8a' }} disabled={loading || !selectedPeriodo}>{loading ? 'Cargando...' : 'Predecir'}</button>
        </form>
      </div>
      {error && (
        <div className="mt-4 text-red-600">{error}</div>
      )}
      {result && (
        <div className="mt-6 bg-white shadow rounded p-6">
          <h2 className="text-lg font-semibold mb-2">Resultado</h2>
          <p className="text-gray-700 text-lg">{String(result?.resultado ?? '')}</p>
          <p className="text-xs text-gray-500 mt-1">Esta es la necesidad que el modelo estima que podría exceder el presupuesto según los datos del período seleccionado.</p>
          <div className="mt-2 text-sm text-gray-500">Clase: {className ?? ''}</div>
          <div className="mt-1 text-sm text-gray-500">Atributos: {attrs.length}</div>
          <div className="mt-1 text-sm text-gray-500">Estado: {status?.ready ? 'Listo' : 'No disponible'}</div>
        </div>
      )}
    </div>
  )
}