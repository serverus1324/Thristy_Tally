import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { deleteData } from '../../api/api';

const GastosTable = ({ gastos }) => {
    const navigate = useNavigate();

    const handleEditClick = (necesidad) => {
        navigate(`/necesidad-presupuesto`, { state: { necesidadId: necesidad.id } }); // Pasa el ID de la necesidad
    };

    const handleDeleteClick = (necesidad) => {
        toast(
            (t) => (
                <div>
                    <p>¿Estás seguro de que deseas eliminar esta necesidad?</p>
                    <div className="d-flex justify-content-between mt-2">
                        <button
                            className="btn btn-danger btn-sm me-2"
                            onClick={() => {
                                deleteNecesidad(necesidad.id);
                                toast.dismiss(t.id);
                            }}
                        >
                            Sí, eliminar
                        </button>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => toast.dismiss(t.id)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ),
            { duration: 5000 }
        );
    };

    const deleteNecesidad = async (idNecesidad) => {
        try {
            await deleteData(`necesidades/${idNecesidad}`);
            toast.success("Necesidad eliminada exitosamente.");
            // No es necesario navegar a otra página, simplemente recargar los datos en el componente padre
        } catch (error) {
            toast.error("Error al eliminar la necesidad: " + (error?.message || ""));
            console.error('DELETE necesidades error', error);
        }
    };

    

    return (
        <div className="table-responsive mt-4">
            <table className="table table-bordered table-hover border border-primary">
                <thead className="table-primary text-center">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Descripción</th>
                        <th scope="col">Monto</th>
                        <th scope="col">Es Predeterminada</th>
                        <th scope="col">Presupuesto Asignado</th>
                        <th scope="col">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {gastos.length > 0 ? (
                        gastos.map((necesidad, index) => (
                            <tr key={necesidad.id}>
                                <th scope="row" className="text-center">{index + 1}</th>
                                <td>{necesidad.descripcion}</td>
                                <td className="text-end">${necesidad.monto}</td>
                                <td className="text-center">{necesidad.esPredeterminada ? 'Sí' : 'No'}</td>
                                <td>{necesidad.idPresupuesto ? `Presupuesto ${necesidad.idPresupuesto}` : 'Ninguno'}</td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() => handleEditClick(necesidad)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteClick(necesidad)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center text-muted">
                                No hay necesidades registradas.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <Toaster />
        </div>
    );
};

export default GastosTable;