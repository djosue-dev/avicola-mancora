import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { format, parse, isBefore, addMinutes } from "date-fns";
import { HiPlus, HiTrash, HiCheckCircle, HiClock } from "react-icons/hi2";
import { useForm } from "react-hook-form";

import { useOrders, useCreateOrder, useDeleteOrder, useUpdateOrderStatus } from "../hooks/useOrders";
import { useClients } from "../hooks/useClients";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import Heading from "../ui/Heading";

// ─── Animación parpadeo rojo ───────────────────────────────────────────────
const blink = keyframes`
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
`;

// ─── Styled Components ─────────────────────────────────────────────────────
const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
    padding: 1.6rem;
    max-width: 900px;
    margin: 0 auto;
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.2rem;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
    gap: 1.6rem;
`;

const Card = styled.div`
    border-radius: var(--border-radius-md);
    padding: 2rem;
    background: var(--color-grey-0);
    box-shadow: var(--shadow-md);
    border-left: 6px solid ${(p) =>
        p.$status === "rojo" ? "#dc2626" :
            p.$status === "amarillo" ? "#d97706" :
                "#16a34a"};
    animation: ${(p) => (p.$status === "rojo" ? blink : "none")} 1.5s ease-in-out infinite;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const ClientName = styled.p`
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--color-grey-800);
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.4rem;
    color: var(--color-grey-600);
`;

const Badge = styled.span`
    padding: 0.3rem 1rem;
    border-radius: 9999px;
    font-size: 1.2rem;
    font-weight: 600;
    background: ${(p) =>
        p.$status === "rojo" ? "var(--color-red-100)" :
            p.$status === "amarillo" ? "var(--color-yellow-100)" :
                "var(--color-green-100)"};
    color: ${(p) =>
        p.$status === "rojo" ? "var(--color-red-700)" :
            p.$status === "amarillo" ? "var(--color-yellow-700)" :
                "var(--color-green-700)"};
`;

const CardActions = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-top: 0.4rem;
`;

const FormBox = styled.div`
    background: var(--color-grey-0);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
    padding: 2.4rem;
`;

const FormTitle = styled.h3`
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.6rem;
    color: var(--color-grey-700);
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.4rem;

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const Label = styled.label`
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--color-grey-600);
    display: block;
    margin-bottom: 0.4rem;
`;

const Select = styled.select`
    width: 100%;
    padding: 1rem 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    background: var(--color-grey-0);
    font-size: 1.5rem;
    min-height: 4.4rem;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 1rem 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    background: var(--color-grey-0);
    font-size: 1.5rem;
    min-height: 4.4rem;
`;

const EmptyMsg = styled.p`
    text-align: center;
    color: var(--color-grey-400);
    font-size: 1.5rem;
    padding: 3rem;
`;

// ─── Lógica de color de alerta ─────────────────────────────────────────────
function getOrderStatus(horaLimiteStr, tieneDespachos) {
    const now = new Date();
    const limite = parse(horaLimiteStr, "HH:mm:ss", now);
    const margen = addMinutes(now, 30);

    if (!isBefore(now, limite) && !tieneDespachos) return "rojo";
    if (!isBefore(margen, limite)) return "amarillo";
    return "verde";
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

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    function onSubmit(formData) {
        addOrder({
            client_id: formData.client_id,
            fecha: today,
            hora_limite: formData.hora_limite,
            cantidad_solicitada: Number(formData.cantidad_solicitada),
        }, { onSuccess: () => { reset(); setShowForm(false); } });
    }

    if (isLoading) return <Spinner />;

    return (
        <PageWrapper>
            <HeaderRow>
                <Heading as="h1">Pizarra de Pedidos</Heading>
                <Button
                    size="large"
                    onClick={() => setShowForm((v) => !v)}
                    variation={showForm ? "secondary" : "primary"}
                >
                    {showForm ? "Cancelar" : <><HiPlus /> Nuevo Pedido</>}
                </Button>
            </HeaderRow>

            {showForm && (
                <FormBox>
                    <FormTitle>Registrar Pedido</FormTitle>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormGrid>
                            <div>
                                <Label>Cliente *</Label>
                                <Select {...register("client_id", { required: true })} disabled={loadingClients}>
                                    <option value="">Seleccionar cliente...</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </Select>
                                {errors.client_id && <p style={{ color: "red", fontSize: "1.2rem" }}>Requerido</p>}
                            </div>

                            <div>
                                <Label>Hora Límite *</Label>
                                <StyledInput
                                    type="time"
                                    {...register("hora_limite", { required: true })}
                                />
                                {errors.hora_limite && <p style={{ color: "red", fontSize: "1.2rem" }}>Requerido</p>}
                            </div>

                            <div>
                                <Label>Cantidad Solicitada (pollos)</Label>
                                <StyledInput
                                    type="number"
                                    min="1"
                                    placeholder="Ej: 100"
                                    {...register("cantidad_solicitada", { required: true, min: 1 })}
                                />
                            </div>
                        </FormGrid>

                        <div style={{ marginTop: "2rem" }}>
                            <Button type="submit" size="large" disabled={adding}>
                                {adding ? "Guardando..." : "Registrar Pedido"}
                            </Button>
                        </div>
                    </form>
                </FormBox>
            )}

            <Grid>
                {orders.length === 0 && (
                    <EmptyMsg>No hay pedidos registrados para hoy.</EmptyMsg>
                )}
                {orders.map((order) => {
                    const status = getOrderStatus(
                        order.hora_limite,
                        order.estado === "completado"
                    );
                    const labelMap = { verde: "A tiempo", amarillo: "Próximo a vencer", rojo: "¡VENCIDO!" };
                    return (
                        <Card key={order.id} $status={status}>
                            <ClientName>{order.clients?.nombre}</ClientName>
                            <MetaRow>
                                <HiClock size={16} />
                                Hora límite: <strong>{order.hora_limite?.slice(0, 5)}</strong>
                            </MetaRow>
                            <MetaRow>
                                Zona: {order.clients?.zones?.nombre ?? "—"}
                            </MetaRow>
                            <MetaRow>
                                Cantidad: <strong>{order.cantidad_solicitada} pollos</strong>
                            </MetaRow>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                <Badge $status={status}>{labelMap[status]}</Badge>
                            </div>
                            <CardActions>
                                {order.estado === "pendiente" && (
                                    <Button
                                        size="small"
                                        variation="secondary"
                                        onClick={() => changeStatus({ id: order.id, estado: "completado" })}
                                    >
                                        <HiCheckCircle /> Completar
                                    </Button>
                                )}
                                <Button
                                    size="small"
                                    variation="danger"
                                    onClick={() => removeOrder(order.id)}
                                >
                                    <HiTrash />
                                </Button>
                            </CardActions>
                        </Card>
                    );
                })}
            </Grid>
        </PageWrapper>
    );
}

export default Pizarra;
