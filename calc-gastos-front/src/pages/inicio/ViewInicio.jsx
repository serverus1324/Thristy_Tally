import { Link } from "react-router-dom"

const ViewInicio = () => {
    return (
        <>
            <div className="bg-light">
                <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
                    {/* Encabezado */}
                    <div className="text-center mb-5">
                        <h1 className="fw-bold text-primary display-4 mb-3">
                            ¡Tu compañero financiero universitario
                        </h1>
                        <p className="fw-semibold text-secondary fs-5 w-75 mx-auto">
                            Una herramienta diseñada para estudiantes universitarios que te ayuda a organizar tus necesidades, planificar tu presupuesto y tomar decisiones financieras más inteligentes para que puedas enfocarte en tus estudios.
                        </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="row w-100 text-center">
                        {/* Botón Iniciar Sesión */}
                        <div className="col-md-6 mb-4">
                            <h2 className="fs-5 mb-3">¿Tienes una cuenta creada?</h2>
                            <Link to="/login" className="btn btn-primary btn-lg px-5">
                                Inicia Sesión
                            </Link>
                        </div>

                        {/* Botón Registrarse */}
                        <div className="col-md-6">
                            <h2 className="fs-5 mb-3">¿No tienes una cuenta?</h2>
                            <Link to="/signup" className="btn btn-primary btn-lg px-5">
                                Regístrate
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ViewInicio