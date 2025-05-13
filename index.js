// Este archivo es un punto de entrada para Vercel
console.log('Vercel deployment starting via root index.js');

// Importar el archivo compilado usando require
// Nota: Debemos exportar la aplicación desde dist/index.js para que esto funcione
module.exports = require('./dist/index.js'); 