#!/bin/bash

echo "🧹 Limpiando TODAS las bases de datos..."
echo ""

# ============================================
# LIMPIAR MySQL (Auth)
# ============================================
echo "🔵 Limpiando MySQL (Auth)..."

# Opción 1: Con usuario auth_user
mysql -u auth_user -pauth_pass proticket_auth << SQL 2>/dev/null
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;
SELECT CONCAT('✅ Usuarios en MySQL: ', COUNT(*)) as resultado FROM users;
SQL

# Si falla, intentar con root
if [ $? -ne 0 ]; then
    echo "Intentando con usuario root de MySQL..."
    sudo mysql -u root proticket_auth << SQL
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;
SELECT CONCAT('✅ Usuarios en MySQL: ', COUNT(*)) as resultado FROM users;
SQL
fi

echo ""

# ============================================
# LIMPIAR PostgreSQL (Business)
# ============================================
echo "🟢 Limpiando PostgreSQL (Business)..."

sudo -u postgres psql proticket_business_logic << SQL
TRUNCATE TABLE tickets RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE events RESTART IDENTITY CASCADE;
TRUNCATE TABLE organizers RESTART IDENTITY CASCADE;
SELECT '✅ Eventos en PostgreSQL: ' || COUNT(*) FROM events;
SELECT '✅ Órdenes en PostgreSQL: ' || COUNT(*) FROM orders;
SQL

echo ""

# ============================================
# CREAR ROL ADMIN en MySQL
# ============================================
echo "👑 Creando rol admin en MySQL..."

mysql -u auth_user -pauth_pass proticket_auth << SQL 2>/dev/null
INSERT INTO roles (role_name) VALUES ('admin') 
ON DUPLICATE KEY UPDATE role_name = role_name;
SELECT '✅ Roles disponibles:' as '';
SELECT * FROM roles;
SQL

if [ $? -ne 0 ]; then
    sudo mysql -u root proticket_auth << SQL
INSERT INTO roles (role_name) VALUES ('admin') 
ON DUPLICATE KEY UPDATE role_name = role_name;
SELECT '✅ Roles disponibles:' as '';
SELECT * FROM roles;
SQL
fi

echo ""
echo "✅ Todas las bases de datos limpiadas y configuradas!"

chmod +x scripts/clean_all_databases.sh