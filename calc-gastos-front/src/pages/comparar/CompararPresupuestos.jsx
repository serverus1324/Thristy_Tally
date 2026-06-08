import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getData } from '../../api/api';
import { toast } from 'react-toastify';
import Navbar from '../../components/navbar/Navbar';
import '../necesidad-presupuesto/necesidadPresupuesto.css';
import './compararPresupuestos.css';

const CompararPresupuestos = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
      const raw =
        val.$oid ??
        val.$id ??
        val._id ??
        val.oid ??
        val.id ??
        val.data?.idPerfil ??
        val.data?._id;
      return raw ? String(raw) : '';
    }
    return '';
  };

  const isValidId = (v) =>
    typeof v === 'string' &&
    (/^[a-fA-F0-9]{24}$/.test(v) || /^\d+$/.test(v));

  let idPerfil = '';
  try {
    const v = localStorage.getItem('idPerfil');
    const n = normalizeId(v);
    if (isValidId(n)) idPerfil = n;
  } catch {}
  if (!isValidId(idPerfil)) {
    const n = normalizeId(
      location.state?.idPerfil ?? location.state?.idUsuario
    );
    if (isValidId(n)) idPerfil = n;
  }

  // Estado general
  const [mode, setMode] = useState('presupuestos'); 
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
  const [sortKey, setSortKey] = useState('diff'); 
  const [sortDir, setSortDir] = useState('desc');
  const [onlyDiffs, setOnlyDiffs] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('monto'); 
  const [highlightCat, setHighlightCat] = useState('');

  // Cargar listas base
  useEffect(() => {
    if (!isValidId(idPerfil)) {
      toast.error('ID de estudiante inválido. Inicia sesión nuevamente.');
      return;
    }
    const cargar = async () => {
      try {
        setLoading(true);
        // Presupuestos del estudiante
        try {
          const pData = await getData(
            `presupuestos/estudiante/${idPerfil}`
          );
          const arr = Array.isArray(pData?.data)
            ? pData.data
            : Array.isArray(pData)
            ? pData
            : [];
          setPresupuestos(arr);
        } catch (e) {
          const msg = String(e?.message || '');
          if (msg.includes('404')) setPresupuestos([]);
          else console.error(e);
        }
        // Períodos del estudiante
        try {
          const perData = await getData(
            `periodos/${idPerfil}/por-estudiante`
          );
          const arr = Array.isArray(perData?.data)
            ? perData.data
            : Array.isArray(perData)
            ? perData
            : [];
          setPeriodos(arr);
        } catch (e) {
          const msg = String(e?.message || '');
          if (msg.includes('404')) setPeriodos([]);
          else console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [idPerfil]);

  const cargarPorPresupuesto = async (id, setterNeeds, setterSummary) => {
    if (!id) return;
    try {
      // Necesidades por presupuesto
      const nData = await getData(
        `necesidades/por-presupuesto?idPresupuesto=${id}`
      );
      const needs = Array.isArray(nData?.data)
        ? nData.data
        : Array.isArray(nData)
        ? nData
        : [];
      setterNeeds(needs);
      // Obtener periodo del presupuesto para resumen
      const pData = await getData(`presupuestos/${id}`);
      const p = pData?.data || pData || {};
      const idPeriodo = p?.idPeriodo;
      if (idPeriodo) {
        try {
          const sData = await getData(
            `necesidades/resumen-presupuesto?idPerfil=${idPerfil}&idPeriodo=${idPeriodo}`
          );
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
      const nData = await getData(
        `necesidades/por-estudiante-periodo?idPerfil=${idPerfil}&idPeriodo=${idPeriodo}`
      );
      const needs = Array.isArray(nData?.data)
        ? nData.data
        : Array.isArray(nData)
        ? nData
        : [];
      setterNeeds(needs);
      // Resumen del presupuesto para el periodo
      try {
        const sData = await getData(
          `necesidades/resumen-presupuesto?idPerfil=${idPerfil}&idPeriodo=${idPeriodo}`
        );
        setterSummary(sData?.data || sData || null);
      } catch (e) {
        setterSummary(null);
      }
    } catch (e) {
      console.error('Error al cargar por periodo', e);
      toast.error('No se pudo cargar datos del período seleccionado');
    }
  };

  // Efectos por cambio de selección
  useEffect(() => {
    if (mode === 'presupuestos')
      cargarPorPresupuesto(selA, setNeedsA, setSummaryA);
    else cargarPorPeriodo(selA, setNeedsA, setSummaryA);
  }, [mode, selA]);

  useEffect(() => {
    if (mode === 'presupuestos')
      cargarPorPresupuesto(selB, setNeedsB, setSummaryB);
    else cargarPorPeriodo(selB, setNeedsB, setSummaryB);
  }, [mode, selB]);

  // Cálculo de totales y diferencias por categoría
  const totalA = useMemo(
    () =>
      (needsA || []).reduce(
        (acc, n) => acc + (parseFloat(n.monto) || 0),
        0
      ),
    [needsA]
  );

  const totalB = useMemo(
    () =>
      (needsB || []).reduce(
        (acc, n) => acc + (parseFloat(n.monto) || 0),
        0
      ),
    [needsB]
  );

  const diffByCategoria = useMemo(() => {
    const sumBy = (list) => {
      const map = new Map();
      for (const n of list || []) {
        const key = n.descripcion || n.nombre || 'Sin categoría';
        const monto = parseFloat(n.monto || 0);
        map.set(
          key,
          (map.get(key) || 0) + (isNaN(monto) ? 0 : monto)
        );
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
      const ra =
        viewMode === 'porcentaje'
          ? totalA
            ? (va / totalA) * 100
            : 0
          : va;
      const rb =
        viewMode === 'porcentaje'
          ? totalB
            ? (vb / totalB) * 100
            : 0
          : vb;
      rows.push({
        categoria: c,
        a: ra,
        b: rb,
        diff: rb - ra,
        rawA: va,
        rawB: vb,
      });
    }

    // Filtro por búsqueda
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      rows = rows.filter((r) =>
        r.categoria.toLowerCase().includes(s)
      );
    }

    // Filtro de solo diferencias
    if (onlyDiffs)
      rows = rows.filter((r) => Math.round(r.diff) !== 0);

    // Ordenamiento
    rows.sort((x, y) => {
      const getVal = (r) =>
        sortKey === 'diff' ? Math.abs(r.diff) : r[sortKey];
      const vx = getVal(x);
      const vy = getVal(y);
      if (vx < vy) return sortDir === 'asc' ? -1 : 1;
      if (vx > vy) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return rows;
  }, [
    needsA,
    needsB,
    viewMode,
    totalA,
    totalB,
    search,
    onlyDiffs,
    sortKey,
    sortDir,
  ]);

  const topForChart = useMemo(
    () => diffByCategoria.slice(0, 12),
    [diffByCategoria]
  );

  const downloadCSV = () => {
    const headers = [
      'Categoria',
      viewMode === 'porcentaje' ? 'A(%)' : 'A',
      viewMode === 'porcentaje' ? 'B(%)' : 'B',
      viewMode === 'porcentaje' ? 'Delta(%)' : 'Delta',
    ];
    const lines = [headers.join(',')];
    diffByCategoria.forEach((r) => {
      lines.push(
        [
          `"${r.categoria.replace(/"/g, '"')}"`,
          r.a,
          r.b,
          r.diff,
        ].join(',')
      );
    });
    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
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
    }
  };

  /* === acciones para el Navbar universal === */
  const handleGoHome = () => {
    if (idPerfil) {
      navigate('/home', { state: { idPerfil } });
    } else {
      navigate('/home');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
    } catch {}
    navigate('/login');
  };

  const handleEditProfile = () => {
    if (idPerfil) {
      navigate('/editar-datos', { state: { idPerfil } });
    }
  };

  return (
    <>
      <Navbar
        userName={location.state?.userName}
        onHome={handleGoHome}
        onLogout={handleLogout}
        onEditProfile={handleEditProfile}
      />

      <main className="tt-compare-hero">
        <div className="tt-compare-stage">
          {/* Encabezado principal */}
          <header className="tt-compare-header">
            <div>
              <span className="tt-chip">ANÁLISIS</span>
              <h1 className="tt-wizard-title">
                Comparar Presupuestos
              </h1>
              <p className="tt-wizard-subtitle">
                Compare dos presupuestos o períodos del mismo estudiante y observe sus diferencias por categoría.
              </p>
            </div>

            <div className="tt-pill-toggle" role="tablist">
              <button
                type="button"
                className={`tt-pill-option ${mode === 'presupuestos' ? 'active' : ''}`}
                onClick={() => setMode('presupuestos')}
              >
                Presupuestos
              </button>
              <button
                type="button"
                className={`tt-pill-option ${mode === 'periodos' ? 'active' : ''}`}
                onClick={() => setMode('periodos')}
              >
                Períodos
              </button>
            </div>
          </header>

          {/* Loader */}
          {loading && (
            <div className="tt-loading">
              <div className="spinner-border" role="status" />
              <span>Cargando datos...</span>
            </div>
          )}

          {/* Selección A / B */}
          <section className="tt-card-glass tt-selector-card">
            <div className="tt-selector-row">
              <div className="tt-selector-field">
                <label className="tt-label">
                  {mode === 'presupuestos' ? 'Presupuesto' : 'Período'} A
                </label>
                <select
                  className="tt-select"
                  value={selA}
                  onChange={(e) => setSelA(e.target.value)}
                >
                  <option value="">-- Seleccionar --</option>
                  {mode === 'presupuestos'
                    ? presupuestos.map((p) => (
                        <option key={p.id || p._id} value={p.id || p._id}>
                          {p.descripcion} - ${Number(p.monto || 0).toLocaleString()}
                        </option>
                      ))
                    : periodos.map((p) => (
                        <option key={p.id || p._id} value={p.id || p._id}>
                          {p.nombre}
                        </option>
                      ))}
                </select>
              </div>

              <div className="tt-selector-field">
                <label className="tt-label">
                  {mode === 'presupuestos' ? 'Presupuesto' : 'Período'} B
                </label>
                <select
                  className="tt-select"
                  value={selB}
                  onChange={(e) => setSelB(e.target.value)}
                >
                  <option value="">-- Seleccionar --</option>
                  {mode === 'presupuestos'
                    ? presupuestos.map((p) => (
                        <option key={p.id || p._id} value={p.id || p._id}>
                          {p.descripcion} - ${Number(p.monto || 0).toLocaleString()}
                        </option>
                      ))
                    : periodos.map((p) => (
                        <option key={p.id || p._id} value={p.id || p._id}>
                          {p.nombre}
                        </option>
                      ))}
                </select>
              </div>

              <div className="tt-selector-action">
                <button
                  className="tt-btn-primary-gradient"
                  onClick={doCompare}
                  disabled={!canCompare || loading}
                >
                  {loading ? 'Cargando…' : 'Comparar'}
                </button>
              </div>
            </div>
          </section>

          {/* Empty State or Results */}
          {!canCompare ? (
            <section className="tt-empty-state-card">
              <div className="tt-empty-state-icon">
                🔍
              </div>
              <h3 className="tt-empty-state-title">Selecciona dos elementos para comenzar la comparación</h3>
              <p className="tt-empty-state-subtitle">
                Elige dos presupuestos o períodos para ver un análisis detallado de sus diferencias por categoría.
              </p>
            </section>
          ) : (
            <>
              {/* Resúmenes A / B */}
              <section className="tt-grid-2 tt-compare-summaries">
                {/* Resumen A */}
                <div className="tt-card-glass tt-summary-card">
                  <div className="tt-summary-header tt-summary-header-a">
                    <span>Resumen A</span>
                  </div>
                  <div className="tt-summary-body">
                    {summaryA ? (
                      <>
                        <ul className="tt-summary-list">
                          <li>
                            <span>Total asignado</span>
                            <span className="tt-summary-number primary">
                              ${Number(summaryA.totalAsignado || 0).toLocaleString()}
                            </span>
                          </li>
                          <li>
                            <span>Gastado</span>
                            <span className="tt-summary-number success">
                              ${Number(summaryA.totalGastado || 0).toLocaleString()}
                            </span>
                          </li>
                          <li>
                            <span>Disponible</span>
                            <span className="tt-summary-number">
                              ${Number(summaryA.disponible || 0).toLocaleString()}
                            </span>
                          </li>
                        </ul>

                        <div className="tt-summary-progress">
                          <div className="tt-summary-progress-meta">
                            <small>% consumido</small>
                            <small>{summaryA.porcentajeConsumido}%</small>
                          </div>
                          <div className="tt-summary-progress-bar">
                            <div
                              className="fill"
                              style={{
                                width: `${Math.min(
                                  Number(summaryA.porcentajeConsumido) || 0,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <h6 className="tt-summary-subtitle">Necesidades</h6>
                        {needsA && needsA.length > 0 ? (
                          <ul className="tt-summary-needs">
                            {needsA.map((n, i) => (
                              <li key={i}>
                                <span>{n.descripcion}</span>
                                <span className="badge bg-primary">
                                  ${Number(n.monto || 0).toLocaleString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="tt-muted">No hay necesidades registradas.</p>
                        )}
                      </>
                    ) : (
                      <p className="tt-muted">Sin resumen disponible.</p>
                    )}
                  </div>
                </div>

                {/* Resumen B */}
                <div className="tt-card-glass tt-summary-card">
                  <div className="tt-summary-header tt-summary-header-b">
                    <span>Resumen B</span>
                  </div>
                  <div className="tt-summary-body">
                    {summaryB ? (
                      <>
                        <ul className="tt-summary-list">
                          <li>
                            <span>Total asignado</span>
                            <span className="tt-summary-number primary">
                              ${Number(summaryB.totalAsignado || 0).toLocaleString()}
                            </span>
                          </li>
                          <li>
                            <span>Gastado</span>
                            <span className="tt-summary-number success">
                              ${Number(summaryB.totalGastado || 0).toLocaleString()}
                            </span>
                          </li>
                          <li>
                            <span>Disponible</span>
                            <span className="tt-summary-number">
                              ${Number(summaryB.disponible || 0).toLocaleString()}
                            </span>
                          </li>
                        </ul>

                        <div className="tt-summary-progress">
                          <div className="tt-summary-progress-meta">
                            <small>% consumido</small>
                            <small>{summaryB.porcentajeConsumido}%</small>
                          </div>
                          <div className="tt-summary-progress-bar">
                            <div
                              className="fill alt"
                              style={{
                                width: `${Math.min(
                                  Number(summaryB.porcentajeConsumido) || 0,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <h6 className="tt-summary-subtitle">Necesidades</h6>
                        {needsB && needsB.length > 0 ? (
                          <ul className="tt-summary-needs">
                            {needsB.map((n, i) => (
                              <li key={i}>
                                <span>{n.descripcion}</span>
                                <span className="badge bg-success">
                                  ${Number(n.monto || 0).toLocaleString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="tt-muted">No hay necesidades registradas.</p>
                        )}
                      </>
                    ) : (
                      <p className="tt-muted">Sin resumen disponible.</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Controles de diferencias */}
              <section className="tt-card-glass tt-compare-controls">
                <div className="tt-grid-4 tt-compare-controls-grid">
                  <div className="tt-field">
                    <label className="tt-label">Ordenar por</label>
                    <select
                      className="tt-select"
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value)}
                    >
                      <option value="diff">Diferencia</option>
                      <option value="categoria">Categoría</option>
                      <option value="a">A</option>
                      <option value="b">B</option>
                    </select>
                  </div>

                  <div className="tt-field">
                    <label className="tt-label">Dirección</label>
                    <select
                      className="tt-select"
                      value={sortDir}
                      onChange={(e) => setSortDir(e.target.value)}
                    >
                      <option value="desc">Desc</option>
                      <option value="asc">Asc</option>
                    </select>
                  </div>

                  <div className="tt-field">
                    <label className="tt-label">Buscar categoría</label>
                    <input
                      className="tt-input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Ej: Alimentación"
                    />
                  </div>

                  <div className="tt-compare-filters">
                    <label className="tt-checkbox">
                      <input
                        type="checkbox"
                        checked={onlyDiffs}
                        onChange={(e) => setOnlyDiffs(e.target.checked)}
                      />
                      <span>Solo diferencias</span>
                    </label>

                    <div className="tt-field">
                      <label className="tt-label">Ver</label>
                      <select
                        className="tt-select"
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                      >
                        <option value="monto">Montos</option>
                        <option value="porcentaje">Porcentajes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="tt-compare-secondary-actions">
                  <button
                    className="tt-btn-soft"
                    onClick={() => setHighlightCat('')}
                  >
                    Quitar resaltado
                  </button>
                  <button
                    className="tt-btn-secondary"
                    onClick={downloadCSV}
                  >
                    Exportar CSV
                  </button>
                </div>
              </section>

              {/* Gráfico de barras simplificado */}
              <section className="tt-card-glass">
                <h3 className="tt-card-h3">Top categorías</h3>
                {canCompare ? (
                  topForChart.length ? (
                    <div className="tt-compare-chart">
                      {topForChart.map((r, i) => {
                        const maxVal = Math.max(r.a, r.b, 1);
                        const wA = Math.round((r.a / maxVal) * 100);
                        const wB = Math.round((r.b / maxVal) * 100);
                        const isHL = highlightCat === r.categoria;
                        return (
                          <div
                            key={i}
                            className="tt-compare-chart-row"
                            onMouseEnter={() => setHighlightCat(r.categoria)}
                            onMouseLeave={() => setHighlightCat('')}
                          >
                            <div className="tt-compare-chart-header">
                              <span className={isHL ? 'text-primary' : ''}>
                                {r.categoria}
                              </span>
                              <small className="tt-muted">
                                {viewMode === 'porcentaje'
                                  ? `${r.a.toFixed(1)}% vs ${r.b.toFixed(1)}%`
                                  : `$${Number(r.a).toLocaleString()} vs $${Number(
                                      r.b
                                    ).toLocaleString()}`}
                              </small>
                            </div>
                            <div className="tt-compare-chart-bars">
                              <div className="bar bar-a">
                                <div style={{ width: `${wA}%` }} />
                              </div>
                              <div className="bar bar-b">
                                <div style={{ width: `${wB}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="tt-muted">No hay datos para graficar.</p>
                  )
                ) : (
                  <p className="tt-muted">
                    Seleccione dos elementos para visualizar el gráfico.
                  </p>
                )}
              </section>

              {/* Tabla de diferencias */}
              <section className="tt-card-glass">
                <h3 className="tt-card-h3">Diferencias por categoría</h3>
                {canCompare ? (
                  diffByCategoria.length ? (
                    <div className="tt-table-wrapper">
                      <table className="tt-table">
                        <thead>
                          <tr>
                            <th>Categoría</th>
                            <th>A</th>
                            <th>B</th>
                            <th>Δ (B - A)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diffByCategoria.map((r, i) => (
                            <tr
                              key={i}
                              onClick={() => setHighlightCat(r.categoria)}
                              className={
                                highlightCat === r.categoria ? 'is-highlight' : ''
                              }
                            >
                              <td>{r.categoria}</td>
                              <td>
                                {viewMode === 'porcentaje'
                                  ? `${r.a.toFixed(1)}%`
                                  : `$${Number(r.a).toLocaleString()}`}
                              </td>
                              <td>
                                {viewMode === 'porcentaje'
                                  ? `${r.b.toFixed(1)}%`
                                  : `$${Number(r.b).toLocaleString()}`}
                              </td>
                              <td
                                className={
                                  r.diff > 0
                                    ? 'text-success'
                                    : r.diff < 0
                                    ? 'text-primary'
                                    : 'tt-muted'
                                }
                              >
                                {viewMode === 'porcentaje'
                                  ? `${r.diff.toFixed(1)}%`
                                  : `$${Number(r.diff).toLocaleString()}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="tt-muted">No hay datos para comparar.</p>
                  )
                ) : (
                  <p className="tt-muted">
                    Seleccione dos elementos para ver las diferencias.
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default CompararPresupuestos;
