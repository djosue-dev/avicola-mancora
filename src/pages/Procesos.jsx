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

// ─── Tipos de corte disponibles ────────────────────────────────────────────
const TIPOS_CORTE = ["Entero", "Pecho", "Pierna", "Ala", "Menudencia", "Mollejas", "Hígados", "Otro"];

// ─── Styled (reutilización del patrón Mobile First) ────────────────────────
const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1.6rem;
    max-width: 600px;
    margin: 0 auto;
`;

const FormCard = styled.div`
    background: var(--color-grey-0);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
    padding: 2.4rem;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
`;

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`;

const Label = styled.label`
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--color-grey-600);
`;

const StyledSelect = styled.select`
    padding: 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    font-size: 1.6rem;
    background: var(--color-grey-0);
    min-height: 4.8rem;
`;

const StyledInput = styled.input`
    padding: 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    font-size: 1.8rem;
    background: var(--color-grey-0);
    min-height: 4.8rem;
    font-weight: 600;
`;

const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.2rem;
    @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const NetoDisplay = styled.div`
    background: var(--color-brand-50);
    border: 2px solid var(--color-brand-500);
    border-radius: var(--border-radius-md);
    padding: 1.4rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    text-align: center;

    @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const DisplayItem = styled.div`
    p { font-size: 1.2rem; color: var(--color-brand-700); font-weight: 600; margin-bottom: 0.2rem; }
    span { font-size: 2.4rem; font-weight: 800; color: var(--color-brand-600); }
`;

// ─── Componente Principal ──────────────────────────────────────────────────
function Procesos() {
    const [fotoBlob, setFotoBlob] = useState(null);

    const { clients, isLoading: loadingClients } = useClients();
    const { settings } = useSettings();
    const { saveRecord, isLoading: saving } = useCreateRecord();
    const { user } = useUser();

    const pesaTina = Number(settings?.peso_tina_kg ?? 3);

    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            client_id: "",
            tipo_corte: "Entero",
            peso_bruto: "",
            cant_tinas: 0,
            precio_kg: "",
        }
    });

    const selectedClientId = watch("client_id");
    const pesoBruto = Number(watch("peso_bruto") ?? 0);
    const cantTinas = Number(watch("cant_tinas") ?? 0);
    const precioKg = Number(watch("precio_kg") ?? 0);
    const pesoNeto = Math.max(0, pesoBruto - cantTinas * pesaTina);
    const totalCobrar = pesoNeto * precioKg;

    // Precarga precio del cliente seleccionado
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
            onSuccess: () => {
                reset();
                setFotoBlob(null);
            }
        });
    }

    if (loadingClients) return <Spinner />;

    return (
        <PageWrapper>
            <Heading as="h1">Procesos — Pesaje de Cortes</Heading>

            <FormCard>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <FieldGroup>
                        <Label>Cliente *</Label>
                        <StyledSelect
                            {...register("client_id", { required: true })}
                            onChange={handleClientChange}
                        >
                            <option value="">Seleccionar cliente...</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </StyledSelect>
                        {errors.client_id && <p style={{ color: "red", fontSize: "1.2rem" }}>Requerido</p>}
                    </FieldGroup>

                    <FieldGroup>
                        <Label>Tipo de Corte *</Label>
                        <StyledSelect {...register("tipo_corte", { required: true })}>
                            {TIPOS_CORTE.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </StyledSelect>
                    </FieldGroup>

                    {/* CÁMARA */}
                    <FieldGroup>
                        <Label>Foto de Balanza * (obligatoria)</Label>
                        <CameraCapture onCapture={setFotoBlob} />
                    </FieldGroup>

                    <TwoCol>
                        <FieldGroup>
                            <Label>Peso Bruto (kg) *</Label>
                            <StyledInput
                                type="number" step="0.01" min="0" placeholder="0.00"
                                {...register("peso_bruto", { required: true, min: 0.01 })}
                            />
                        </FieldGroup>
                        <FieldGroup>
                            <Label>Cant. Tinas</Label>
                            <StyledInput
                                type="number" min="0" placeholder="0"
                                {...register("cant_tinas", { min: 0 })}
                            />
                        </FieldGroup>
                    </TwoCol>

                    <FieldGroup>
                        <Label>Precio x Kg (S/.) — editable</Label>
                        <StyledInput
                            type="number" step="0.01" min="0" placeholder="0.00"
                            {...register("precio_kg", { required: true, min: 0.01 })}
                        />
                        <small style={{ color: "var(--color-grey-400)", fontSize: "1.2rem" }}>
                            Precio precargado según el cliente seleccionado
                        </small>
                    </FieldGroup>

                    {/* DISPLAYS EN TIEMPO REAL */}
                    <NetoDisplay>
                        <DisplayItem>
                            <p>PESO NETO</p>
                            <span>{pesoNeto.toFixed(2)} kg</span>
                        </DisplayItem>
                        <DisplayItem>
                            <p>TOTAL A COBRAR</p>
                            <span>S/ {totalCobrar.toFixed(2)}</span>
                        </DisplayItem>
                    </NetoDisplay>

                    <Button
                        type="submit"
                        size="large"
                        style={{ width: "100%" }}
                        disabled={saving || !fotoBlob}
                    >
                        {saving ? "Guardando..." : "Guardar Registro"}
                    </Button>
                    {!fotoBlob && (
                        <p style={{ textAlign: "center", color: "var(--color-red-700)", fontSize: "1.3rem" }}>
                            ⚠ Toma la foto de la balanza para habilitar el guardado
                        </p>
                    )}
                </form>
            </FormCard>
        </PageWrapper>
    );
}

export default Procesos;
