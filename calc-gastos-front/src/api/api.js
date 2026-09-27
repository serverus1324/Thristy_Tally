// Usar ruta relativa para aprovechar el proxy del dev server y evitar CORS
const API_BASE_URL = '/api/v1';

const getAuthHeaders = (headers = {}) => {
    const token = localStorage.getItem('authToken');
    return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

    const handleResponse = async (response) => {
        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = 'Error desconocido';
            if (errorData && errorData.mensaje) {
                errorMessage = errorData.mensaje;
            } else {
                errorMessage = `Error: ${response.status} - ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        return data;
    };

    // Función para realizar solicitudes GET
    export async function getData(complement) {
        const route = `${API_BASE_URL}/${complement}`;
        try {
            const response = await fetch(route, {
                method: 'GET',
                headers: getAuthHeaders({
                    'Content-Type': 'application/json',
                }),
                mode: 'cors'
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la petición GET a ${route}: ${response.status} - ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            // Evitar ruido en consola para 404/Not Found: lo manejarán los llamadores
            const msg = String(error?.message || '');
            const isNetwork = msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ERR_CONNECTION_REFUSED");
            if (isNetwork) {
                console.error('Error al realizar la petición GET:', error.message);
            }
            throw error;
        }
    }

    // Función para realizar solicitudes POST
    export async function postData(complement, body) {
        const route = `${API_BASE_URL}/${complement}`;
        try {
            const response = await fetch(route, {
                method: 'POST',
                headers: getAuthHeaders({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la petición POST a ${route}: ${response.status} - ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al realizar la petición POST:', error.message);
            throw error;
        }
    }

    // Función para realizar solicitudes PUT
    export async function putData(complement, body) {
        const route = `${API_BASE_URL}/${complement}`;
        try {
            const response = await fetch(route, {
                method: 'PUT',
                headers: getAuthHeaders({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la petición PUT a ${route}: ${response.status} - ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al realizar la petición PUT:', error.message);
            throw error;
        }
    }

    // Función para realizar solicitudes DELETE
    export async function deleteData(complement) {
        const route = `${API_BASE_URL}/${complement}`;
        try {
            const response = await fetch(route, {
                method: 'DELETE',
                headers: getAuthHeaders({
                    'Content-Type': 'application/json',
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la petición DELETE a ${route}: ${response.status} - ${response.statusText} - ${errorText}`);
            }
            return { success: true };
        } catch (error) {
            console.error('Error al realizar la petición DELETE:', error.message);
            throw error;
        }
    }

    // Función para realizar solicitudes PATCH
    export async function patchData(complement, body) {
        const route = `${API_BASE_URL}/${complement}`;
        try {
            const response = await fetch(route, {
                method: 'PATCH',
                headers: getAuthHeaders({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la petición PATCH a ${route}: ${response.status} - ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al realizar la petición PATCH:', error.message);
            throw error;
        }
    }

    // ===== Predicción (WEKA J48) =====
    export async function uploadPredictionDataset(file, { classAttr, classIndex } = {}) {
        const route = `${API_BASE_URL}/predict/dataset`;
        const form = new FormData();
        form.append('file', file);
        if (classAttr) form.append('classAttr', classAttr);
        if (typeof classIndex === 'number') form.append('classIndex', String(classIndex));
        const response = await fetch(route, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: form
        });
        return handleResponse(response);
    }

    export async function getPredictionStatus() {
        const route = `${API_BASE_URL}/predict/status`;
        const response = await fetch(route, { method: 'GET', headers: getAuthHeaders() });
        return handleResponse(response);
    }

    export async function scorePrediction(features) {
        const route = `${API_BASE_URL}/predict/score`;
        const response = await fetch(route, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(features)
        });
        return handleResponse(response);
    }
    
    // Obtener esquema del modelo para construir formulario dinámico
    export async function getPredictionSchema() {
        const route = `${API_BASE_URL}/predict/schema`;
        const response = await fetch(route, { method: 'GET', headers: getAuthHeaders() });
        return handleResponse(response);
    }

    export async function getModeloStatus() {
        const route = `/api/prediccion/status`;
        const response = await fetch(route, { method: 'GET', headers: getAuthHeaders() });
        return handleResponse(response);
    }

    export async function getModeloSchema() {
        const route = `/api/prediccion/schema`;
        const response = await fetch(route, { method: 'GET', headers: getAuthHeaders() });
        return handleResponse(response);
    }

    // Integración con backend Spring: POST /api/prediccion/necesidad
    export async function predictNecesidad(features) {
        const route = `/api/prediccion/necesidad`;
        const response = await fetch(route, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(features)
        });
        return handleResponse(response);
    }

    // ===== Auth & Password Recovery =====
    const AUTH_API_BASE = '/api/auth';
    const ADMIN_API_BASE = '/api/admin';

    export async function forgotPassword(email) {
        const route = `${AUTH_API_BASE}/forgot-password`;
        const response = await fetch(route, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return handleResponse(response);
    }

    export async function verifyCode(email, codigo) {
        const route = `${AUTH_API_BASE}/verify-code`;
        const response = await fetch(route, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, codigo })
        });
        return handleResponse(response);
    }

    export async function resetPassword(email, codigo, nuevaPassword) {
        const route = `${AUTH_API_BASE}/reset-password`;
        const response = await fetch(route, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, codigo, nuevaPassword })
        });
        return handleResponse(response);
    }

    export async function getAdminDashboardMetrics() {
        const route = `${ADMIN_API_BASE}/dashboard-metrics`;
        const response = await fetch(route, { method: 'GET', headers: getAuthHeaders() });
        return handleResponse(response);
    }


