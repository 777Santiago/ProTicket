-- Script para migrar la columna creator_user_id de VARCHAR a UUID
-- Ejecutar en PostgreSQL si la columna es VARCHAR

-- Paso 1: Verificar el tipo actual de la columna
-- SELECT data_type FROM information_schema.columns 
-- WHERE table_name = 'events' AND column_name = 'creator_user_id';

-- Paso 2: Si es VARCHAR, convertir a UUID
-- Primero, eliminar valores inválidos (si los hay)
-- UPDATE events SET creator_user_id = NULL WHERE creator_user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Paso 3: Cambiar el tipo de columna
-- ALTER TABLE events 
-- ALTER COLUMN creator_user_id TYPE UUID USING creator_user_id::UUID;

-- NOTA: Si hay errores, puede ser necesario hacerlo en pasos:
-- 1. Crear columna temporal
-- ALTER TABLE events ADD COLUMN creator_user_id_new UUID;
-- 
-- 2. Copiar datos convertidos
-- UPDATE events SET creator_user_id_new = creator_user_id::UUID WHERE creator_user_id IS NOT NULL;
-- 
-- 3. Eliminar columna antigua
-- ALTER TABLE events DROP COLUMN creator_user_id;
-- 
-- 4. Renombrar nueva columna
-- ALTER TABLE events RENAME COLUMN creator_user_id_new TO creator_user_id;

