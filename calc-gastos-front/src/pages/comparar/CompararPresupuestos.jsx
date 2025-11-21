import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getData } from '../../api/api';
import { toast } from 'react-toastify';

const CompararPresupuestos = () => {
  const location = useLocation();

  // Utilidades de ID
  const normalizeId = (val) => {
    if (!val) return '';
    if (typeof val === 'string') {
      const s = val.trim();
      if (s === 'null' || s === 'undefined' || s === 'NaN') return '';
      const matchHex = s.match(/[a-fA-F0-9]{24}/);
      if (matchHex && matchHex[0]) return matchHex[0];
      const matchNum = s.match(/\d{1,}/);
      if (matchNum && matchNum[0]) return matchNum[0];
      return s;
    }
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      const raw = val.$oid ?? val.$id ?? val._id ?? val.oid ?? val.id ?? val.data?.idEstudiante ?? val.data?._id;
      return raw ? String(raw) : '';
    }
    return '';
  };
  const isValidId = (v) => typeof v === 'string' && (/^[a-fA-F0-9]{24}$/.test(v) || /^\d+$/.test(v));

  // Resolver idEstudiante (login primero)
  let idEstudiante = '';
  try {
    const v = localStorage.getItem('idEstudiante');
    const n = normalizeId(v);
    if (isValidId(n)) idEstudiante = n;
  } catch {}
  if (!isValidId(idEstudiante)) {
    const n = normalizeId(location.state?.idEstudiante ?? location.state?.idUsuario);
    if (isValidId(n)) idEstudiante = n;
  }

  // Estado general
  const [mode, setMode] = useState('presupuestos'); // 'presupuestos' | 'periodos'
  const [loading, setLoading] = useState(false);
  const [presupuestos, setPresupuestos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [selA, setSelA] = useState('');
  const [selB, setSelB] = useState('');
  const [summaryA, setSummaryA] = useState(null);
  const [summaryB, setSummaryB] = useState(null);
  const [needsA, setNeedsA] = useState([]);
  const [needsB, setNeedsB] = useState([]);

  // Interactividad: controles de diferencias y gráfico
  const [sortKey, setSortKey] = useState('diff'); // 'diff' | 'categoria' | 'a' | 'b'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [onlyDiffs, setOnlyDiffs] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('monto'); // 'monto' | 'porcentaje'
  const [highlightCat, setHighlightCat] = useState('');

  // Cargar listas base
  useEffect(() => {
    if (!isValidId(idEstudiante)) {
      toast.error('ID de estudiante inválido. Inicia sesión nuevamente.');
      return;
    }
    const cargar = async () => {
      try {
        setLoading(true);
        // Presupuestos del estudiante
        try {
          const pData = await getData(`presupuestos/estudiante/${idEstudiante}`);
          const arr = Array.isArray(pData?.data) ? pData.data : (Array.isArray(pData) ? pData : []);
          setPresupuestos(arr);
        } catch (e) {
          const msg = String(e?.message || '');
          if (msg.includes('404')) setPresupuestos([]); else console.error(e);
        }
        // Periodos del estudiante
        try {
          const perData = await getData(`periodos/${idEstudiante}/por-estudiante`);
          const arr = Array.isArray(perData?.data) ? perData.data : (Array.isArray(perData) ? perData : []);
          setPeriodos(arr);
        } catch (e) {
          const msg = String(e?.message || '');
          if (msg.includes('404')) setPeriodos([]); else console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [idEstudiante]);

  // Helpers de carga por selección
  const cargarPorPresupuesto = async (id, setterNeeds, setterSummary) => {
    if (!id) return;
    try {
      // Necesidades por presupuesto
      const nData = await getData(`necesidades/por-presupuesto?idPresupuesto=${id}`);
      const needs = Array.isArray(nData?.data) ? nData.data : (Array.isArray(nData) ? nData : []);
      setterNeeds(needs);
      // Obtener periodo del presupuesto para resumen
      const pData = await getData(`presupuestos/${id}`);
      const p = pData?.data || pData || {};
      const idPeriodo = p?.idPeriodo;
      if (idPeriodo) {
        try {
          const sData = await getData(`necesidades/resumen-presupuesto?idEstudiante=${idEstudiante}&idPeriodo=${idPeriodo}`);
          setterSummary(sData?.data || sData || null);
        } catch (e) {
          setterSummary(null);
        }
      } else {
        setterSummary(null);
      }
    } catch (e) {
      console.error('Error al cargar por presupuesto', e);
      toast.error('No se pudo cargar datos del presupuesto seleccionado');
    }
  };

  const cargarPorPeriodo = async (idPeriodo, setterNeeds, setterSummary) => {
    if (!idPeriodo) return;
    try {
      // Necesidades por estudiante y periodo
      const nData = await getData(`necesidades/por-estudiante-periodo?idEstudiante=${idEstudiante}&idPeriodo=${idPeriodo}`);
      const needs = Array.isArray(nData?.data) ? nData.data : (Array.isArray(nData) ? nData : []);
      setterNeeds(needs);
      // Resumen del presupuesto para el periodo (si existe)
      try {
        const sData = await getData(`necesidades/resumen-presupuesto?idEstudiante=${idEstudiante}&idPeriodo=${idPeriodo}`);
        setterSummary(sData?.data || sData || null);
      } catch (e) {
        setterSummary(null);
      }
    } catch (e) {
      console.error('Error al cargar por periodo', e);
      toast.error('No se pudo cargar datos del periodo seleccionado');
    }
  };

  // Efectos por cambio de selección
  useEffect(() => {
    if (mode === 'presupuestos') cargarPorPresupuesto(selA, setNeedsA, setSummaryA);
    else cargarPorPeriodo(selA, setNeedsA, setSummaryA);
  }, [mode, selA]);
  useEffect(() => {
    if (mode === 'presupuestos') cargarPorPresupuesto(selB, setNeedsB, setSummaryB);
    else cargarPorPeriodo(selB, setNeedsB, setSummaryB);
  }, [mode, selB]);

  // Cálculo de diferencias por categoría
  const totalA = useMemo(() => (needsA || []).reduce((acc, n) => acc + (parseFloat(n.monto) || 0), 0), [needsA]);
  const totalB = useMemo(() => (needsB || []).reduce((acc, n) => acc + (parseFloat(n.monto) || 0), 0), [needsB]);

  const diffByCategoria = useMemo(() => {
    const sumBy = (list) => {
      const map = new Map();
      for (const n of list || []) {
        const key = n.descripcion || n.nombre || 'Sin categoría';
        const monto = parseFloat(n.monto || 0);
        map.set(key, (map.get(key) || 0) + (isNaN(monto) ? 0 : monto));
      }
      return map;
    };
    const a = sumBy(needsA);
    const b = sumBy(needsB);
    const categorias = new Set([...a.keys(), ...b.keys()]);
    let rows = [];
    for (const c of categorias) {
      const va = a.get(c) || 0;
      const vb = b.get(c) || 0;
      const ra = viewMode === 'porcentaje' ? (totalA ? (va / totalA) * 100 : 0) : va;
      const rb = viewMode === 'porcentaje' ? (totalB ? (vb / totalB) * 100 : 0) : vb;
      rows.push({ categoria: c, a: ra, b: rb, diff: rb - ra, rawA: va, rawB: vb });
    }
    // Filtro por búsqueda
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      rows = rows.filter(r => r.categoria.toLowerCase().includes(s));
    }
    // Filtro de solo diferencias
    if (onlyDiffs) rows = rows.filter(r => Math.round(r.diff) !== 0);
    // Ordenamiento
    rows.sort((x, y) => {
      const getVal = (r) => (sortKey === 'diff' ? Math.abs(r.diff) : r[sortKey]);
      const vx = getVal(x);
      const vy = getVal(y);
      if (vx < vy) return sortDir === 'asc' ? -1 : 1;
      if (vx > vy) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [needsA, needsB, viewMode, totalA, totalB, search, onlyDiffs, sortKey, sortDir]);

  const topForChart = useMemo(() => diffByCategoria.slice(0, 12), [diffByCategoria]);

  const downloadCSV = () => {
    const headers = ['Categoria', viewMode==='porcentaje'?'A(%)':'A', viewMode==='porcentaje'?'B(%)':'B', viewMode==='porcentaje'?'Delta(%)':'Delta'];
    const lines = [headers.join(',')];
    diffByCategoria.forEach(r => {
      lines.push([`"${r.categoria.replace(/"/g,'"')}"`, r.a, r.b, r.diff].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comparacion_${viewMode}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Validación de comparación
  const canCompare = Boolean(selA) && Boolean(selB);
  const doCompare = () => {
    if (!canCompare) {
      toast.warning('Selecciona dos elementos para comparar');
      return;
    }
    // No hay acción extra: la comparación se refleja en la UI automáticamente
  };

  return (
    <div className="container mt-4">
      {/* Encabezado con gradiente azul/verde */}
      <div
        className="rounded p-4 mb-4 shadow-sm"
        style={{
          background: 'linear-gradient(90deg, #0d6efd 0%, #198754 100%)',
          color: '#fff'
        }}
      >
        <h2 className="mb-1">Comparar Presupuestos</h2>
        <p className="mb-0" style={{ opacity: 0.9 }}>
          Compara dos presupuestos o periodos del mismo estudiante y visualiza sus diferencias.
        </p>
      </div>

      {/* Selector de modo */}
      <div className="mb-3 d-flex justify-content-center">
        <div className="btn-group" role="group" aria-label="Modo de comparación">
          <button
            className={`btn ${mode==='presupuestos' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={()=>setMode('presupuestos')}
          >
            Presupuestos
          </button>
          <button
            className={`btn ${mode==='periodos' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={()=>setMode('periodos')}
          >
            Periodos
          </button>
        </div>
      </div>

      {/* Tarjeta de selección A/B */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label fw-semibold text-primary">Seleccionar {mode==='presupuestos'?'presupuesto':'periodo'} A</label>
              <select className="form-select" value={selA} onChange={(e)=>setSelA(e.target.value)} aria-label="Seleccionar A">
                <option value="">-- Seleccionar --</option>
                {mode==='presupuestos' ? (
                  presupuestos.map(p=> (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.descripcion} - ${p.monto}</option>
                  ))
                ) : (
                  periodos.map(p=> (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.nombre}</option>
                  ))
                )}
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label fw-semibold text-success">Seleccionar {mode==='presupuestos'?'presupuesto':'periodo'} B</label>
              <select className="form-select" value={selB} onChange={(e)=>setSelB(e.target.value)} aria-label="Seleccionar B">
                <option value="">-- Seleccionar --</option>
                {mode==='presupuestos' ? (
                  presupuestos.map(p=> (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.descripcion} - ${p.monto}</option>
                  ))
                ) : (
                  periodos.map(p=> (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.nombre}</option>
                  ))
                )}
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-success w-100"
                onClick={doCompare}
                disabled={!canCompare || loading}
                aria-disabled={!canCompare || loading}
              >
                Comparar
              </button>
              {!canCompare && <small className="text-muted">Selecciona dos para comparar</small>}
            </div>
          </div>
        </div>
      </div>

      {/* Resúmenes lado A/B */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-primary text-white fw-semibold">Resumen A</div>
            <div className="card-body">
              {summaryA ? (
                <>
                  <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Total asignado</span>
                      <span className="fw-bold text-primary">${summaryA.totalAsignado}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Gastado</span>
                      <span className="fw-bold text-success">${summaryA.totalGastado}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Disponible</span>
                      <span className="fw-bold">${summaryA.disponible}</span>
                    </li>
                  </ul>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">% consumido</small>
                      <small className="fw-semibold">{summaryA.porcentajeConsumido}%</small>
                    </div>
                    <div className="progress" role="progressbar" aria-valuenow={summaryA.porcentajeConsumido} aria-valuemin="0" aria-valuemax="100">
                      <div className="progress-bar bg-success" style={{ width: `${Math.min(Number(summaryA.porcentajeConsumido)||0, 100)}%` }}></div>
                    </div>
                  </div>
                  <h6 className="mt-3">Necesidades</h6>
                  {needsA && needsA.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {needsA.map((n,i)=> (
                        <li key={i} className="list-group-item d-flex justify-content-between">
                          <span>{n.descripcion}</span>
                          <span className="badge bg-primary">${Number(n.monto||0).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (<p className="text-muted mb-0">No hay necesidades</p>)}
                </>
              ) : (<p className="text-muted mb-0">Sin resumen disponible</p>)}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-success text-white fw-semibold">Resumen B</div>
            <div className="card-body">
              {summaryB ? (
                <>
                  <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Total asignado</span>
                      <span className="fw-bold text-primary">${summaryB.totalAsignado}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Gastado</span>
                      <span className="fw-bold text-success">${summaryB.totalGastado}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Disponible</span>
                      <span className="fw-bold">${summaryB.disponible}</span>
                    </li>
                  </ul>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">% consumido</small>
                      <small className="fw-semibold">{summaryB.porcentajeConsumido}%</small>
                    </div>
                    <div className="progress" role="progressbar" aria-valuenow={summaryB.porcentajeConsumido} aria-valuemin="0" aria-valuemax="100">
                      <div className="progress-bar bg-primary" style={{ width: `${Math.min(Number(summaryB.porcentajeConsumido)||0, 100)}%` }}></div>
                    </div>
                  </div>
                  <h6 className="mt-3">Necesidades</h6>
                  {needsB && needsB.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {needsB.map((n,i)=> (
                        <li key={i} className="list-group-item d-flex justify-content-between">
                          <span>{n.descripcion}</span>
                          <span className="badge bg-success">${Number(n.monto||0).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (<p className="text-muted mb-0">No hay necesidades</p>)}
                </>
              ) : (<p className="text-muted mb-0">Sin resumen disponible</p>)}
            </div>
          </div>
        </div>
      </div>

      {/* Controles de diferencias */}
      <div className="card border-0 shadow-sm mt-4 mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Ordenar por</label>
              <select className="form-select" value={sortKey} onChange={e=>setSortKey(e.target.value)}>
                <option value="diff">Diferencia</option>
                <option value="categoria">Categoría</option>
                <option value="a">A</option>
                <option value="b">B</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Dirección</label>
              <select className="form-select" value={sortDir} onChange={e=>setSortDir(e.target.value)}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Buscar categoría</label>
              <input className="form-control" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ej: Alimentación" />
            </div>
            <div className="col-md-2 form-check mt-4">
              <input id="onlyDiffs" type="checkbox" className="form-check-input" checked={onlyDiffs} onChange={e=>setOnlyDiffs(e.target.checked)} />
              <label htmlFor="onlyDiffs" className="form-check-label">Solo diferencias</label>
            </div>
            <div className="col-md-2">
              <label className="form-label">Ver</label>
              <select className="form-select" value={viewMode} onChange={e=>setViewMode(e.target.value)}>
                <option value="monto">Montos</option>
                <option value="porcentaje">Porcentajes</option>
              </select>
            </div>
          </div>
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-outline-primary me-2" onClick={()=>setHighlightCat('')}>Quitar resaltado</button>
            <button className="btn btn-outline-success" onClick={downloadCSV}>Exportar CSV</button>
          </div>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-header bg-light">Top categorías</div>
        <div className="card-body">
          {canCompare ? (
            topForChart.length ? (
              <div className="d-flex flex-column gap-3">
                {topForChart.map((r,i)=> {
                  const maxVal = Math.max(r.a, r.b, 1);
                  const wA = Math.round((r.a / maxVal) * 100);
                  const wB = Math.round((r.b / maxVal) * 100);
                  const isHL = highlightCat === r.categoria;
                  return (
                    <div key={i}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className={`fw-semibold ${isHL? 'text-primary' : ''}`}>{r.categoria}</span>
                        <small className="text-muted">{viewMode==='porcentaje' ? `${r.a.toFixed(1)}% vs ${r.b.toFixed(1)}%` : `$${Number(r.a).toLocaleString()} vs $${Number(r.b).toLocaleString()}`}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2" title={`A/B en ${r.categoria}`}
                        role="group" aria-label={`Barras comparativas para ${r.categoria}`}
                        onMouseEnter={()=>setHighlightCat(r.categoria)} onMouseLeave={()=>setHighlightCat('')}
                      >
                        <div className="flex-grow-1">
                          <div className="bg-primary" style={{ height: 10, width: `${wA}%`, transition: 'width .3s ease', borderRadius: 4 }}></div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="bg-success" style={{ height: 10, width: `${wB}%`, transition: 'width .3s ease', borderRadius: 4 }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (<p className="text-muted mb-0">No hay datos para graficar</p>)
          ) : (
            <p className="text-muted mb-0">Selecciona dos elementos para visualizar el gráfico.</p>
          )}
        </div>
      </div>

      {/* Tabla de diferencias */}
      <div className="mt-4">
        <h5 className="mb-3">Diferencias por categoría</h5>
        {canCompare ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Categoría</th>
                    <th>A</th>
                    <th>B</th>
                    <th>Δ (B - A)</th>
                  </tr>
                </thead>
                <tbody>
                  {diffByCategoria.length > 0 ? diffByCategoria.map((r,i)=> (
                    <tr key={i} onClick={()=>setHighlightCat(r.categoria)} style={{ cursor: 'pointer', backgroundColor: highlightCat===r.categoria? 'rgba(13,110,253,.08)' : 'transparent' }}>
                      <td>{r.categoria}</td>
                      <td>{viewMode==='porcentaje' ? `${(r.a).toFixed(1)}%` : `$${Number(r.a).toLocaleString()}`}</td>
                      <td>{viewMode==='porcentaje' ? `${(r.b).toFixed(1)}%` : `$${Number(r.b).toLocaleString()}`}</td>
                      <td className={r.diff>0? 'text-success' : r.diff<0? 'text-primary':'text-muted'}>
                        {viewMode==='porcentaje' ? `${(r.diff).toFixed(1)}%` : `$${Number(r.diff).toLocaleString()}`}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="text-muted">No hay datos para comparar</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-muted">Selecciona dos elementos para ver las diferencias.</p>
        )}
      </div>
    </div>
  );
};

export default CompararPresupuestos;