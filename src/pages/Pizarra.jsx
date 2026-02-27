import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { format, parse, isBefore, addMinutes } from "date-fns";
import { HiPlus, HiTrash, HiCheckCircle } from "react-icons/hi2";
import { useForm } from "react-hook-form";

import { useOrders, useCreateOrder, useDeleteOrder, useUpdateOrderStatus } from "../hooks/useOrders";
import { useClients } from "../hooks/useClients";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import Tag from "../ui/Tag";
import Table from "../ui/Table";

// ─── Animación parpadeo rojo ───────────────────────────────────────────────
const blink = keyframes`
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
`;

// ─── Styled Components ─────────────────────────────────────────────────────
const Stacked = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    & span:first-child { font-weight: 500; }
    & span:last-child  { color: var(--color-grey-500); font-size: 1.2rem; }
`;

const TagBlink = styled.span`
    animation: ${(p) => (p.$blink ? blink : "none")} 1.5s ease-in-out infinite;
    display: inline-block;
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;

const FormBox = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem 4rem;
    overflow: hidden;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 24rem 16rem 16rem auto;
    gap: 2rem;
    align-items: end;

    @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
    @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const FieldBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const Label = styled.label`
    font-size: 1.3rem;
    font-weight: 500;
    color: var(--color-grey-700);
`;

const Select = styled.select`
    padding: 0.8rem 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    background: var(--color-grey-0);
    font-size: 1.4rem;
    height: 3.8rem;
`;

const Input = styled.input`
    padding: 0.8rem 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    background: var(--color-grey-0);
    font-size: 1.4rem;
    height: 3.8rem;
`;

// ─── Lógica de semáforo ────────────────────────────────────────────────────
function getStatus(horaLimiteStr, completado) {
    if (completado) return "verde";
    const now = new Date();
    const limite = parse(horaLimiteStr, "HH:mm:ss", now);
    if (!isBefore(now, limite)) return "rojo";
    if (!isBefore(addMinutes(now, 30), limite)) return "amarillo";
    return "verde";
}

const STATUS_TAG = { verde: "green", amarillo: "yellow", rojo: "red" };
const STATUS_TEXT = { verde: "A tiempo", amarillo: "Próximo", rojo: "Vencido" };

// ─── Fila de pedido ────────────────────────────────────────────────────────
function OrderRow({ order, onComplete, onDelete }) {
    const status = getStatus(order.hora_limite, order.estado === "completado");
    const tagType = STATUS_TAG[status];
    const isRojo = status === "rojo";

    return (
        <Table.Row>
            <Stacked>
                <span>{order.clients?.nombre}</span>
                <span>{order.clients?.zones?.nombre ?? "—"}</span>
            </Stacked>

            <div style={{ fontFamily: "monospace", fontWeight: 600 }}>
                {order.hora_limite?.slice(0, 5)}
            </div>

            <div>
                <strong>{order.cantidad_solicitada}</strong> pollos
            </div>

            <div>
                <TagBlink $blink={isRojo}>
                    <Tag type={tagType}>{STATUS_TEXT[status]}</Tag>
                </TagBlink>
            </div>

            <Actions>
                {order.estado === "pendiente" && (
                    <Button
                        size="small"
                        variation="secondary"
                        onClick={() => onComplete(order.id)}
                    >
                        <HiCheckCircle /> Completar
                    </Button>
                )}
                <Button size="small" variation="danger" onClick={() => onDelete(order.id)}>
                    <HiTrash />
                </Button>
            </Actions>
        </Table.Row>
    );
}

// ─── Componente Principal ──────────────────────────────────────────────────
function Pizarra() {
    const [showForm, setShowForm] = useState(false);
    const today = format(new Date(), "yyyy-MM-dd");

    const { orders, isLoading } = useOrders(today);
    const { clients, isLoading: loadingClients } = useClients();
    const { addOrder, isLoading: adding } = useCreateOrder();
    const { removeOrder } = useDeleteOrder();
    const { changeStatus } = useUpdateOrderStatus();

    const { register, handleSubmit, reset } = useForm();

    function onSubmit(data) {
        addOrder({
            client_id: data.client_id,
            fecha: today,
            hora_limite: data.hora_limite,
            cantidad_solicitada: Number(data.cantidad_solicitada),
        }, { onSuccess: () => { reset(); setShowForm(false); } });
    }

    if (isLoading) return <Spinner />;

    return (
        <Row type="vertical">
            {/* ── Cabecera ─────────────────────────────── */}
            <Row type="horizontal">
                <Heading as="h1">Pizarra de Pedidos</Heading>
                <Button
                    size="medium"
                    variation={showForm ? "secondary" : "primary"}
                    onClick={() => setShowForm((v) => !v)}
                >
                    {showForm ? "Cancelar" : <><HiPlus /> Nuevo Pedido</>}
                </Button>
            </Row>

            {/* ── Formulario nuevo pedido ───────────────── */}
            {showForm && (
                <FormBox>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormGrid>
                            <FieldBox>
                                <Label>Cliente *</Label>
                                <Select {...register("client_id", { required: true })} disabled={loadingClients}>
                                    <option value="">Seleccionar cliente...</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </Select>
                            </FieldBox>

                            <FieldBox>
                                <Label>Hora límite *</Label>
                                <Input type="time" {...register("hora_limite", { required: true })} />
                            </FieldBox>

                            <FieldBox>
                                <Label>Cantidad (pollos)</Label>
                                <Input
                                    type="number" min="1" placeholder="0"
                                    {...register("cantidad_solicitada", { required: true, min: 1 })}
                                />
                            </FieldBox>

                            <Button type="submit" size="medium" disabled={adding}>
                                {adding ? "Guardando..." : "Registrar"}
                            </Button>
                        </FormGrid>
                    </form>
                </FormBox>
            )}

            {/* ── Tabla de pedidos ──────────────────────── */}
            <Table columns="2fr 1fr 1fr 1.2fr auto">
                <Table.Header>
                    <div>Cliente / Zona</div>
                    <div>Hora Límite</div>
                    <div>Cantidad</div>
                    <div>Estado</div>
                    <div></div>
                </Table.Header>

                <Table.Body
                    data={orders}
                    render={(order) => (
                        <OrderRow
                            key={order.id}
                            order={order}
                            onComplete={(id) => changeStatus({ id, estado: "completado" })}
                            onDelete={(id) => removeOrder(id)}
                        />
                    )}
                />
            </Table>
        </Row>
    );
}

export default Pizarra;
