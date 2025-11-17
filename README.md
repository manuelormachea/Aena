# Aena - Página Web Estática

Página web estática que replica el frontend de AENA con estructura de llamadas a APIs similar a NUMIABANK.

## Estructura del Proyecto

```
.
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos basados en el diseño de AENA
├── app.js              # Lógica principal de la aplicación
├── services/
│   └── api.js          # Servicio de API (estructura similar a NUMIABANK)
└── README.md           # Documentación
```

## Características

- **Diseño**: Replica el frontend de AENA con colores verdes característicos
- **APIs**: Estructura de llamadas a APIs organizada en servicios (patrón NUMIABANK)
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla
- **Modular**: Código organizado y fácil de mantener

## Uso

### Desarrollo Local

1. Abre `index.html` en tu navegador o usa un servidor local:

```bash
# Con Python
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Con PHP
php -S localhost:8000
```

2. Abre `http://localhost:8000` en tu navegador

### Configuración de API

### API de AENA

Para conectar con tu backend, edita `services/api.js` y actualiza la URL base:

```javascript
this.baseURL = 'https://tu-api.com/api/v1';
```

### API de Filavirtual (Sala de Espera)

Para usar el sistema de reservación de asientos con videollamadas:

1. **Obtén tu token de filavirtual** desde el panel de administración
2. **Configura el token** de una de estas formas:

   **Opción A: Desde localStorage (desarrollo)**
   ```javascript
   localStorage.setItem('filavirtual_token', 'TU_TOKEN_AQUI');
   ```

   **Opción B: Desde archivo de configuración**
   - Copia `config.example.js` como `config.js`
   - Reemplaza `YOUR_FILAVIRTUAL_TOKEN_HERE` con tu token real
   - Importa y usa en `app.js`

   **Opción C: Desde backend (recomendado para producción)**
   - Crea un endpoint en tu backend que devuelva el token
   - Llama a ese endpoint desde `configureFilavirtualToken()` en `app.js`

3. **Endpoints de la API de Filavirtual** (configurados en `services/api.js`):
   - `POST /turnos/generar` - Genera un nuevo turno
   - `GET /turnos/{id}/estado` - Verifica el estado del turno
   - `GET /turnos/{id}/videollamada` - Obtiene la URL de videollamada

**Nota:** Los endpoints exactos pueden variar según la versión de la API de filavirtual. Ajusta las URLs en `services/api.js` según la documentación oficial.

## Estructura de APIs

El proyecto utiliza una estructura de servicios similar a NUMIABANK:

### ApiService (Clase Base)
- `request(endpoint, options)` - Método genérico para peticiones HTTP
- `get(endpoint, params)` - GET request
- `post(endpoint, body)` - POST request
- `put(endpoint, body)` - PUT request
- `delete(endpoint)` - DELETE request

### AenaApiService (Servicios Específicos)
- `getAirports(searchTerm)` - Obtener lista de aeropuertos
- `getAirportDetails(airportCode)` - Detalles de un aeropuerto
- `searchParking(params)` - Buscar disponibilidad de parking
- `searchFlights(params)` - Buscar vuelos
- `getInfoCards()` - Obtener tarjetas informativas
- `getTerminals(airportCode)` - Obtener terminales
- `getFlightDetails(flightNumber)` - Detalles de un vuelo

## Datos Mock

El proyecto incluye datos de ejemplo que se utilizan cuando la API no está disponible. Estos se encuentran en `app.js` dentro del objeto `mockData`.

## Personalización

### Colores

Los colores principales están definidos en `styles.css` como variables CSS:

```css
--aena-green: #00A859;
--aena-dark-green: #008A4A;
--aena-light-green: #E6F5ED;
```

### Agregar Nuevos Endpoints

Para agregar nuevos endpoints, extiende `AenaApiService` en `services/api.js`:

```javascript
async getNewEndpoint(params) {
    return this.get('/new-endpoint', params);
}
```

## Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsive design para móviles y tablets
- JavaScript ES6+

## Notas

- Las llamadas a APIs están configuradas para manejar errores gracefully
- Si la API no está disponible, se utilizan datos mock automáticamente
- El código está preparado para trabajar con CORS habilitado en el backend

## Licencia

Este es un proyecto de ejemplo para replicar el diseño de AENA.

