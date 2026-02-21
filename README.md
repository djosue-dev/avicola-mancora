# Sistema Avicola — Documentacion Tecnica

**Version:** 1.0.0
**Fecha de registro:** 21/02/2026
**Arquitectura:** SPA (Single Page Application) con backend-as-a-service (Supabase)

---

## 1. Descripcion del sistema

El Sistema Avicola es una aplicacion web de gestion interna orientada al control operativo de una avicola. Centraliza el registro de ventas, el control de stock de pollos por peso, la administracion de clientes y la configuracion de parametros del negocio. La interfaz replica la identidad grafica del sistema de referencia (`project-hoteles`), manteniendo coherencia visual con el ecosistema existente de aplicaciones de la organizacion.

---

## 2. Stack tecnologico

| Tecnologia | Version | Rol en el sistema |
|---|---|---|
| React | 18 | Libreria de UI basada en componentes |
| Vite | 4 | Herramienta de build y servidor de desarrollo |
| Styled Components | 6 | Estilos encapsulados por componente (CSS-in-JS) |
| React Query | 4 | Gestion de estado del servidor, cache y sincronizacion |
| React Router DOM | 6 | Enrutamiento del lado del cliente (SPA) |
| React Hook Form | 7 | Manejo de formularios con validacion |
| React Hot Toast | 2 | Notificaciones no intrusivas al usuario |
| React Icons | 5 | Biblioteca de iconos SVG (sin emojis) |
| Supabase JS | 2 | SDK de cliente para base de datos PostgreSQL y autenticacion |
| date-fns | 3 | Utilidades de formateo y manipulacion de fechas |

---

## 3. Arquitectura de la aplicacion

```
avicola-sytem/
├── public/                          Activos estaticos (logos, imagenes)
├── src/
│   ├── context/
│   │   └── DarkModeContext.jsx      Contexto global para modo oscuro/claro
│   ├── features/
│   │   ├── authentication/          Modulo de autenticacion (Login, Logout, Avatar)
│   │   │   ├── LoginForm.jsx
│   │   │   ├── Logout.jsx
│   │   │   ├── UserAvatar.jsx
│   │   │   ├── useLogin.js
│   │   │   ├── useLogout.js
│   │   │   └── useUser.js
│   │   ├── ventas/                  Modulo de ventas (hooks y componentes)
│   │   ├── pesos/                   Modulo de pesos y stock
│   │   └── clientes/                Modulo de clientes
│   ├── hooks/
│   │   ├── useLocalStorageState.js  Hook de persistencia en localStorage
│   │   └── useOutsideClick.js       Hook de deteccion de click externo
│   ├── pages/
│   │   ├── Dashboard.jsx            Vista de KPIs y resumen operativo
│   │   ├── Ventas.jsx               Gestion de ventas
│   │   ├── Pesos.jsx                Control de stock y movimientos de lotes
│   │   ├── Clientes.jsx             Administracion de clientes
│   │   ├── Reportes.jsx             Reportes por periodo
│   │   ├── Configuracion.jsx        Parametros del sistema
│   │   ├── Login.jsx                Autenticacion
│   │   └── PageNotFound.jsx         Pagina 404
│   ├── services/
│   │   ├── supabase.js              Inicializacion del cliente Supabase
│   │   ├── apiAuth.js               Servicios de autenticacion
│   │   ├── apiClientes.js           Servicios de clientes
│   │   ├── apiVentas.js             Servicios de ventas
│   │   └── apiPesos.js              Servicios de pesos y lotes
│   ├── styles/
│   │   └── GlobalStyles.js          Variables CSS globales y reset
│   ├── ui/                          Componentes de UI reutilizables
│   │   ├── AppLayout.jsx            Grilla principal de la aplicacion
│   │   ├── Sidebar.jsx              Barra lateral de navegacion
│   │   ├── MainNav.jsx              Menu de navegacion principal
│   │   ├── Header.jsx               Cabecera con avatar y controles
│   │   ├── Button.jsx               Boton con variantes (primary, secondary, danger)
│   │   ├── Table.jsx                Tabla reutilizable con contexto
│   │   ├── Modal.jsx                Modal con portal y deteccion de click externo
│   │   ├── Form.jsx / FormRow.jsx   Componentes de formulario
│   │   ├── Input.jsx                Input estilizado
│   │   ├── Heading.jsx              Encabezados tipograficos
│   │   └── Spinner.jsx              Indicador de carga
│   ├── App.jsx                      Configuracion de rutas y providers
│   └── main.jsx                     Punto de entrada de la aplicacion
├── .env                             Variables de entorno (credenciales Supabase)
├── supabase_schema.sql              Definicion del esquema de base de datos
├── index.html                       HTML base con fuentes Poppins y Sono
├── package.json
└── vite.config.js
```

