#!/bin/bash

echo "🔧 Creando usuario ADMIN..."
echo ""
echo "Por favor ingresa los datos del administrador:"
echo ""

read -p "Email del admin: " ADMIN_EMAIL
read -sp "Contraseña del admin: " ADMIN_PASSWORD
echo ""
read -p "Nombre del admin: " ADMIN_NAME

curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"role\": \"admin\"
  }"

echo ""
echo "✅ Usuario admin creado (si no existía)"