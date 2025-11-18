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
let currentLanguage = 'es'; // Idioma por defecto: español

// Traducciones
const translations = {
    es: {
        title: 'Reserva Sala VIP',
        terminal: 'Terminal',
        selectTerminal: 'Selecciona una terminal',
        vipLounge: 'Sala VIP',
        selectLounge: 'Selecciona una sala',
        firstName: 'Nombre',
        lastName: 'Apellido',
        phone: 'Teléfono',
        companions: 'Acompañantes',
        companionsHelp: 'Número de personas que te acompañarán (incluyéndote a ti)',
        email: 'Email',
        legalText: 'Al continuar, aceptas nuestras políticas:',
        numiaPrivacy: 'Política de privacidad de datos de Numia',
        qualitySecurity: 'Política de Calidad y Seguridad',
        aenaPrivacy: 'Política de Privacidad Aena',
        viewTerms: 'Ver Términos y Condiciones de Aena',
        acceptTerms: 'Acepto los Términos y Condiciones de Aena',
        reserve: 'Reservar',
        turnGenerated: 'Turno Generado',
        turnCode: 'Código del turno:',
        cancelMyTurn: 'Cancelar mi turno',
        processing: 'Procesando...',
        turnCanceled: 'Turno cancelado exitosamente',
        errorCanceling: 'Error al cancelar el turno'
    },
    en: {
        title: 'Reserve VIP Lounge',
        terminal: 'Terminal',
        selectTerminal: 'Select a terminal',
        vipLounge: 'VIP Lounge',
        selectLounge: 'Select a lounge',
        firstName: 'First Name',
        lastName: 'Last Name',
        phone: 'Phone',
        companions: 'Companions',
        companionsHelp: 'Number of people who will accompany you (including yourself)',
        email: 'Email',
        legalText: 'By continuing, you accept our policies:',
        numiaPrivacy: 'Numia Data Privacy Policy',
        qualitySecurity: 'Quality and Security Policy',
        aenaPrivacy: 'Aena Privacy Policy',
        viewTerms: 'View Aena Terms and Conditions',
        acceptTerms: 'I accept Aena Terms and Conditions',
        reserve: 'Reserve',
        turnGenerated: 'Turn Generated',
        turnCode: 'Turn code:',
        cancelMyTurn: 'Cancel my turn',
        processing: 'Processing...',
        turnCanceled: 'Turn canceled successfully',
        errorCanceling: 'Error canceling turn'
    }
};

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
 * Cambiar idioma del formulario
 */
function changeLanguage(lang) {
    currentLanguage = lang;
    
    // Actualizar botones de idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Actualizar todos los textos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Actualizar placeholders
    const phoneInput = document.getElementById('telefono');
    if (phoneInput) {
        phoneInput.placeholder = lang === 'es' ? '123456789' : '123456789';
    }
}

/**
 * Mostrar popup de turno encolado
 */
function showTurnModal(turnoData) {
    const turnModal = document.getElementById('turnModal');
    const turnCodeDisplay = document.getElementById('turnCodeDisplay');
    
    if (turnModal) {
        // Obtener código del turno
        const turnCode = turnoData?.id || turnoData?.turnoId || turnoData?.data?.id || turnoData?.codigo || 'N/A';
        
        if (turnCodeDisplay) {
            turnCodeDisplay.textContent = turnCode;
        }
        
        // Guardar ID del turno para cancelación
        currentTurnoId = turnCode;
        
        // Mostrar modal
        turnModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Actualizar traducciones del modal
        changeLanguage(currentLanguage);
    }
}

/**
 * Ocultar popup de turno
 */
function hideTurnModal() {
    const turnModal = document.getElementById('turnModal');
    if (turnModal) {
        turnModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    currentTurnoId = null;
}

/**
 * Cancelar turno
 */
async function cancelTurn() {
    if (!currentTurnoId) {
        showMessage(translations[currentLanguage].errorCanceling, 'error');
        return;
    }
    
    if (!confirm(currentLanguage === 'es' ? '¿Estás seguro de que deseas cancelar tu turno?' : 'Are you sure you want to cancel your turn?')) {
        return;
    }
    
    try {
        const response = await api.cancelTurnoFilavirtual(currentTurnoId);
        
        if (response.success) {
            showMessage(translations[currentLanguage].turnCanceled, 'success');
            hideTurnModal();
        } else {
            showMessage(translations[currentLanguage].errorCanceling + ': ' + (response.error || ''), 'error');
        }
    } catch (error) {
        console.error('Error cancelando turno:', error);
        showMessage(translations[currentLanguage].errorCanceling, 'error');
    }
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
    if (btnText) btnText.textContent = translations[currentLanguage].processing;
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
            showTurnModal(response.data);
        } else {
            // Error al generar turno
            showMessage('Error al generar el turno: ' + (response.error || 'Error desconocido. Por favor, intenta nuevamente.'), 'error');
            submitBtn.disabled = false;
            if (btnText) btnText.textContent = translations[currentLanguage].reserve;
            if (btnLoader) btnLoader.style.display = 'none';
        }
    } catch (error) {
        console.error('Error en handleFormSubmit:', error);
        showMessage('Error al procesar la solicitud. Por favor, intenta nuevamente.', 'error');
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = translations[currentLanguage].reserve;
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

    // Event listeners para selector de idioma
    const langEsBtn = document.getElementById('langEs');
    const langEnBtn = document.getElementById('langEn');
    
    if (langEsBtn) {
        langEsBtn.addEventListener('click', () => changeLanguage('es'));
    }
    
    if (langEnBtn) {
        langEnBtn.addEventListener('click', () => changeLanguage('en'));
    }
    
    // Inicializar con español
    changeLanguage('es');
    
    // Event listener para cancelar turno
    const cancelTurnBtn = document.getElementById('cancelTurnBtn');
    if (cancelTurnBtn) {
        cancelTurnBtn.addEventListener('click', cancelTurn);
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

