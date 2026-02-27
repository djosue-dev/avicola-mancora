import { useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { HiArrowLeft } from "react-icons/hi2";

import { useZones } from "../hooks/useZones";
import { useClientsByZone } from "../hooks/useClients";
import { useSettings } from "../hooks/useSettings";
import { useCreateRecord } from "../hooks/useRecords";
import { useUser } from "../features/authentication/useUser";
import CameraCapture from "../features/shared/CameraCapture";
import Spinner from "../ui/Spinner";
import Heading from "../ui/Heading";
import Button from "../ui/Button";
import Row from "../ui/Row";
import Tag from "../ui/Tag";

// ─── Zona Selector ─────────────────────────────────────────────────────────
const ZonaGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: 1.6rem;
`;

const ZonaBtn = styled.button`
    padding: 2.4rem 2rem;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-grey-200);
    background: var(--color-grey-0);
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--color-grey-700);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
    box-shadow: var(--shadow-sm);
    text-align: left;

    &:first-child {
        background: var(--color-brand-600);
        color: var(--color-brand-50);
        border-color: var(--color-brand-700);
        box-shadow: var(--shadow-md);
    }

    &:hover {
        background-color: var(--color-brand-600);
        color: var(--color-brand-50);
        border-color: var(--color-brand-700);
        box-shadow: var(--shadow-md);
    }
`;

const PriorityTag = styled.span`
    font-size: 1.1rem;
    font-weight: 400;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

// ─── Formulario de Pesaje ──────────────────────────────────────────────────
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

    /* FIX iOS: evita el zoom automático al hacer foco en el input */
    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

const StyledSelect = styled.select`
    padding: 0.8rem 1.2rem;
    border: 1px solid var(--color-grey-300);
    border-radius: var(--border-radius-sm);
    background: var(--color-grey-0);
    font-size: 1.4rem;
    height: 4rem;

    /* FIX iOS zoom */
    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

const NetoBox = styled.div`
    grid-column: 1 / -1;
    background: var(--color-brand-50);
    border: 1px solid var(--color-brand-200);
    border-radius: var(--border-radius-md);
    padding: 1.6rem 2.4rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
`;

const NetoLabel = styled.span`
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--color-brand-700);
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const NetoValue = styled.span`
    font-size: 3rem;
    font-weight: 800;
    color: var(--color-brand-600);
`;

const Hint = styled.small`
    font-size: 1.2rem;
    color: var(--color-grey-400);
`;

const FullRow = styled.div`
    grid-column: 1 / -1;
`;

// ─── Componente Principal ──────────────────────────────────────────────────
function Camal() {
    const [selectedZone, setSelectedZone] = useState(null);
    const [fotoBlob, setFotoBlob] = useState(null);

    const { zones, isLoading: loadingZones } = useZones();
    const { clients, isLoading: loadingClients } = useClientsByZone(selectedZone?.id);
    const { settings } = useSettings();
    const { saveRecord, isLoading: saving } = useCreateRecord();
    const { user } = useUser();

    const pesaTina = Number(settings?.peso_tina_kg ?? 3);

    const { register, handleSubmit, watch, reset } = useForm({
        // cant_tinas vacío por defecto — se lee como 0 si no se llena
        defaultValues: { peso_bruto: "", cant_tinas: "", cant_pollos: "" }
    });

    const pesoNeto = Math.max(
        0,
        Number(watch("peso_bruto") || 0) - Number(watch("cant_tinas") || 0) * pesaTina
    );

    function onSubmit(data) {
        if (!fotoBlob) {
            alert("Debes tomar una foto de la balanza antes de guardar.");
            return;
        }
        saveRecord({
            tipo_registro: "camal",
            user_id: user?.id,
            client_id: data.client_id,
            order_id: null,
            peso_bruto: Number(data.peso_bruto),
            cant_tinas: Number(data.cant_tinas),
            cant_pollos: Number(data.cant_pollos),
            peso_neto: pesoNeto,
            fotoFile: fotoBlob,
        }, {
            onSuccess: () => { reset(); setFotoBlob(null); setSelectedZone(null); }
        });
    }

    if (loadingZones) return <Spinner />;

    // ── Pantalla 1: Selector de Zona ─────────
    if (!selectedZone) {
        return (
            <Row type="vertical">
                <Heading as="h1">Camal — Seleccionar Zona</Heading>
                <p style={{ fontSize: "1.4rem", color: "var(--color-grey-500)" }}>
                    La zona resaltada tiene mayor prioridad de despacho.
                </p>
                <ZonaGrid>
                    {zones.map((z) => (
                        <ZonaBtn key={z.id} onClick={() => setSelectedZone(z)}>
                            {z.nombre}
                            <PriorityTag>Prioridad #{z.prioridad}</PriorityTag>
                        </ZonaBtn>
                    ))}
                </ZonaGrid>
            </Row>
        );
    }

    // ── Pantalla 2: Formulario de Pesaje ─────
    return (
        <Row type="vertical">
            <Row type="horizontal">
                <Heading as="h1">Camal — {selectedZone.nombre}</Heading>
                <Button variation="secondary" size="small" onClick={() => setSelectedZone(null)}>
                    <HiArrowLeft /> Cambiar zona
                </Button>
            </Row>

            <FormCard>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormGrid>
                        <FieldBox>
                            <Label>Cliente *</Label>
                            <StyledSelect
                                {...register("client_id", { required: true })}
                                disabled={loadingClients}
                            >
                                <option value="">Seleccionar cliente...</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </StyledSelect>
                        </FieldBox>

                        <FieldBox>
                            <Label>Cantidad de Pollos</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                min="0"
                                placeholder="0"
                                {...register("cant_pollos")}
                            />
                        </FieldBox>

                        {/* Cámara — ocupa todo el ancho */}
                        <FullRow>
                            <Label style={{ display: "block", marginBottom: "0.8rem" }}>
                                Foto de Balanza * (obligatoria)
                            </Label>
                            <CameraCapture onCapture={setFotoBlob} />
                        </FullRow>

                        <FieldBox>
                            <Label>Peso Bruto (kg) *</Label>
                            <Input
                                type="number"
                                inputMode="decimal"
                                pattern="[0-9.]*"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...register("peso_bruto", { required: true, min: 0.01 })}
                            />
                        </FieldBox>

                        <FieldBox>
                            <Label>Cantidad de Tinas</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                min="0"
                                placeholder="0"
                                {...register("cant_tinas", { min: 0 })}
                            />
                            <Hint>Peso por tina: {pesaTina} kg. Si no usas tinas, deja vacío.</Hint>
                        </FieldBox>

                        {/* Display Peso Neto */}
                        <NetoBox>
                            <NetoLabel>Peso Neto Calculado</NetoLabel>
                            <NetoValue>{pesoNeto.toFixed(2)} kg</NetoValue>
                        </NetoBox>

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

export default Camal;
