import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Chart = ({ gastos }) => {

    // Preparar los datos para Chart.js
    const labels = gastos.map(g => g.descripcion); // Usa las descripciones de las necesidades como etiquetas

    const data = {
        labels,
        datasets: [
            {
                label: 'Monto', // Etiqueta genérica para el monto de la necesidad
                data: gastos.map(g => g.monto), // Mapea los montos directamente
                borderColor: 'rgba(54, 162, 235, 1)', // Color de la línea
                backgroundColor: 'rgba(54, 162, 235, 0.2)', // Color del área
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
                text: 'Distribución de Necesidades', // Título más general
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Necesidad', // Etiqueta del eje X
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Monto', // Etiqueta del eje Y
                },
            },
        },
    };

    return (
        <Line data={data} options={options} />
    );
};

export default Chart;
