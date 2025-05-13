#!/bin/bash

# Ejecutar el build normal
npm run build

# Crear un pequeño script que ayude a Vercel a iniciar la aplicación correctamente
cat > vercel.js << EOF
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import express from "express";
import fs from "fs";

// Importar el archivo compilado
import "./dist/index.js";

// Este archivo existe solo para asegurar que Vercel inicie correctamente la aplicación
console.log("Vercel deployment helper initialized");
EOF

# Dar permisos de ejecución al script
chmod +x vercel-build.sh 