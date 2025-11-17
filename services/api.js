/**
 * API Service Layer
 * Estructura similar a NUMIABANK para manejar todas las llamadas a APIs
 */

class ApiService {
    constructor() {
        // Base URL de la API - ajustar según tu backend
        this.baseURL = 'https://api.aena.example.com/api/v1';
        
        // Configuración por defecto para las peticiones
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Método genérico para realizar peticiones HTTP
     * @param {string} endpoint - Endpoint de la API
     * @param {object} options - Opciones de la petición (method, body, headers, etc.)
     * @returns {Promise} - Promise con la respuesta
     */
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            headers = {},
            ...restOptions
        } = options;

        const config = {
            method,
            headers: {
                ...this.defaultHeaders,
                ...headers
            },
            ...restOptions
        };

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body
        });
    }

    /**
     * PUT request
     */
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

/**
 * Servicios específicos de AENA
 */
class AenaApiService extends ApiService {
    constructor() {
        super();
        // Token de filavirtual - debe ser configurado
        this.filavirtualToken = null;
        this.filavirtualBaseURL = 'https://filavirtual2.debmedia.com/api';
    }

    /**
     * Configurar token de filavirtual
     */
    setFilavirtualToken(token) {
        this.filavirtualToken = token;
    }

    /**
     * Obtener lista de aeropuertos
     */
    async getAirports(searchTerm = '') {
        const params = searchTerm ? { search: searchTerm } : {};
        return this.get('/airports', params);
    }

    /**
     * Obtener información de un aeropuerto específico
     */
    async getAirportDetails(airportCode) {
        return this.get(`/airports/${airportCode}`);
    }

    /**
     * Buscar disponibilidad de parking
     */
    async searchParking(params) {
        return this.post('/parking/search', params);
    }

    /**
     * Buscar vuelos
     */
    async searchFlights(params) {
        return this.post('/flights/search', params);
    }

    /**
     * Obtener información de interés (tarjetas informativas)
     */
    async getInfoCards() {
        return this.get('/info-cards');
    }

    /**
     * Obtener terminales de un aeropuerto
     */
    async getTerminals(airportCode) {
        return this.get(`/airports/${airportCode}/terminals`);
    }

    /**
     * Obtener detalles de un vuelo
     */
    async getFlightDetails(flightNumber) {
        return this.get(`/flights/${flightNumber}`);
    }

    /**
     * Generar turno de videollamada usando filavirtual
     * Similar al flujo de NumiaBank
     */
    async generateTurnoFilavirtual(formData) {
        if (!this.filavirtualToken) {
            return {
                success: false,
                error: 'Token de filavirtual no configurado'
            };
        }

        try {
            // Llamada a la API de filavirtual para generar el turno
            const response = await fetch(`${this.filavirtualBaseURL}/turnos/generar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.filavirtualToken}`,
                    'X-Client': 'aena'
                },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    dni: formData.dni || null,
                    telefono: formData.telefono,
                    email: formData.email,
                    vuelo: formData.vuelo || null,
                    servicio: formData.servicio || 'Reservación de Asientos',
                    canal: formData.canal || 'web',
                    tipo: formData.tipo || 'virtual',
                    idioma: formData.idioma || 'es',
                    acompanantes: formData.acompanantes || 0,
                    branchId: 75,
                    queueId: 819,
                    metadata: formData.metadata || {}
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error generando turno filavirtual:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verificar estado del turno
     */
    async checkTurnoStatus(turnoId) {
        if (!this.filavirtualToken) {
            return {
                success: false,
                error: 'Token de filavirtual no configurado'
            };
        }

        try {
            const response = await fetch(`${this.filavirtualBaseURL}/turnos/${turnoId}/estado`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.filavirtualToken}`,
                    'X-Client': 'aena'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error verificando estado del turno:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtener URL de videollamada cuando el agente esté listo
     */
    async getVideoCallUrl(turnoId) {
        if (!this.filavirtualToken) {
            return {
                success: false,
                error: 'Token de filavirtual no configurado'
            };
        }

        try {
            const response = await fetch(`${this.filavirtualBaseURL}/turnos/${turnoId}/videollamada`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.filavirtualToken}`,
                    'X-Client': 'aena'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error obteniendo URL de videollamada:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Instancia única del servicio (Singleton pattern)
const apiService = new AenaApiService();

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiService, AenaApiService, apiService };
}

