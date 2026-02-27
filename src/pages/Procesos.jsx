import { useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";

import { useClients } from "../hooks/useClients";
import { useSettings } from "../hooks/useSettings";
import { useCreateRecord } from "../hooks/useRecords";
import { useUser } from "../features/authentication/useUser";
import CameraCapture from "../features/shared/CameraCapture";
import Spinner from "../ui/Spinner";
import Heading from "../ui/Heading";
import Button from "../ui/Button";
import Row from "../ui/Row";

const TIPOS_CORTE = ["Entero", "Pecho", "Pierna", "Ala", "Menudencia", "Mollejas", "Hígados"];

// ─── Styled Components ─────────────────────────────────────────────────────
const FormCard = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem 4rem;
    overflow: hidden;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem 3.2rem;

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const FieldBox = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const Label = styled.label`
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--color-grey-700);
`;

const Select = styled.select`
    padding: 0.8rem 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    background: var(--color-grey-0);
    font-size: 1.4rem;
    height: 4rem;
`;

const Input = styled.input`
    padding: 0.8rem 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    background: var(--color-grey-0);
    font-size: 1.6rem;
    font-weight: 600;
    height: 4rem;
`;

const Hint = styled.small`
    font-size: 1.2rem;
    color: var(--color-grey-400);
`;

const FullRow = styled.div`
    grid-column: 1 / -1;
`;

const DisplayGrid = styled.div`
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.6rem;

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const DisplayBox = styled.div`
    background: ${(p) => p.$accent ? "var(--color-green-100)" : "var(--color-brand-50)"};
    border: 1px solid ${(p) => p.$accent ? "var(--color-green-700)" : "var(--color-brand-200)"};
    border-radius: var(--border-radius-md);
    padding: 1.6rem 2.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`;

const DisplayLabel = styled.span`
    font-size: 1.2rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${(p) => p.$accent ? "var(--color-green-700)" : "var(--color-brand-700)"};
`;

const DisplayValue = styled.span`
    font-size: 2.8rem;
    font-weight: 800;
    color: ${(p) => p.$accent ? "var(--color-green-700)" : "var(--color-brand-600)"};
`;

// ─── Componente Principal ──────────────────────────────────────────────────
function Procesos() {
    const [fotoBlob, setFotoBlob] = useState(null);

    const { clients, isLoading: loadingClients } = useClients();
    const { settings } = useSettings();
    const { saveRecord, isLoading: saving } = useCreateRecord();
    const { user } = useUser();

    const pesaTina = Number(settings?.peso_tina_kg ?? 3);

    const { register, handleSubmit, watch, reset, setValue } = useForm({
        defaultValues: { client_id: "", tipo_corte: "Entero", peso_bruto: "", cant_tinas: 0, precio_kg: "" }
    });

    const pesoBruto = Number(watch("peso_bruto") ?? 0);
    const cantTinas = Number(watch("cant_tinas") ?? 0);
    const precioKg = Number(watch("precio_kg") ?? 0);
    const pesoNeto = Math.max(0, pesoBruto - cantTinas * pesaTina);
    const totalCobrar = pesoNeto * precioKg;

    function handleClientChange(e) {
        const id = e.target.value;
        setValue("client_id", id);
        const found = clients.find((c) => c.id === id);
        if (found) setValue("precio_kg", found.precio_defecto ?? "");
    }

    function onSubmit(data) {
        if (!fotoBlob) {
            alert("Debes tomar una foto de la balanza antes de guardar.");
            return;
        }
        saveRecord({
            tipo_registro: "proceso",
            user_id: user?.id,
            client_id: data.client_id,
            order_id: null,
            peso_bruto: Number(data.peso_bruto),
            cant_tinas: Number(data.cant_tinas),
            cant_pollos: null,
            peso_neto: pesoNeto,
            tipo_corte: data.tipo_corte,
            precio_aplicado: Number(data.precio_kg),
            fotoFile: fotoBlob,
        }, {
            onSuccess: () => { reset(); setFotoBlob(null); }
        });
    }

    if (loadingClients) return <Spinner />;

    return (
        <Row type="vertical">
            <Heading as="h1">Procesos — Pesaje de Cortes</Heading>

            <FormCard>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormGrid>
                        <FieldBox>
                            <Label>Cliente *</Label>
                            <Select
                                {...register("client_id", { required: true })}
                                onChange={handleClientChange}
                            >
                                <option value="">Seleccionar cliente...</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </Select>
                        </FieldBox>

                        <FieldBox>
                            <Label>Tipo de Corte *</Label>
                            <Select {...register("tipo_corte", { required: true })}>
                                {TIPOS_CORTE.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </Select>
                        </FieldBox>

                        {/* Cámara - ancho completo */}
                        <FullRow>
                            <Label style={{ display: "block", marginBottom: "0.8rem" }}>
                                Foto de Balanza * (obligatoria)
                            </Label>
                            <CameraCapture onCapture={setFotoBlob} />
                        </FullRow>

                        <FieldBox>
                            <Label>Peso Bruto (kg) *</Label>
                            <Input
                                type="number" step="0.01" min="0" placeholder="0.00"
                                {...register("peso_bruto", { required: true, min: 0.01 })}
                            />
                        </FieldBox>

                        <FieldBox>
                            <Label>Cantidad de Tinas</Label>
                            <Input
                                type="number" min="0" placeholder="0"
                                {...register("cant_tinas", { min: 0 })}
                            />
                        </FieldBox>

                        <FieldBox>
                            <Label>Precio x Kg (S/.) — editable</Label>
                            <Input
                                type="number" step="0.01" min="0" placeholder="0.00"
                                {...register("precio_kg", { required: true, min: 0.01 })}
                            />
                            <Hint>Precio precargado según el cliente seleccionado</Hint>
                        </FieldBox>

                        {/* Displays en tiempo real */}
                        <DisplayGrid>
                            <DisplayBox>
                                <DisplayLabel>Peso Neto</DisplayLabel>
                                <DisplayValue>{pesoNeto.toFixed(2)} kg</DisplayValue>
                            </DisplayBox>
                            <DisplayBox $accent>
                                <DisplayLabel $accent>Total a Cobrar</DisplayLabel>
                                <DisplayValue $accent>S/ {totalCobrar.toFixed(2)}</DisplayValue>
                            </DisplayBox>
                        </DisplayGrid>

                        <FullRow>
                            <Button
                                type="submit"
                                size="large"
                                style={{ width: "100%" }}
                                disabled={saving || !fotoBlob}
                            >
                                {saving ? "Guardando..." : "Guardar Registro"}
                            </Button>
                            {!fotoBlob && (
                                <p style={{ textAlign: "center", color: "var(--color-red-700)", fontSize: "1.3rem", marginTop: "0.8rem" }}>
                                    ⚠ Toma la foto de la balanza para habilitar el guardado
                                </p>
                            )}
                        </FullRow>
                    </FormGrid>
                </form>
            </FormCard>
        </Row>
    );
}

export default Procesos;
