import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Chart = ({ gastos, highlightLabel }) => {

    // Agregar por categoría (tipo) para mostrar cuál se excede
    const aggByTipo = gastos.reduce((acc, g) => {
        const tipo = String(g.tipo || 'OTROS').toUpperCase();
        const monto = Number(g.monto || 0);
        acc[tipo] = (acc[tipo] || 0) + (isNaN(monto) ? 0 : monto);
        return acc;
    }, {});

    const labels = Object.keys(aggByTipo);
    const values = labels.map(l => aggByTipo[l]);
    const pointColors = labels.map(l => l === String(highlightLabel || '').toUpperCase() ? 'rgba(220, 38, 38, 1)' : 'rgba(54, 162, 235, 1)');
    const pointRadius = labels.map(l => l === String(highlightLabel || '').toUpperCase() ? 6 : 3);

    const data = {
        labels,
        datasets: [
            {
                label: 'Monto por categoría',
                data: values,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                pointBackgroundColor: pointColors,
                pointRadius,
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Distribución por categoría${highlightLabel ? ` (se excede: ${highlightLabel})` : ''}`,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Categoría',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Monto',
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <Line data={data} options={options} />
    );
};

export default Chart;
