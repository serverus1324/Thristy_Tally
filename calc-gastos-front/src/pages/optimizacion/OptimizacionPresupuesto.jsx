import { useCallback, useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import Navbar from '../../components/navbar/Navbar';
import { getData, postData } from '../../api/api';
import { toast } from 'react-toastify';
import './optimizacionPresupuesto.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const getId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value.$oid ?? value.id ?? value._id ?? '';
  return String(value);
};

const formatoMoneda = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const categoriasPredeterminadas = new Set([
  'ALIMENTACION',
  'ALOJAMIENTO',
  'MATRICULA',
  'TRANSPORTE',
  'UTILES',
  'IMPREVISTOS',
  'INESPERADOS',
  'OTROS',
]);

const tipoNecesidad = (value, descripcion) => {
  if (value === 1 || value === '1') return 'predeterminada';
  if (value === 0 || value === '0') return 'personalizada';
  const nombreNormalizado = String(descripcion || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
  if (categoriasPredeterminadas.has(nombreNormalizado)) return 'predeterminada';
  return 'sin-clasificar';
};

const OptimizacionPresupuesto = () => {
  const [idPerfil] = useState(() => localStorage.getItem('idPerfil') || '');
  const [periodos, setPeriodos] = useState([]);
  const [idPeriodo, setIdPeriodo] = useState('');
  const [presupuesto, setPresupuesto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarPeriodos = async () => {
      if (!idPerfil) {
        toast.error('No se encontró el perfil de usuario');
        return;
      }
      try {
        const response = await getData(`periodos/${idPerfil}/por-perfil`);
        const data = Array.isArray(response) ? response : response?.data || [];
        setPeriodos(data);
        if (data.length) setIdPeriodo(getId(data[0]._id || data[0].id));
      } catch (error) {
        toast.error(error.message);
      }
    };
    cargarPeriodos();
  }, [idPerfil]);

  const cargarPresupuesto = useCallback(async () => {
    setPresupuesto(null);
    setResultado(null);
    if (!idPerfil || !idPeriodo) return;
    try {
      const response = await getData(
        `presupuestos/por-perfil-periodo?idPerfil=${idPerfil}&idPeriodo=${idPeriodo}`
      );
      const presupuestoSeleccionado = response?.data || response;
      setPresupuesto(presupuestoSeleccionado);

      const preload = await getData(`optimization/preload/${idPeriodo}`);
      const necesidades = Array.isArray(preload?.categorias) ? preload.categorias : [];
      setCategorias(necesidades.map((category) => ({
        idNecesidad: category.idNecesidad,
        name: category.name,
        descripcion: category.descripcion,
        tipo: category.tipo,
        esPredeterminada: category.esPredeterminada,
        gastoReal: Number(category.gastoReal || 0),
        minimum: Number(category.minimum || 0),
        maximum: Number(category.maximum || 0),
      })));

      if (preload?.success === false) {
        toast.error(preload.mensaje);
      }
    } catch (error) {
      if (!String(error.message).includes('404')) toast.error(error.message);
    }
  }, [idPerfil, idPeriodo]);

  useEffect(() => {
    cargarPresupuesto();
  }, [cargarPresupuesto]);

  const actualizarCategoria = (index, field, value) => {
    setCategorias((current) =>
      current.map((category, i) =>
        i === index ? { ...category, [field]: value === '' ? '' : Number(value) } : category
      )
    );
  };

  const resetearMaximosSugeridos = () => {
    const budget = Number(presupuesto?.monto || 0);
    const minimums = categorias.map((category) => Math.max(0, Number(category.minimum || 0)));
    const minimumTotal = minimums.reduce((sum, value) => sum + value, 0);

    if (minimumTotal > budget) {
      toast.error('Los mínimos superan el presupuesto disponible');
      return;
    }

    if (minimumTotal === 0) {
      setCategorias((current) => current.map((category) => ({ ...category, maximum: 0 })));
      return;
    }

    const remaining = budget - minimumTotal;
    const shares = minimums.map((minimum) => {
      const exactShare = remaining * (minimum / minimumTotal);
      return {
        minimum,
        allocated: Math.floor(exactShare),
        remainder: exactShare - Math.floor(exactShare),
      };
    });
    let remainingPesos = Math.round(
      remaining - shares.reduce((sum, share) => sum + share.allocated, 0)
    );
    const remainderOrder = shares
      .map((share, index) => ({ index, remainder: share.remainder }))
      .filter(({ index }) => minimums[index] > 0)
      .sort((first, second) => second.remainder - first.remainder);
    for (let index = 0; index < remainingPesos; index++) {
      shares[remainderOrder[index].index].allocated += 1;
    }
    setCategorias((current) =>
      current.map((category, index) => ({
        ...category,
        maximum: minimums[index] + shares[index].allocated,
      }))
    );
  };

  const totalMinimos = categorias.reduce(
    (sum, category) => sum + Math.max(0, Number(category.minimum || 0)),
    0
  );
  const necesidadesPredeterminadas = categorias.filter(
    (category) => tipoNecesidad(category.esPredeterminada, category.descripcion || category.name) === 'predeterminada'
  ).length;
  const necesidadesPersonalizadas = categorias.filter(
    (category) => tipoNecesidad(category.esPredeterminada, category.descripcion || category.name) === 'personalizada'
  ).length;
  const necesidadesSinClasificar = categorias.length
    - necesidadesPredeterminadas
    - necesidadesPersonalizadas;
  const minimosPersonalizadas = categorias
    .filter((category) => tipoNecesidad(category.esPredeterminada, category.descripcion || category.name) === 'personalizada')
    .reduce((sum, category) => sum + Math.max(0, Number(category.minimum || 0)), 0);
  const margenDisponible = Math.max(0, Number(presupuesto?.monto || 0) - totalMinimos);

  const erroresCategorias = categorias
    .filter((category) =>
      category.minimum === '' ||
      category.maximum === '' ||
      !Number.isFinite(Number(category.minimum)) ||
      !Number.isFinite(Number(category.maximum)) ||
      Number(category.minimum) < 0 ||
      Number(category.maximum) < Number(category.minimum)
    )
    .map((category) => category.name);
  const adicionalNecesario = Math.max(
    0,
    totalMinimos - Number(presupuesto?.monto || 0)
  );

  const ejecutarOptimizacion = async () => {
    if (!idPeriodo) {
      toast.error('Seleccione un periodo');
      return;
    }
    if (!presupuesto?.monto && Number(presupuesto?.monto) !== 0) {
      toast.error('El periodo seleccionado no tiene presupuesto');
      return;
    }
    if (totalMinimos > Number(presupuesto.monto)) {
      toast.error(`Presupuesto insuficiente. Necesitas ${formatoMoneda(adicionalNecesario)} adicionales o reducir los mínimos.`);
      return;
    }
    if (categorias.length === 0) {
      toast.error('El periodo debe tener al menos una necesidad para optimizar');
      return;
    }
    if (erroresCategorias.length) {
      toast.error(`Revise los límites de: ${erroresCategorias.join(', ')}`);
      return;
    }
    setLoading(true);
    setResultado(null);
    try {
      const response = await postData('optimization/optimize', {
        presupuestoDisponible: Number(presupuesto.monto),
        idPeriodo,
        idPresupuesto: getId(presupuesto?._id || presupuesto?.id),
        categorias: categorias.map((category) => ({
          idNecesidad: category.idNecesidad,
          name: category.name,
          descripcion: category.descripcion,
          tipo: category.tipo,
          esPredeterminada: category.esPredeterminada,
          gastoReal: category.gastoReal,
          minimum: Number(category.minimum),
          maximum: Number(category.maximum),
        })),
      });
      setResultado(response);
      toast.success('Optimización calculada');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = resultado ? {
    labels: [
      ...resultado.distribucion.map((item) => item.categoria),
      'Ahorro',
    ],
    datasets: [{
      data: [
        ...resultado.distribucion.map((item) => item.asignacionOptima),
        resultado.ahorroMaximo,
      ],
      backgroundColor: [
        '#38bdf8', '#34d399', '#fbbf24', '#a78bfa', '#fb7185', '#818cf8', '#22c55e',
      ],
      borderWidth: 0,
    }],
  } : null;

  return (
    <>
      <Navbar />
      <main className="optimizacion-page">
        <div className="optimizacion-container">
          <header className="optimizacion-header">
            <span className="optimizacion-chip">PROGRAMACIÓN LINEAL</span>
            <h1>Optimización de presupuesto</h1>
            <p>Asigna los gastos mínimos y maximiza el ahorro disponible.</p>
          </header>

          <section className="optimizacion-card">
            <div className="optimizacion-periodo">
              <label htmlFor="periodo">Periodo</label>
              <select
                id="periodo"
                value={idPeriodo}
                onChange={(event) => setIdPeriodo(event.target.value)}
              >
                <option value="">Seleccione un periodo</option>
                {periodos.map((periodo) => (
                  <option key={getId(periodo._id || periodo.id)} value={getId(periodo._id || periodo.id)}>
                    {periodo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="presupuesto-disponible">
              <span>Presupuesto disponible</span>
              <strong>{presupuesto ? formatoMoneda(presupuesto.monto) : 'Seleccione un periodo con presupuesto'}</strong>
            </div>

            <button
              type="button"
              className="optimizacion-refresh"
              onClick={cargarPresupuesto}
              disabled={!idPeriodo}
            >
              Actualizar necesidades
            </button>

            <div className="optimizacion-resumen">
              <div>
                <span>Necesidades predeterminadas</span>
                <strong>{necesidadesPredeterminadas}</strong>
              </div>
              <div>
                <span>Necesidades personalizadas</span>
                <strong>{necesidadesPersonalizadas}</strong>
              </div>
              <div>
                <span>Sin tipo definido</span>
                <strong>{necesidadesSinClasificar}</strong>
              </div>
              <div>
                <span>Total de necesidades</span>
                <strong>{categorias.length}</strong>
              </div>
              <div>
                <span>Total de mínimos</span>
                <strong>{formatoMoneda(totalMinimos)}</strong>
              </div>
              <div>
                <span>Mínimos personalizados</span>
                <strong>{formatoMoneda(minimosPersonalizadas)}</strong>
              </div>
              <div>
                <span>Margen disponible</span>
                <strong>{formatoMoneda(margenDisponible)}</strong>
              </div>
              {totalMinimos > Number(presupuesto?.monto || 0) && (
                <p className="texto-peligro">
                  Presupuesto insuficiente: necesitas {formatoMoneda(adicionalNecesario)} adicionales o reducir algunos mínimos.
                </p>
              )}
            </div>
            <p className="optimizacion-hint">
              El monto registrado es una referencia inicial; confirma o ajusta el mínimo que deseas cubrir para cada necesidad.
            </p>

            <div className="table-responsive">
              <table className="optimizacion-table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Registrado</th>
                    <th>Gasto mínimo</th>
                    <th>Gasto máximo</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.length === 0 && (
                    <tr>
                      <td colSpan="5" className="optimizacion-empty">
                        No hay necesidades registradas para este periodo. Puede agregar necesidades y actualizar esta pantalla.
                      </td>
                    </tr>
                  )}
                  {categorias.map((category, index) => (
                    <tr key={category.idNecesidad || `${category.name}-${index}`}>
                      <td>
                        <div className="optimizacion-categoria">
                          <span>{category.descripcion || category.name || category.tipo || 'Necesidad'}</span>
                          <span className={`badge-${tipoNecesidad(category.esPredeterminada, category.descripcion || category.name)}`}>
                            {tipoNecesidad(category.esPredeterminada, category.descripcion || category.name) === 'predeterminada'
                              ? 'Predeterminada'
                              : tipoNecesidad(category.esPredeterminada, category.descripcion || category.name) === 'personalizada'
                                ? 'Personalizada'
                                : 'Sin clasificar'}
                          </span>
                        </div>
                      </td>
                      <td>{category.descripcion || 'Sin descripción'}</td>
                      <td>{formatoMoneda(category.gastoReal)}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={category.minimum}
                          onChange={(event) => actualizarCategoria(index, 'minimum', event.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={category.maximum}
                          onChange={(event) => actualizarCategoria(index, 'maximum', event.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="optimizacion-actions">
              <button
                type="button"
                className="optimizacion-reset"
                onClick={resetearMaximosSugeridos}
              >
                Restablecer máximos sugeridos
              </button>
              <button
                type="button"
                className="optimizacion-submit"
                onClick={ejecutarOptimizacion}
                disabled={loading || erroresCategorias.length > 0 ||
                  totalMinimos > Number(presupuesto?.monto || 0)}
              >
                {loading ? 'Calculando...' : 'Calcular ahorro máximo'}
              </button>
            </div>
          </section>

          {resultado && (
            <section className="resultado-grid">
              <div className="resultado-metricas">
                <article>
                  <span>Presupuesto disponible</span>
                  <strong>{formatoMoneda(resultado.presupuestoDisponible)}</strong>
                </article>
                <article>
                  <span>Total optimizado</span>
                  <strong>{formatoMoneda(resultado.totalGastosOptimizados)}</strong>
                </article>
                <article>
                  <span>Ahorro máximo</span>
                  <strong>{formatoMoneda(resultado.ahorroMaximo)}</strong>
                </article>
                <article>
                  <span>Porcentaje de ahorro</span>
                  <strong>{Number(resultado.porcentajeAhorro).toFixed(2)}%</strong>
                </article>

                <div className="table-responsive resultado-tabla">
                  <table className="optimizacion-table">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th>Descripción</th>
                        <th>Mínimo</th>
                        <th>Máximo</th>
                        <th>Óptimo</th>
                        <th>Real</th>
                        <th>Diferencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.distribucion.map((item) => (
                        <tr key={item.idNecesidad || `${item.categoria}-${item.descripcion}`}>
                          <td>
                            <div className="optimizacion-categoria">
                              <span>{item.descripcion || item.categoria || item.tipo || 'Necesidad'}</span>
                              <span className={`badge-${tipoNecesidad(item.esPredeterminada, item.descripcion || item.categoria)}`}>
                                {tipoNecesidad(item.esPredeterminada, item.descripcion || item.categoria) === 'predeterminada'
                                  ? 'Predeterminada'
                                  : tipoNecesidad(item.esPredeterminada, item.descripcion || item.categoria) === 'personalizada'
                                    ? 'Personalizada'
                                    : 'Sin clasificar'}
                              </span>
                            </div>
                          </td>
                          <td>{item.descripcion || 'Sin descripción'}</td>
                          <td>{formatoMoneda(item.minimo)}</td>
                          <td>{formatoMoneda(item.maximo)}</td>
                          <td>{formatoMoneda(item.asignacionOptima)}</td>
                          <td>{formatoMoneda(item.gastoReal)}</td>
                          <td className={item.excedeMaximo ? 'texto-peligro' : ''}>
                            {formatoMoneda(item.diferencia)}
                            {item.excedeMaximo ? ' — Supera máximo' : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="resultado-grafico">
                <h2>Distribución del presupuesto</h2>
                {chartData && (
                  <Pie
                    data={chartData}
                    options={{
                      plugins: {
                        legend: { position: 'bottom', labels: { color: '#e2e8f0' } },
                      },
                    }}
                  />
                )}
              </aside>
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default OptimizacionPresupuesto;
