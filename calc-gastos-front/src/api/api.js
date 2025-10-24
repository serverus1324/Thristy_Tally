    const API_BASE_URL = 'http://localhost:8081/api/v1';

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
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors' // Asegúrate de que CORS esté configurado correctamente en tu backend
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error en la petición GET a ${route}: ${response.status} - ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al realizar la petición GET:', error.message);
            throw error;
        }
    }

    // Función para realizar solicitudes POST
    export async function postData(complement, body) {
        const route = `${API_BASE_URL}/${complement}`;
        try {
            const response = await fetch(route, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                headers: {
                    'Content-Type': 'application/json',
                },
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
                headers: {
                    'Content-Type': 'application/json',
                },
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
                headers: {
                    'Content-Type': 'application/json',
                },
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

