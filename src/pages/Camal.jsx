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

// ─── Styled Components ─────────────────────────────────────────────────────
const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1.6rem;
    max-width: 600px;
    margin: 0 auto;
`;

const ZonaGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 1.2rem;
`;

const ZonaBtn = styled.button`
    padding: 2rem 1.6rem;
    border-radius: var(--border-radius-md);
    border: 2px solid var(--color-brand-500);
    background: var(--color-grey-0);
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--color-brand-600);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    box-shadow: var(--shadow-sm);

    &:first-child {
        background: var(--color-brand-500);
        color: white;
        border-color: var(--color-brand-700);
        box-shadow: var(--shadow-md);
        transform: scale(1.02);
    }

    &:hover {
        background: var(--color-brand-600);
        color: white;
    }
`;

const PriorityBadge = styled.span`
    font-size: 1.1rem;
    font-weight: 400;
    opacity: 0.8;
`;

const FormCard = styled.div`
    background: var(--color-grey-0);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
    padding: 2.4rem;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
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

const NetoDisplay = styled.div`
    background: var(--color-brand-50);
    border: 2px solid var(--color-brand-500);
    border-radius: var(--border-radius-md);
    padding: 1.6rem;
    text-align: center;

    p { font-size: 1.3rem; color: var(--color-brand-700); font-weight: 600; margin-bottom: 0.4rem; }
    span {
        font-size: 3.2rem;
        font-weight: 800;
        color: var(--color-brand-600);
    }
`;

const BackRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
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

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        defaultValues: { peso_bruto: "", cant_tinas: 0, cant_pollos: "" }
    });

    const pesoBruto = Number(watch("peso_bruto") ?? 0);
    const cantTinas = Number(watch("cant_tinas") ?? 0);
    const pesoNeto = Math.max(0, pesoBruto - cantTinas * pesaTina);

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
            onSuccess: () => {
                reset();
                setFotoBlob(null);
                setSelectedZone(null);
            }
        });
    }

    if (loadingZones) return <Spinner />;

    // ── PANTALLA 1: Selector de Zona ──
    if (!selectedZone) {
        return (
            <PageWrapper>
                <Heading as="h1">Camal — Seleccionar Zona</Heading>
                <p style={{ fontSize: "1.4rem", color: "var(--color-grey-500)" }}>
                    Las zonas están ordenadas por prioridad de despacho (mayor prioridad primero).
                </p>
                <ZonaGrid>
                    {zones.map((z) => (
                        <ZonaBtn key={z.id} onClick={() => setSelectedZone(z)}>
                            {z.nombre}
                            <PriorityBadge>Prioridad #{z.prioridad}</PriorityBadge>
                        </ZonaBtn>
                    ))}
                </ZonaGrid>
            </PageWrapper>
        );
    }

    // ── PANTALLA 2: Formulario de Pesaje ──
    return (
        <PageWrapper>
            <BackRow>
                <Button variation="secondary" size="small" onClick={() => setSelectedZone(null)}>
                    <HiArrowLeft /> Cambiar Zona
                </Button>
                <Heading as="h1">Camal — {selectedZone.nombre}</Heading>
            </BackRow>

            <FormCard>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <FieldGroup style={{ marginBottom: "1.2rem" }}>
                        <Label>Cliente *</Label>
                        <StyledSelect
                            {...register("client_id", { required: "Selecciona un cliente" })}
                            disabled={loadingClients}
                        >
                            <option value="">Seleccionar cliente...</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </StyledSelect>
                        {errors.client_id && <p style={{ color: "red", fontSize: "1.2rem" }}>{errors.client_id.message}</p>}
                    </FieldGroup>

                    {/* CÁMARA */}
                    <FieldGroup style={{ marginBottom: "1.2rem" }}>
                        <Label>Foto de Balanza * (obligatoria)</Label>
                        <CameraCapture onCapture={setFotoBlob} />
                    </FieldGroup>

                    <FieldGroup style={{ marginBottom: "1.2rem" }}>
                        <Label>Peso Bruto (kg) *</Label>
                        <StyledInput
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...register("peso_bruto", { required: true, min: 0.01 })}
                        />
                    </FieldGroup>

                    <FieldGroup style={{ marginBottom: "1.2rem" }}>
                        <Label>Cantidad de Tinas</Label>
                        <StyledInput
                            type="number"
                            min="0"
                            placeholder="0"
                            {...register("cant_tinas", { min: 0 })}
                        />
                        <small style={{ color: "var(--color-grey-400)", fontSize: "1.2rem" }}>
                            Peso por tina configurado: {pesaTina} kg
                        </small>
                    </FieldGroup>

                    <FieldGroup style={{ marginBottom: "1.6rem" }}>
                        <Label>Cantidad de Pollos</Label>
                        <StyledInput
                            type="number"
                            min="0"
                            placeholder="0"
                            {...register("cant_pollos")}
                        />
                    </FieldGroup>

                    {/* PESO NETO EN TIEMPO REAL */}
                    <NetoDisplay style={{ marginBottom: "2rem" }}>
                        <p>PESO NETO CALCULADO</p>
                        <span>{pesoNeto.toFixed(2)} kg</span>
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
                        <p style={{ textAlign: "center", color: "var(--color-red-700)", fontSize: "1.3rem", marginTop: "0.8rem" }}>
                            ⚠ Toma la foto de la balanza para habilitar el guardado
                        </p>
                    )}
                </form>
            </FormCard>
        </PageWrapper>
    );
}

export default Camal;
