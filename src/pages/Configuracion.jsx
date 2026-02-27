import { useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { HiPencil, HiTrash, HiPlus } from "react-icons/hi2";
import Row from "../ui/Row";

import {
    useZones, useCreateZone, useUpdateZone, useDeleteZone
} from "../hooks/useZones";
import {
    useClients, useCreateClient, useUpdateClient, useDeleteClient
} from "../hooks/useClients";
import { useSettings, useUpdateSettings } from "../hooks/useSettings";
import { createUser } from "../services/apiAuth";
import Heading from "../ui/Heading";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import toast from "react-hot-toast";

// ─── Tipos de corte ────────────────────────────────────────────────────────
const TIPOS_CORTE = ["Entero", "Pecho", "Pierna", "Ala", "Menudencia", "Mollejas", "Hígados"];
const ROLES = [
    { value: "admin", label: "Admin" },
    { value: "pesador", label: "Pesador" },
    { value: "digitador", label: "Digitador" },
];

// ─── Styled Components ─────────────────────────────────────────────────────

const Tabs = styled.div`
    display: flex;
    gap: 0.4rem;
    border-bottom: 2px solid var(--color-grey-200);
    margin-bottom: 2.4rem;
    flex-wrap: wrap;
`;

const Tab = styled.button`
    padding: 1rem 2rem;
    font-size: 1.5rem;
    font-weight: 600;
    border: none;
    background: transparent;
    cursor: pointer;
    color: ${(p) => (p.$active ? "var(--color-brand-600)" : "var(--color-grey-500)")};
    border-bottom: 3px solid ${(p) => (p.$active ? "var(--color-brand-600)" : "transparent")};
    margin-bottom: -2px;
    transition: all 0.2s;
    min-height: 4.4rem;
`;

const SectionCard = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem 4rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
`;

const TableWrapper = styled.div`
    overflow-x: auto;
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 1.4rem;

    thead th {
        text-align: left;
        padding: 1rem 1.2rem;
        background: var(--color-grey-50);
        color: var(--color-grey-600);
        font-weight: 700;
        border-bottom: 1px solid var(--color-grey-200);
    }
    tbody td {
        padding: 1rem 1.2rem;
        border-bottom: 1px solid var(--color-grey-100);
        color: var(--color-grey-700);
    }
    tbody tr:hover { background: var(--color-grey-50); }
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: 1.2rem;
    align-items: end;
    margin-top: 1.6rem;
`;

const FieldBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`;

const Label = styled.label`
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--color-grey-600);
`;

const Input = styled.input`
    padding: 0.9rem 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    font-size: 1.5rem;
    background: var(--color-grey-0);
    min-height: 4.2rem;
`;

const Select = styled.select`
    padding: 0.9rem 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    font-size: 1.5rem;
    background: var(--color-grey-0);
    min-height: 4.2rem;
`;

const IconBtn = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: ${(p) => (p.$danger ? "var(--color-red-700)" : "var(--color-brand-600)")};
    font-size: 1.6rem;
    padding: 0.4rem;
    &:hover { opacity: 0.7; }
`;

// ─── Sub-sección: Zonas ────────────────────────────────────────────────────
function ZonasTab() {
    const { zones, isLoading } = useZones();
    const { addZone, isLoading: adding } = useCreateZone();
    const { removeZone } = useDeleteZone();
    const { register, handleSubmit, reset } = useForm();

    if (isLoading) return <Spinner />;
    return (
        <SectionCard>
            <Heading as="h3">Zonas de Despacho</Heading>
            <TableWrapper>
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Prioridad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {zones.map((z) => (
                            <tr key={z.id}>
                                <td>{z.nombre}</td>
                                <td>#{z.prioridad}</td>
                                <td>
                                    <IconBtn $danger onClick={() => removeZone(z.id)}>
                                        <HiTrash />
                                    </IconBtn>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
            </TableWrapper>

            <form onSubmit={handleSubmit((d) => addZone(d, { onSuccess: reset }))}>
                <FormRow>
                    <FieldBox>
                        <Label>Nombre de zona *</Label>
                        <Input placeholder="Ej: Miramar" {...register("nombre", { required: true })} />
                    </FieldBox>
                    <FieldBox>
                        <Label>Prioridad (número)</Label>
                        <Input type="number" min="1" placeholder="1" {...register("prioridad", { required: true, valueAsNumber: true })} />
                    </FieldBox>
                    <Button type="submit" size="medium" disabled={adding}>
                        <HiPlus /> Agregar Zona
                    </Button>
                </FormRow>
            </form>
        </SectionCard>
    );
}

// ─── Sub-sección: Clientes ─────────────────────────────────────────────────
function ClientesTab() {
    const { clients, isLoading } = useClients();
    const { zones } = useZones();
    const { addClient, isLoading: adding } = useCreateClient();
    const { removeClient } = useDeleteClient();
    const { register, handleSubmit, reset } = useForm();

    if (isLoading) return <Spinner />;
    return (
        <SectionCard>
            <Heading as="h3">Clientes</Heading>
            <TableWrapper>
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Zona</th>
                            <th>Precio S/./kg</th>
                            <th>Corte</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((c) => (
                            <tr key={c.id}>
                                <td>{c.nombre}</td>
                                <td>{c.zones?.nombre ?? "—"}</td>
                                <td>{c.precio_defecto}</td>
                                <td>{c.corte_defecto}</td>
                                <td>
                                    <IconBtn $danger onClick={() => removeClient(c.id)}>
                                        <HiTrash />
                                    </IconBtn>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
            </TableWrapper>
            <form onSubmit={handleSubmit((d) => addClient(d, { onSuccess: reset }))}>
                <FormRow>
                    <FieldBox>
                        <Label>Nombre *</Label>
                        <Input placeholder="Nombre del cliente" {...register("nombre", { required: true })} />
                    </FieldBox>
                    <FieldBox>
                        <Label>Zona</Label>
                        <Select {...register("zone_id")}>
                            <option value="">Sin zona</option>
                            {zones.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                        </Select>
                    </FieldBox>
                    <FieldBox>
                        <Label>Precio S/./kg</Label>
                        <Input type="number" step="0.01" placeholder="0.00" {...register("precio_defecto", { valueAsNumber: true })} />
                    </FieldBox>
                    <FieldBox>
                        <Label>Corte habitual</Label>
                        <Select {...register("corte_defecto")}>
                            {TIPOS_CORTE.map((t) => <option key={t} value={t}>{t}</option>)}
                        </Select>
                    </FieldBox>
                    <Button type="submit" size="medium" disabled={adding}>
                        <HiPlus /> Agregar Cliente
                    </Button>
                </FormRow>
            </form>
        </SectionCard>
    );
}

// ─── Sub-sección: Ajustes Globales ─────────────────────────────────────────
function AjustesTab() {
    const { settings, isLoading } = useSettings();
    const { saveSettings, isLoading: saving } = useUpdateSettings();
    const { register, handleSubmit } = useForm();

    if (isLoading) return <Spinner />;
    return (
        <SectionCard>
            <Heading as="h3">Ajustes Globales</Heading>
            <p style={{ color: "var(--color-grey-500)", fontSize: "1.4rem", marginBottom: "1.6rem" }}>
                Modifica los parámetros que afectan los cálculos de pesaje en todo el sistema.
            </p>
            <form onSubmit={handleSubmit(saveSettings)}>
                <FormRow>
                    <FieldBox>
                        <Label>Peso estándar de tina (kg)</Label>
                        <Input
                            type="number"
                            step="0.001"
                            min="0"
                            defaultValue={settings?.peso_tina_kg}
                            {...register("peso_tina_kg", { required: true, valueAsNumber: true })}
                        />
                        <small style={{ color: "var(--color-grey-400)", fontSize: "1.2rem" }}>
                            Actualmente: {settings?.peso_tina_kg} kg
                        </small>
                    </FieldBox>
                    <Button type="submit" size="medium" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar Ajuste"}
                    </Button>
                </FormRow>
            </form>
        </SectionCard>
    );
}

// ─── Sub-sección: Usuarios ─────────────────────────────────────────────────
function UsuariosTab() {
    const [creating, setCreating] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    async function onCreateUser(data) {
        try {
            setCreating(true);
            await createUser({
                fullName: data.nombre,
                email: data.email,
                password: data.password,
                rol: data.rol,
            });
            toast.success(`Usuario creado. Se envió confirmación a ${data.email}`);
            reset();
        } catch (err) {
            toast.error(`Error: ${err.message}`);
        } finally {
            setCreating(false);
        }
    }

    return (
        <SectionCard>
            <Heading as="h3">Crear Usuario</Heading>
            <p style={{ color: "var(--color-grey-500)", fontSize: "1.4rem", marginBottom: "1.6rem" }}>
                Se enviará un correo de confirmación al nuevo usuario para activar su cuenta.
            </p>
            <form onSubmit={handleSubmit(onCreateUser)}>
                <FormRow>
                    <FieldBox>
                        <Label>Nombre completo *</Label>
                        <Input placeholder="Juan Pérez" {...register("nombre", { required: true })} />
                    </FieldBox>
                    <FieldBox>
                        <Label>Correo electrónico *</Label>
                        <Input type="email" placeholder="correo@ejemplo.com" {...register("email", { required: true })} />
                    </FieldBox>
                    <FieldBox>
                        <Label>Contraseña temporal *</Label>
                        <Input type="password" placeholder="Mínimo 6 caracteres" {...register("password", { required: true, minLength: 6 })} />
                    </FieldBox>
                    <FieldBox>
                        <Label>Rol *</Label>
                        <Select {...register("rol", { required: true })}>
                            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </Select>
                    </FieldBox>
                    <Button type="submit" size="medium" disabled={creating}>
                        {creating ? "Creando..." : <><HiPlus /> Crear Usuario</>}
                    </Button>
                </FormRow>
            </form>
        </SectionCard>
    );
}

// ─── Página Principal ──────────────────────────────────────────────────────

const TABS = [
    { id: "zonas", label: "Zonas" },
    { id: "clientes", label: "Clientes" },
    { id: "ajustes", label: "Ajustes Globales" },
    { id: "usuarios", label: "Usuarios" },
];

function Configuracion() {
    const [activeTab, setActiveTab] = useState("zonas");

    return (
        <Row type="vertical">
            <Heading as="h1">Configuración</Heading>

            <Tabs>
                {TABS.map((t) => (
                    <Tab key={t.id} $active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
                        {t.label}
                    </Tab>
                ))}
            </Tabs>

            {activeTab === "zonas" && <ZonasTab />}
            {activeTab === "clientes" && <ClientesTab />}
            {activeTab === "ajustes" && <AjustesTab />}
            {activeTab === "usuarios" && <UsuariosTab />}
        </Row>
    );
}

export default Configuracion;
