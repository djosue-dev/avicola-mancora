-- ============================================================
-- SISTEMA AVICOLA - Script de base de datos para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================


-- ============================================================
-- TABLA: clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      text NOT NULL,
    telefono    text,
    direccion   text,
    ruc         text,
    activo      boolean NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Politicas clientes
CREATE POLICY "clientes_select" ON public.clientes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "clientes_insert" ON public.clientes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "clientes_update" ON public.clientes
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "clientes_delete" ON public.clientes
    FOR DELETE TO authenticated USING (true);


-- ============================================================
-- TABLA: ventas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ventas (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id      uuid NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
    fecha           date NOT NULL DEFAULT current_date,
    total_kg        numeric(10, 2) NOT NULL DEFAULT 0,
    precio_por_kg   numeric(10, 2) NOT NULL DEFAULT 0,
    monto_total     numeric(10, 2) GENERATED ALWAYS AS (total_kg * precio_por_kg) STORED,
    observaciones   text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;

-- Politicas ventas
CREATE POLICY "ventas_select" ON public.ventas
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "ventas_insert" ON public.ventas
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "ventas_update" ON public.ventas
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "ventas_delete" ON public.ventas
    FOR DELETE TO authenticated USING (true);


-- ============================================================
-- TABLA: pesos_lotes
-- (Registro de entrada/salida de pollos y ajustes de stock)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pesos_lotes (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha               date NOT NULL DEFAULT current_date,
    descripcion         text NOT NULL,
    tipo                text NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
    cantidad_pollos     int NOT NULL DEFAULT 0,
    peso_promedio_kg    numeric(8, 3) NOT NULL DEFAULT 0,
    peso_total_kg       numeric(10, 2) GENERATED ALWAYS AS (cantidad_pollos * peso_promedio_kg) STORED,
    created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pesos_lotes ENABLE ROW LEVEL SECURITY;

-- Politicas pesos_lotes
CREATE POLICY "pesos_lotes_select" ON public.pesos_lotes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "pesos_lotes_insert" ON public.pesos_lotes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "pesos_lotes_update" ON public.pesos_lotes
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "pesos_lotes_delete" ON public.pesos_lotes
    FOR DELETE TO authenticated USING (true);


-- ============================================================
-- VISTA: stock_actual
-- Calcula el stock disponible sumando entradas y restando salidas
-- ============================================================
CREATE OR REPLACE VIEW public.stock_actual AS
SELECT
    COALESCE(SUM(
        CASE tipo
            WHEN 'entrada' THEN peso_total_kg
            WHEN 'salida'  THEN -peso_total_kg
            WHEN 'ajuste'  THEN peso_total_kg  -- puede ser positivo o negativo segun el registro
            ELSE 0
        END
    ), 0) AS stock_kg
FROM public.pesos_lotes;


-- ============================================================
-- TABLA: configuracion
-- Fila unica con los parametros del sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS public.configuracion (
    id                  int PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- solo una fila
    stock_minimo_kg     numeric(10, 2) NOT NULL DEFAULT 1000,
    precio_base_kg      numeric(10, 2) NOT NULL DEFAULT 3.00,
    nombre_negocio      text NOT NULL DEFAULT 'Avicola',
    ruc_negocio         text,
    updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- Politicas configuracion
CREATE POLICY "configuracion_select" ON public.configuracion
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "configuracion_update" ON public.configuracion
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Insertar la fila inicial de configuracion
INSERT INTO public.configuracion (id, stock_minimo_kg, precio_base_kg, nombre_negocio)
VALUES (1, 1000, 3.00, 'Avicola del Norte')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- TRIGGER: actualizar updated_at en configuracion
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_configuracion_updated_at
    BEFORE UPDATE ON public.configuracion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- INDICES para mejor rendimiento en consultas frecuentes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ventas_fecha       ON public.ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente_id  ON public.ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pesos_lotes_fecha  ON public.pesos_lotes(fecha);
CREATE INDEX IF NOT EXISTS idx_pesos_lotes_tipo   ON public.pesos_lotes(tipo);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre    ON public.clientes(nombre);