---

## 4. Modelo de datos (Supabase / PostgreSQL)

### 4.1 Tabla `clientes`
Almacena el directorio de clientes de la avicola. El campo `activo` permite dar de baja logica sin eliminar registros historicos.

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | uuid (PK) | Identificador unico generado automaticamente |
| `nombre` | text | Nombre completo del cliente o razon social |
| `telefono` | text | Numero de contacto |
| `direccion` | text | Direccion del cliente |
| `ruc` | text | RUC o DNI (opcional) |
| `activo` | boolean | Estado logico del cliente (default: true) |
| `created_at` | timestamptz | Marca temporal de creacion |

### 4.2 Tabla `ventas`
Registra cada transaccion de venta. El campo `monto_total` es una columna generada que resulta del producto entre `total_kg` y `precio_por_kg`, garantizando consistencia sin logica de calculo en el cliente.

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | uuid (PK) | Identificador unico generado automaticamente |
| `cliente_id` | uuid (FK) | Referencia a `clientes.id` |
| `fecha` | date | Fecha de la venta |
| `total_kg` | numeric(10,2) | Peso total en kilogramos |
| `precio_por_kg` | numeric(10,2) | Precio unitario por kilogramo |
| `monto_total` | numeric (GENERATED) | Calculado automaticamente: `total_kg * precio_por_kg` |
| `observaciones` | text | Notas adicionales (opcional) |
| `created_at` | timestamptz | Marca temporal de registro |

### 4.3 Tabla `pesos_lotes`
Controla los movimientos de inventario (entradas, salidas y ajustes). El campo `peso_total_kg` es generado a partir de `cantidad_pollos * peso_promedio_kg`.

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | uuid (PK) | Identificador unico generado automaticamente |
| `fecha` | date | Fecha del movimiento |
| `descripcion` | text | Descripcion del lote o movimiento |
| `tipo` | text | Enum: `entrada`, `salida`, `ajuste` |
| `cantidad_pollos` | int | Numero de pollos del movimiento |
| `peso_promedio_kg` | numeric(8,3) | Peso promedio individual por pollo |
| `peso_total_kg` | numeric (GENERATED) | Calculado automaticamente: `cantidad_pollos * peso_promedio_kg` |
| `created_at` | timestamptz | Marca temporal de registro |

### 4.4 Tabla `configuracion`
Tabla de fila unica (id = 1) que almacena los parametros operativos del sistema. Gestionada mediante UPDATE exclusivamente.

| Campo | Tipo | Descripcion |
|---|---|---|
| `id` | int (PK) | Siempre 1 (restriccion de fila unica) |
| `stock_minimo_kg` | numeric(10,2) | Umbral minimo de stock para activar alertas |
| `precio_base_kg` | numeric(10,2) | Precio de referencia por kilogramo |
| `nombre_negocio` | text | Razon social del negocio |
| `ruc_negocio` | text | RUC del negocio |
| `updated_at` | timestamptz | Actualizado automaticamente por trigger |

### 4.5 Vista `stock_actual`
Vista calculada que agrega el stock disponible en tiempo real, sumando entradas y restando salidas del historial de `pesos_lotes`.

---

## 5. Seguridad (Row Level Security)

Todas las tablas tienen RLS habilitado. Las politicas vigentes permiten operaciones completas (SELECT, INSERT, UPDATE, DELETE) exclusivamente a usuarios con sesion autenticada (`role = authenticated`). La tabla `configuracion` no expone politicas de INSERT ni DELETE dada su naturaleza de fila unica.

---

## 6. Modulos del sistema

| Modulo | Ruta | Descripcion |
|---|---|---|
| Dashboard | `/dashboard` | KPIs operativos del dia: ventas, stock, clientes activos, alertas de stock bajo y ventas recientes |
| Ventas | `/ventas` | Listado historico de ventas con formulario de registro |
| Pesos y Stock | `/pesos` | Control de movimientos de lotes y visualizacion de stock actual vs. minimo |
| Clientes | `/clientes` | Directorio de clientes con operaciones de alta, edicion y baja |
| Reportes | `/reportes` | Reportes por periodo (en desarrollo) |
| Configuracion | `/configuracion` | Parametros del sistema: stock minimo, precio base y datos del negocio |

---

## 7. Variables de entorno

