#!/bin/bash

# Imprimir mensaje de inicio
echo "Iniciando build personalizado para Vercel..."

# Ejecutar el build normal
npm run build

# Crear un archivo index.js en la raíz que importa el archivo compilado
cat > index.js << EOF
// Este archivo es un punto de entrada para Vercel
import './dist/index.js';
console.log('Vercel deployment initialized');
EOF

echo "Build personalizado completado." 