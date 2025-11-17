/**
 * Aplicación principal
 * Maneja la lógica de la interfaz y las interacciones con el usuario
 */

// Instancia del servicio de API
const api = new AenaApiService();

// Datos de ejemplo para desarrollo (cuando no hay API disponible)
const mockData = {
    airports: [
        { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid' },
        { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat', city: 'Barcelona' },
        { code: 'AGP', name: 'Málaga-Costa del Sol', city: 'Málaga' },
        { code: 'PMI', name: 'Palma de Mallorca', city: 'Palma' },
        { code: 'LPA', name: 'Gran Canaria', city: 'Las Palmas' },
        { code: 'TFN', name: 'Tenerife Norte-Ciudad de La Laguna', city: 'Tenerife' },
        { code: 'TFS', name: 'Tenerife Sur', city: 'Tenerife' },
        { code: 'SVQ', name: 'Sevilla', city: 'Sevilla' },
        { code: 'VLC', name: 'Valencia', city: 'Valencia' },
        { code: 'BIO', name: 'Bilbao', city: 'Bilbao' },
        { code: 'ALC', name: 'Alicante-Elche Miguel Hernández', city: 'Alicante' },
        { code: 'IBZ', name: 'Ibiza', city: 'Ibiza' }
    ],
    infoCards: [
        {
            title: 'Servicio de asistencia Sin Barreras',
            description: 'Los aeropuertos de Aena ofrecen un servicio de asistencia para personas con movilidad reducida o discapacidad para facilitarte tu estancia antes y después del vuelo.',
            link: '#',
            linkText: 'CONOCER EL SERVICIO'
        },
        {
            title: 'Servicio de guiado',
            description: 'Encuentra los servicios del aeropuerto que necesitas para calcular el tiempo y el recorrido hasta tu puerta de embarque.',
            link: '#',
            linkText: 'IR A AENA MAPS'
        },
        {
            title: 'Aena Pets by Petpass',
            description: 'Descubre el nuevo servicio para viajar con animales de la forma más fácil posible.',
            link: '#',
            linkText: 'CONOCER EL SERVICIO'
        },
        {
            title: 'Inmigración y visados',
            description: 'Infórmate aquí de la documentación que vas a necesitar si eres extranjero y vas a viajar a España.',
            link: '#',
            linkText: 'MÁS SOBRE DOCUMENTACIÓN'
        },
        {
            title: 'Equipaje de mano',
            description: 'Averigua qué está permitido, restringido o prohibido en el equipaje de mano que llevas en la cabina del avión.',
            link: '#',
            linkText: 'QUÉ PUEDES LLEVAR'
        }
    ]
};

/**
 * Utilidades para manejar el DOM
 */
const DOMUtils = {
    showLoading(element) {
        element.innerHTML = '<div class="loading">Cargando...</div>';
    },

    showError(element, message) {
        element.innerHTML = `<div class="error">${message}</div>`;
    },

    clearElement(element) {
        element.innerHTML = '';
    }
};

/**
 * Cargar y mostrar aeropuertos
 */
async function loadAirports(searchTerm = '') {
    const airportGrid = document.getElementById('airportGrid');
    
    try {
        // Intentar cargar desde la API
        const response = await api.getAirports(searchTerm);
        
        let airports;
        if (response.success && response.data) {
            airports = response.data;
        } else {
            // Usar datos mock si la API no está disponible
            airports = mockData.airports.filter(airport => 
                !searchTerm || 
                airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                airport.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (airports.length === 0) {
            airportGrid.innerHTML = '<p class="loading">No se encontraron aeropuertos</p>';
            return;
        }

        airportGrid.innerHTML = airports.map(airport => `
            <div class="airport-card" onclick="selectAirport('${airport.code}')">
                <h3>${airport.name}</h3>
                <span class="code">${airport.code}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading airports:', error);
        DOMUtils.showError(airportGrid, 'Error al cargar los aeropuertos');
    }
}

/**
 * Cargar tarjetas de información
 */
async function loadInfoCards() {
    const infoCardsContainer = document.getElementById('infoCards');
    
    try {
        const response = await api.getInfoCards();
        
        let cards;
        if (response.success && response.data) {
            cards = response.data;
        } else {
            cards = mockData.infoCards;
        }

        infoCardsContainer.innerHTML = cards.map(card => `
            <div class="info-card">
                <h3>${card.title}</h3>
                <p>${card.description}</p>
                <a href="${card.link}" class="btn-link">${card.linkText} →</a>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading info cards:', error);
        DOMUtils.showError(infoCardsContainer, 'Error al cargar la información');
    }
}

/**
 * Cargar terminales en el selector
 */
async function loadTerminals(airportCode = '') {
    const terminalSelect = document.getElementById('terminalSelect');
    
    try {
        if (airportCode) {
            const response = await api.getTerminals(airportCode);
            let terminals;
            
            if (response.success && response.data) {
                terminals = response.data;
            } else {
                // Datos mock
                terminals = [
                    { id: 'T1', name: 'Terminal 1' },
                    { id: 'T2', name: 'Terminal 2' },
                    { id: 'T3', name: 'Terminal 3' },
                    { id: 'T4', name: 'Terminal 4' }
                ];
            }

            terminalSelect.innerHTML = '<option value="">Selecciona...</option>' +
                terminals.map(term => 
                    `<option value="${term.id}">${term.name}</option>`
                ).join('');
        } else {
            terminalSelect.innerHTML = '<option value="">Selecciona un aeropuerto primero</option>';
        }
    } catch (error) {
        console.error('Error loading terminals:', error);
    }
}

/**
 * Buscar parking
 */
async function searchParking() {
    const terminal = document.getElementById('terminalSelect').value;
    const entryDate = document.getElementById('entryDate').value;
    const entryTime = document.getElementById('entryTime').value;
    const exitDate = document.getElementById('exitDate').value;
    const exitTime = document.getElementById('exitTime').value;
    const promoCode = document.getElementById('promoCode').value;

    if (!terminal || !entryDate || !exitDate) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }

    const params = {
        terminal,
        entryDate,
        entryTime,
        exitDate,
        exitTime,
        promoCode
    };

    try {
        const response = await api.searchParking(params);
        
        if (response.success) {
            // Aquí podrías mostrar los resultados en un modal o sección
            console.log('Parking results:', response.data);
            alert('Búsqueda realizada. Revisa la consola para ver los resultados.');
        } else {
            alert('Error al buscar parking: ' + response.error);
        }
    } catch (error) {
        console.error('Error searching parking:', error);
        alert('Error al realizar la búsqueda');
    }
}

/**
 * Buscar vuelos
 */
async function searchFlights() {
    const origin = document.getElementById('originAirport').value;
    const destination = document.getElementById('destinationAirport').value;
    const date = document.getElementById('flightDate').value;

    if (!origin || !destination || !date) {
        alert('Por favor, completa todos los campos');
        return;
    }

    const params = {
        origin,
        destination,
        date
    };

    const flightResults = document.getElementById('flightResults');
    DOMUtils.showLoading(flightResults);

    try {
        const response = await api.searchFlights(params);
        
        if (response.success && response.data) {
            displayFlightResults(response.data);
        } else {
            // Datos mock para demostración
            displayFlightResults([
                {
                    flightNumber: 'IB1234',
                    origin: origin,
                    destination: destination,
                    departureTime: '08:30',
                    arrivalTime: '10:45',
                    airline: 'Iberia',
                    price: '€150'
                }
            ]);
        }
    } catch (error) {
        console.error('Error searching flights:', error);
        DOMUtils.showError(flightResults, 'Error al buscar vuelos');
    }
}

/**
 * Mostrar resultados de vuelos
 */
function displayFlightResults(flights) {
    const flightResults = document.getElementById('flightResults');
    
    if (flights.length === 0) {
        flightResults.innerHTML = '<p class="loading">No se encontraron vuelos</p>';
        return;
    }

    flightResults.innerHTML = flights.map(flight => `
        <div class="flight-result">
            <div class="flight-info">
                <h4>Vuelo ${flight.flightNumber}</h4>
                <p><strong>Origen:</strong> ${flight.origin}</p>
                <p><strong>Destino:</strong> ${flight.destination}</p>
                <p><strong>Salida:</strong> ${flight.departureTime}</p>
                <p><strong>Llegada:</strong> ${flight.arrivalTime}</p>
                <p><strong>Aerolínea:</strong> ${flight.airline}</p>
            </div>
            <div>
                <p style="font-size: 24px; font-weight: bold; color: var(--aena-green);">${flight.price}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Seleccionar aeropuerto
 */
function selectAirport(code) {
    console.log('Airport selected:', code);
    // Aquí podrías redirigir a una página de detalles o cargar más información
    loadTerminals(code);
}

// Variables globales para el sistema de turnos
let currentTurnoId = null;
let turnoCheckInterval = null;

/**
 * Configurar token de filavirtual
 * IMPORTANTE: Configurar el token real aquí o desde el backend
 */
function configureFilavirtualToken() {
    // Token de filavirtual configurado
    const token = localStorage.getItem('filavirtual_token') || 'l13h4QS8h7ILVDAOduVpAwghCuG6LM5grbHRD9Nb';
    api.setFilavirtualToken(token);
}

/**
 * Mostrar/ocultar botón flotante según scroll
 */
function handleScroll() {
    const floatingBtn = document.getElementById('floatingSalaEspera');
    if (!floatingBtn) return;

    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const heroHeight = document.querySelector('.hero')?.offsetHeight || 0;

    if (scrollPosition > heroHeight / 2) {
        floatingBtn.classList.add('visible');
    } else {
        floatingBtn.classList.remove('visible');
    }
}

/**
 * Abrir modal de reservación
 */
function openReservationModal() {
    const modal = document.getElementById('reservationModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Cerrar modal de reservación
 */
function closeReservationModal() {
    const modal = document.getElementById('reservationModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Abrir sala de espera
 */
function openWaitingRoom(turnoData) {
    closeReservationModal();
    const waitingModal = document.getElementById('waitingRoomModal');
    const turnInfo = document.getElementById('turnInfo');
    
    if (waitingModal) {
        waitingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (turnInfo && turnoData) {
            turnInfo.innerHTML = `
                <p>Turno #${turnoData.id || 'Generado'}</p>
                <p style="font-size: 12px; margin-top: 5px;">Posición en cola: ${turnoData.posicion || 'Calculando...'}</p>
            `;
        }
        
        // Iniciar verificación periódica del estado del turno
        if (turnoData?.id) {
            currentTurnoId = turnoData.id;
            startTurnoStatusCheck();
        }
    }
}

/**
 * Cerrar sala de espera
 */
function closeWaitingRoom() {
    const waitingModal = document.getElementById('waitingRoomModal');
    if (waitingModal) {
        waitingModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Detener verificación de estado
    if (turnoCheckInterval) {
        clearInterval(turnoCheckInterval);
        turnoCheckInterval = null;
    }
    
    currentTurnoId = null;
}

/**
 * Verificar estado del turno periódicamente
 */
function startTurnoStatusCheck() {
    if (!currentTurnoId) return;

    turnoCheckInterval = setInterval(async () => {
        const response = await api.checkTurnoStatus(currentTurnoId);
        
        if (response.success && response.data) {
            const { estado, agenteListo, videoCallUrl } = response.data;
            
            if (agenteListo && videoCallUrl) {
                // El agente está listo, iniciar videollamada
                clearInterval(turnoCheckInterval);
                initiateVideoCall(videoCallUrl);
            } else if (estado === 'cancelado' || estado === 'finalizado') {
                // El turno fue cancelado o finalizado
                clearInterval(turnoCheckInterval);
                closeWaitingRoom();
                alert('El turno ha sido cancelado o finalizado.');
            }
        }
    }, 3000); // Verificar cada 3 segundos
}

/**
 * Iniciar videollamada
 */
function initiateVideoCall(videoCallUrl) {
    closeWaitingRoom();
    
    // Abrir la videollamada en un iframe o nueva ventana
    // Dependiendo de cómo filavirtual maneje las videollamadas
    const videoCallWindow = window.open(videoCallUrl, 'Videollamada Aena', 'width=1200,height=800');
    
    if (!videoCallWindow) {
        // Si no se puede abrir popup, mostrar mensaje
        alert('Por favor, permite ventanas emergentes para iniciar la videollamada.');
        // Alternativa: redirigir en la misma ventana
        // window.location.href = videoCallUrl;
    }
}

/**
 * Manejar envío del formulario de reservación
 */
async function handleReservationSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        nombre: form.nombre.value.trim(),
        apellido: form.apellido.value.trim(),
        dni: form.dni.value.trim(),
        telefono: form.telefono.value.trim(),
        email: form.email.value.trim(),
        vuelo: form.vuelo.value.trim() || null
    };

    // Validación básica
    if (!formData.nombre || !formData.apellido || !formData.dni || !formData.telefono || !formData.email) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Por favor, ingresa un email válido.');
        return;
    }

    // Deshabilitar botón mientras se procesa
    const submitBtn = document.getElementById('generateTurn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Generando turno...';

    try {
        // Generar turno usando filavirtual
        const response = await api.generateTurnoFilavirtual(formData);

        if (response.success && response.data) {
            // Turno generado exitosamente
            openWaitingRoom(response.data);
        } else {
            // Error al generar turno
            alert('Error al generar el turno: ' + (response.error || 'Error desconocido'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    } catch (error) {
        console.error('Error en handleReservationSubmit:', error);
        alert('Error al procesar la solicitud. Por favor, intenta nuevamente.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    // Configurar token de filavirtual
    configureFilavirtualToken();

    // Cargar datos iniciales
    loadAirports();
    loadInfoCards();

    // Cargar aeropuertos en los selectores de vuelos
    const originSelect = document.getElementById('originAirport');
    const destinationSelect = document.getElementById('destinationAirport');
    
    if (originSelect && destinationSelect) {
        mockData.airports.forEach(airport => {
            originSelect.innerHTML += `<option value="${airport.code}">${airport.name}</option>`;
            destinationSelect.innerHTML += `<option value="${airport.code}">${airport.name}</option>`;
        });
    }

    // Event listeners para scroll
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Verificar estado inicial

    // Event listeners para botón flotante
    const floatingBtn = document.getElementById('floatingSalaEspera');
    if (floatingBtn) {
        floatingBtn.addEventListener('click', openReservationModal);
    }

    // Event listeners para modal de reservación
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }

    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeReservationModal);
    }

    const cancelReservationBtn = document.getElementById('cancelReservation');
    if (cancelReservationBtn) {
        cancelReservationBtn.addEventListener('click', closeReservationModal);
    }

    // Cerrar modal al hacer click fuera
    const reservationModal = document.getElementById('reservationModal');
    if (reservationModal) {
        reservationModal.addEventListener('click', (e) => {
            if (e.target === reservationModal) {
                closeReservationModal();
            }
        });
    }

    // Event listeners para sala de espera
    const cancelWaitingBtn = document.getElementById('cancelWaiting');
    if (cancelWaitingBtn) {
        cancelWaitingBtn.addEventListener('click', closeWaitingRoom);
    }

    const waitingRoomModal = document.getElementById('waitingRoomModal');
    if (waitingRoomModal) {
        waitingRoomModal.addEventListener('click', (e) => {
            if (e.target === waitingRoomModal) {
                // No permitir cerrar haciendo click fuera en la sala de espera
                // Solo se puede cancelar con el botón
            }
        });
    }

    // Event listeners existentes
    const airportSearch = document.getElementById('airportSearch');
    if (airportSearch) {
        airportSearch.addEventListener('input', (e) => {
            loadAirports(e.target.value);
        });
    }

    const searchParkingBtn = document.getElementById('searchParking');
    if (searchParkingBtn) {
        searchParkingBtn.addEventListener('click', searchParking);
    }

    const searchFlightBtn = document.getElementById('searchFlight');
    if (searchFlightBtn) {
        searchFlightBtn.addEventListener('click', searchFlights);
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const secondaryNav = document.querySelector('.secondary-nav');
            if (secondaryNav) {
                secondaryNav.style.display = secondaryNav.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
});

