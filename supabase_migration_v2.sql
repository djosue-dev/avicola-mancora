-- ============================================================
-- SISTEMA AVICOLA MANCORA - Migración v2
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- NOTA: Este script AGREGA tablas nuevas. No elimina las existentes.
-- ============================================================

-- ============================================================
-- TABLA: zones (Zonas de despacho)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.zones (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      text NOT NULL,
    prioridad   int  NOT NULL DEFAULT 1,
    eliminado   boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "zones_select" ON public.zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "zones_insert" ON public.zones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "zones_update" ON public.zones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "zones_delete" ON public.zones FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_zones_prioridad ON public.zones(prioridad);


-- ============================================================
-- TABLA: clients (Clientes, vinculados a zonas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          text NOT NULL,
    zone_id         uuid REFERENCES public.zones(id) ON DELETE SET NULL,
    precio_defecto  numeric(10, 2) NOT NULL DEFAULT 0,
    corte_defecto   text NOT NULL DEFAULT 'Entero',
    eliminado       boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "clients_insert" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "clients_update" ON public.clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "clients_delete" ON public.clients FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_clients_zone_id ON public.clients(zone_id);
CREATE INDEX IF NOT EXISTS idx_clients_nombre   ON public.clients(nombre);


-- ============================================================
-- TABLA: settings (Configuración global - solo 1 fila)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id              int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    peso_tina_kg    numeric(8, 3) NOT NULL DEFAULT 3.000,
    updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_update" ON public.settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Fila inicial de configuración
INSERT INTO public.settings (id, peso_tina_kg)
VALUES (1, 3.000)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- TABLA: daily_inventory (Apertura de día)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_inventory (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha               date NOT NULL UNIQUE DEFAULT current_date,
    pollos_iniciales    int NOT NULL DEFAULT 0,
    kilos_iniciales     numeric(10, 2) NOT NULL DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_inventory_select" ON public.daily_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "daily_inventory_insert" ON public.daily_inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "daily_inventory_update" ON public.daily_inventory FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_daily_inventory_fecha ON public.daily_inventory(fecha);


-- ============================================================
-- TABLA: orders (Pizarra de pedidos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id           uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    fecha               date NOT NULL DEFAULT current_date,
    hora_limite         time NOT NULL,
    cantidad_solicitada int NOT NULL DEFAULT 0,
    estado              text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado')),
    eliminado           boolean NOT NULL DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "orders_delete" ON public.orders FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_orders_fecha     ON public.orders(fecha);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);


-- ============================================================
-- TABLA: records (Pesajes - Tabla maestra)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.records (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_registro   text NOT NULL CHECK (tipo_registro IN ('camal', 'proceso')),
    user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    client_id       uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    order_id        uuid REFERENCES public.orders(id) ON DELETE SET NULL,  -- nullable
    peso_bruto      numeric(10, 3) NOT NULL,
    cant_tinas      int NOT NULL DEFAULT 0,
    cant_pollos     int,           -- nullable para tipo 'proceso'
    peso_neto       numeric(10, 3) NOT NULL,
    tipo_corte      text,          -- nullable para tipo 'camal' (Entero, Pecho, Pierna, Menudencia, etc.)
    precio_aplicado numeric(10, 2),-- nullable para tipo 'camal'
    foto_url        text,          -- URL a Supabase Storage
    eliminado       boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "records_select" ON public.records FOR SELECT TO authenticated USING (true);
CREATE POLICY "records_insert" ON public.records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "records_update" ON public.records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "records_delete" ON public.records FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_records_created_at   ON public.records(created_at);
CREATE INDEX IF NOT EXISTS idx_records_client_id    ON public.records(client_id);
CREATE INDEX IF NOT EXISTS idx_records_tipo         ON public.records(tipo_registro);
CREATE INDEX IF NOT EXISTS idx_records_order_id     ON public.records(order_id);
CREATE INDEX IF NOT EXISTS idx_records_eliminado    ON public.records(eliminado);


-- ============================================================
-- TRIGGER: actualizar updated_at en settings
-- ============================================================
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();


-- ============================================================
-- STORAGE: Bucket para fotos de balanza
-- Ejecutar manualmente en Supabase Dashboard > Storage
-- O descomentar si el cliente de Supabase lo permite via SQL:
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('balanza-fotos', 'balanza-fotos', true)
-- ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- INSTRUCCIONES DE ROLES (user_metadata en Supabase Auth)
-- ============================================================
-- Para asignar un rol a un usuario desde el Dashboard de Supabase:
-- 1. Ir a Authentication > Users > seleccionar usuario
-- 2. En "User Metadata" agregar: { "rol": "admin" }
--    Valores válidos: "admin", "pesador", "digitador"
--
-- Para crear usuarios con rol programáticamente (desde apiAuth.js):
-- supabase.auth.signUp({ email, password, options: { data: { rol: 'pesador' } } })
-- ============================================================


-- ============================================================
-- VISTA ÚTIL: Resumen del día con totales
-- ============================================================
CREATE OR REPLACE VIEW public.resumen_dia AS
SELECT
    current_date AS fecha,
    COALESCE(di.pollos_iniciales, 0) AS pollos_iniciales,
    COALESCE(di.kilos_iniciales, 0)  AS kilos_iniciales,
    COUNT(r.id) FILTER (WHERE r.eliminado = false AND DATE(r.created_at) = current_date) AS total_registros_hoy,
    COALESCE(SUM(r.peso_neto) FILTER (WHERE r.eliminado = false AND DATE(r.created_at) = current_date), 0) AS total_kg_hoy
FROM
    public.daily_inventory di
    LEFT JOIN public.records r ON TRUE
WHERE
    di.fecha = current_date
GROUP BY di.pollos_iniciales, di.kilos_iniciales;