| Variable | Descripcion |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_KEY` | Clave anonima (anon key) del proyecto Supabase |

---

## 8. Identidad grafica

El sistema adopta la misma identidad visual del proyecto `project-hoteles`, incluyendo:
- **Fuentes:** Poppins (UI general) y Sono (datos numericos)
- **Paleta de colores:** sistema de variables CSS con soporte nativo para modo oscuro y claro
- **Componentes:** todos los elementos visuales (tablas, modales, formularios, botones) replican los estilos del sistema de referencia
- **Iconografia:** exclusivamente iconos SVG de la libreria `react-icons` (sin emojis)

## Tecnologias

| Tecnologia | Version |
|---|---|
| React | 18 |
| Vite | 4 |
| Styled Components | 6 |
| React Query | 4 |
| React Router DOM | 6 |
| React Hot Toast | 2 |
| React Icons | 5 |
| Supabase JS | 2 |
| date-fns | 3 |

## Estructura del proyecto

```
avicola-sytem/
├── public/                          ← Logos e imagenes
├── src/
│   ├── context/
│   │   └── DarkModeContext.jsx      ← Modo oscuro/claro
│   ├── features/authentication/     ← Login, Logout, UserAvatar, hooks
│   ├── hooks/                       ← useLocalStorageState, useOutsideClick
│   ├── pages/
│   │   ├── Dashboard.jsx            ← KPIs: ventas del dia, stock, alertas
│   │   ├── Ventas.jsx               ← Tabla + formulario nueva venta
│   │   ├── Pesos.jsx                ← Stock, alertas y registro de lotes
│   │   ├── Clientes.jsx             ← CRUD de clientes
│   │   ├── Reportes.jsx
│   │   ├── Configuracion.jsx        ← Stock minimo, precio base, etc.
│   │   ├── Login.jsx
│   │   └── PageNotFound.jsx
│   ├── services/
│   │   ├── supabase.js              ← Lee credenciales del .env
│   │   └── apiAuth.js
│   ├── styles/
│   │   └── GlobalStyles.js          ← Variables de color + fuentes
│   ├── ui/                          ← Componentes reutilizables
│   │   ├── AppLayout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MainNav.jsx
│   │   ├── Header.jsx
│   │   ├── Button.jsx
│   │   ├── Table.jsx
│   │   ├── Modal.jsx
│   │   ├── Form.jsx / FormRow.jsx
│   │   ├── Input.jsx
│   │   ├── Heading.jsx
│   │   ├── Spinner.jsx
│   │   └── ...
│   ├── App.jsx
│   └── main.jsx
├── .env                             ← Credenciales Supabase (NO subir a git)
├── index.html                       ← Fuentes Poppins + Sono
├── package.json
└── vite.config.js
```

## Configuracion Supabase

Las credenciales se leen del archivo `.env`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_KEY=
```

> **Importante:** Agregar `.env` en `.gitignore` para no exponer las credenciales.

## Esquema de tablas sugerido en Supabase

### `clientes`
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid (PK) | Identificador unico |
| nombre | text | Nombre del cliente |
| telefono | text | Telefono |
| direccion | text | Direccion |
| ruc | text | RUC o DNI (opcional) |
| created_at | timestamptz | Fecha de creacion |

### `ventas`
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid (PK) | Identificador unico |
| cliente_id | uuid (FK) | Referencia a clientes |
| fecha | date | Fecha de la venta |
| total_kg | numeric | Peso total vendido |
| precio_por_kg | numeric | Precio por kilogramo |
| monto_total | numeric | Monto total de la venta |
| observaciones | text | Notas adicionales |
| created_at | timestamptz | Fecha de registro |

### `pesos_lotes`
| Campo | Tipo | Descripcion |
|---|---|---|
| id | uuid (PK) | Identificador unico |
| fecha | date | Fecha del movimiento |
| descripcion | text | Descripcion del lote |
| tipo | text | 'entrada', 'salida', 'ajuste' |
| cantidad_pollos | int | Numero de pollos |
| peso_promedio | numeric | Peso promedio por pollo (kg) |
| peso_total | numeric | Peso total del lote (kg) |
| created_at | timestamptz | Fecha de registro |

### `configuracion`
| Campo | Tipo | Descripcion |
|---|---|---|
| id | int (PK) | Siempre 1 (fila unica) |
| stock_minimo_kg | numeric | Stock minimo de alerta |
| precio_base_kg | numeric | Precio base por kilo |
| nombre_negocio | text | Nombre de la avicola |
| ruc_negocio | text | RUC del negocio |

## Correr el proyecto

```bash
npm install
npm run dev
```

Accede en: **http://localhost:5173**

## Modulos implementados

- **Dashboard**: KPIs en tiempo real (ventas del dia, stock de peso, clientes activos, ventas semanales) + alertas de stock bajo + tabla de ventas recientes
- **Ventas**: Tabla de todas las ventas + modal para registrar nueva venta
- **Pesos y Stock**: Resumen de stock actual vs minimo + alertas + historial de movimientos de lotes
- **Clientes**: Tabla con busqueda + modal para crear/editar clientes
- **Reportes**: Reportes por periodo (pendiente de datos reales)
- **Configuracion**: Parametros del sistema (stock minimo, precio base, datos del negocio)
