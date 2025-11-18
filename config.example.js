/**
 * Archivo de configuración de ejemplo
 * Copia este archivo como config.js y configura tus tokens
 */

// Configuración de Filavirtual
const FILAVIRTUAL_CONFIG = {
    // Token de autenticación de filavirtual
    // Obtén este token desde el panel de administración de filavirtual
    token: 'YOUR_FILAVIRTUAL_TOKEN_HERE',
    
    // URL base de la API de filavirtual
    baseURL: 'https://filavirtual2.debmedia.com/api',
    
    // Servicio/cola a usar (ej: 'Ventas', 'Atención', etc.)
    servicio: 'Ventas'
};

// Para usar en la aplicación:
// 1. Copia este archivo como config.js
// 2. Reemplaza YOUR_FILAVIRTUAL_TOKEN_HERE con tu token real
// 3. En app.js, importa y usa la configuración:
//    import { FILAVIRTUAL_CONFIG } from './config.js';
//    api.setFilavirtualToken(FILAVIRTUAL_CONFIG.token);

