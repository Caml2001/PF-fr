/**
 * Este archivo proporciona configuración adicional para Vercel
 * Es utilizado por Vercel para personalizar el despliegue
 */

module.exports = {
  // Personaliza el build
  build: {
    env: {
      // Variables de entorno especiales para Vercel
      NODE_ENV: 'production'
    }
  },
  // Ajustar cómo se inicia la aplicación
  start: {
    command: 'node index.js'
  }
}; 