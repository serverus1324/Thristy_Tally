import { useNavigate } from 'react-router-dom';

const Navbar = (userData) => {
    const navigate = useNavigate();
    const usuario = userData.userName;
    const idUsuario = usuario?.idEstudiante || -1;

    const goToEdit = () => {
        navigate('/editar-datos', { state: { idUsuario } });
    }

    const goToLogout = () => {
        navigate('/'); // Redirige a la página de inicio
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm px-4">
            <div className="container-fluid">
                {/* Saludo al usuario */}
                <span className="navbar-brand fw-bold text-primary">
                    ¡Hola, {usuario?.nombre}!
                </span>

                {/* Botones a la derecha */}
                <div className="d-flex">
                    <button
                        className="btn btn-outline-primary me-2"
                        onClick={goToEdit}
                    >
                        Editar datos
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={goToLogout}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
