/**
 * Widget de Reserva Sala VIP Aena
 * Maneja el formulario y la integración con filavirtual
 */

// Instancia del servicio de API
const api = new AenaApiService();

// Token de filavirtual
const FILAVIRTUAL_TOKEN = 'l13h4QS8h7ILVDAOduVpAwghCuG6LM5grbHRD9Nb';

// Variables globales
let currentTurnoId = null;
let turnoCheckInterval = null;

/**
 * Configurar token de filavirtual
 */
function configureFilavirtualToken() {
    api.setFilavirtualToken(FILAVIRTUAL_TOKEN);
}

/**
 * Mostrar mensaje
 */
function showMessage(message, type = 'error') {
    const messageContainer = document.getElementById('messageContainer');
    const messageEl = document.getElementById('message');
    
    if (messageContainer && messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageContainer.style.display = 'block';
        
        // Ocultar después de 5 segundos si es éxito
        if (type === 'success') {
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 5000);
        }
    }
}

/**
 * Ocultar mensaje
 */
function hideMessage() {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.style.display = 'none';
    }
}

/**
 * Mostrar sala de espera
 */
function showWaitingRoom(turnoData) {
    const waitingRoom = document.getElementById('waitingRoom');
    const turnInfo = document.getElementById('turnInfo');
    
    if (waitingRoom) {
        waitingRoom.style.display = 'flex';
        
        if (turnInfo && turnoData) {
            turnInfo.innerHTML = `
                <p>Turno #${turnoData.id || 'Generado'}</p>
                ${turnoData.posicion ? `<p style="font-size: 12px; margin-top: 5px;">Posición en cola: ${turnoData.posicion}</p>` : ''}
            `;
        }
        
        // Iniciar verificación del estado del turno
        if (turnoData?.id) {
            currentTurnoId = turnoData.id;
            startTurnoStatusCheck();
        }
    }
}

/**
 * Ocultar sala de espera
 */
function hideWaitingRoom() {
    const waitingRoom = document.getElementById('waitingRoom');
    if (waitingRoom) {
        waitingRoom.style.display = 'none';
    }
    
    // Detener verificación
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
            const { estado, agenteListo, videoCallUrl, confirmado } = response.data;
            
            if (confirmado || agenteListo) {
                // El turno está confirmado
                clearInterval(turnoCheckInterval);
                hideWaitingRoom();
                showMessage('¡Turno confirmado! Te contactaremos pronto.', 'success');
            } else if (estado === 'cancelado' || estado === 'finalizado') {
                clearInterval(turnoCheckInterval);
                hideWaitingRoom();
                showMessage('El turno ha sido cancelado.', 'error');
            }
        }
    }, 3000); // Verificar cada 3 segundos
}

/**
 * Manejar envío del formulario
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    hideMessage();
    
    const form = e.target;
    const formData = {
        salaVIP: form.salaVIP.value,
        sucursal: form.sucursal.value,
        nombre: form.nombre.value.trim(),
        apellido: form.apellido.value.trim(),
        codigoPais: form.codigoPais.value,
        telefono: form.telefono.value.trim(),
        acompanantes: parseInt(form.acompanantes.value) || 0,
        email: form.email.value.trim()
    };

    // Validación de términos y condiciones
    const acceptTerms = form.acceptTerms.checked;
    if (!acceptTerms) {
        showMessage('Debes aceptar los Términos y Condiciones para continuar.', 'error');
        // Scroll al checkbox
        document.getElementById('acceptTerms').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Validación
    if (!formData.nombre || !formData.apellido || !formData.telefono || !formData.email) {
        showMessage('Por favor, completa todos los campos obligatorios.', 'error');
        return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showMessage('Por favor, ingresa un email válido.', 'error');
        return;
    }

    // Validar teléfono
    if (formData.telefono.length < 6) {
        showMessage('Por favor, ingresa un número de teléfono válido.', 'error');
        return;
    }

    // Deshabilitar botón
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Procesando...';
    if (btnLoader) btnLoader.style.display = 'inline-block';

    try {
        // Preparar datos para filavirtual
        const telefonoCompleto = `${formData.codigoPais}${formData.telefono}`;
        
        const filavirtualData = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: telefonoCompleto,
            email: formData.email,
            servicio: `Sala VIP - ${formData.sucursal === 'barajas-t1' ? 'Barajas Sala VIP T1' : 'Barajas Sala VIP Neptuno T4S'}`,
            canal: 'web',
            tipo: 'presencial',
            idioma: formData.salaVIP,
            acompanantes: formData.acompanantes,
            metadata: {
                salaVIP: formData.salaVIP,
                sucursal: formData.sucursal,
                idioma: formData.salaVIP
            }
        };

        // Generar turno usando filavirtual
        const response = await api.generateTurnoFilavirtual(filavirtualData);

        if (response.success && response.data) {
            // Turno generado exitosamente
            showWaitingRoom(response.data);
        } else {
            // Error al generar turno
            showMessage('Error al generar el turno: ' + (response.error || 'Error desconocido. Por favor, intenta nuevamente.'), 'error');
            submitBtn.disabled = false;
            if (btnText) btnText.textContent = 'Reservar';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    } catch (error) {
        console.error('Error en handleFormSubmit:', error);
        showMessage('Error al procesar la solicitud. Por favor, intenta nuevamente.', 'error');
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Reservar';
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

/**
 * Inicialización
 */
document.addEventListener('DOMContentLoaded', () => {
    // Configurar token
    configureFilavirtualToken();

    // Event listener para el formulario
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Event listener para cancelar sala de espera
    const cancelWaitingBtn = document.getElementById('cancelWaiting');
    if (cancelWaitingBtn) {
        cancelWaitingBtn.addEventListener('click', () => {
            hideWaitingRoom();
            showMessage('Turno cancelado.', 'error');
        });
    }

    // Event listeners para modal de términos y condiciones
    const openTermsBtn = document.getElementById('openTermsBtn');
    const termsModal = document.getElementById('termsModal');
    const closeTermsModal = document.getElementById('closeTermsModal');

    if (openTermsBtn && termsModal) {
        openTermsBtn.addEventListener('click', () => {
            termsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeTermsModal && termsModal) {
        closeTermsModal.addEventListener('click', () => {
            termsModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Cerrar modal al hacer click fuera
    if (termsModal) {
        termsModal.addEventListener('click', (e) => {
            if (e.target === termsModal) {
                termsModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Prevenir zoom en iOS al hacer focus en inputs
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (window.innerWidth < 768) {
                input.style.fontSize = '16px';
            }
        });
    });
});

