import { useState } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Row from "../ui/Row";

import { useRecords } from "../hooks/useRecords";
import { useClients } from "../hooks/useClients";
import { useZones } from "../hooks/useZones";
import { getDailyInventory, createDailyInventory } from "../services/apiInventory";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Heading from "../ui/Heading";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import toast from "react-hot-toast";

// ─── Styled Components ─────────────────────────────────────────────────────
const PageWrapper = styled.div`
    padding: 1.6rem;
    max-width: 1000px;
    margin: 0 auto;
`;

const Tabs = styled.div`
    display: flex;
    gap: 0.4rem;
    border-bottom: 2px solid var(--color-grey-200);
    margin-bottom: 2.4rem;
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
`;

const Card = styled.div`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-100);
    border-radius: var(--border-radius-md);
    padding: 2.4rem 4rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
`;

const FilterRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: 1.2rem;
    margin-bottom: 2rem;
    align-items: end;
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

const BtnRow = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
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
    }
`;

const AperturaBox = styled.div`
    max-width: 400px;
`;

// ─── Apertura de Día ────────────────────────────────────────────────────────
function AperturaTab() {
    const today = format(new Date(), "yyyy-MM-dd");
    const queryClient = useQueryClient();

    const { data: inventario, isLoading } = useQuery({
        queryKey: ["dailyInventory", today],
        queryFn: () => getDailyInventory(today),
    });

    const { mutate: registrarApertura, isLoading: saving } = useMutation({
        mutationFn: createDailyInventory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dailyInventory"] });
            toast.success("Apertura del día registrada");
        },
        onError: (err) => toast.error(err.message),
    });

    const { register, handleSubmit } = useForm();

    if (isLoading) return <Spinner />;

    return (
        <Card>
            <Heading as="h3">Apertura del Día — {today}</Heading>
            {inventario ? (
                <div style={{ marginTop: "1.6rem" }}>
                    <p style={{ fontSize: "1.5rem", color: "var(--color-green-700)", fontWeight: 600 }}>
                        ✅ Apertura ya registrada para hoy
                    </p>
                    <p style={{ fontSize: "1.4rem", marginTop: "0.8rem", color: "var(--color-grey-600)" }}>
                        Pollos iniciales: <strong>{inventario.pollos_iniciales}</strong> &nbsp;|&nbsp;
                        Kilos iniciales: <strong>{inventario.kilos_iniciales} kg</strong>
                    </p>
                </div>
            ) : (
                <AperturaBox>
                    <p style={{ fontSize: "1.4rem", color: "var(--color-grey-500)", margin: "1.2rem 0" }}>
                        Registra el stock inicial del día (pollos y kilos disponibles al inicio de operaciones).
                    </p>
                    <form onSubmit={handleSubmit((d) => registrarApertura({ ...d, fecha: today }))}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                            <FieldBox>
                                <Label>Pollos iniciales</Label>
                                <Input type="number" min="0" placeholder="0" {...register("pollos_iniciales", { required: true, valueAsNumber: true })} />
                            </FieldBox>
                            <FieldBox>
                                <Label>Kilos iniciales</Label>
                                <Input type="number" step="0.01" min="0" placeholder="0.00" {...register("kilos_iniciales", { required: true, valueAsNumber: true })} />
                            </FieldBox>
                            <Button type="submit" size="large" disabled={saving}>
                                {saving ? "Registrando..." : "Registrar Apertura"}
                            </Button>
                        </div>
                    </form>
                </AperturaBox>
            )}
        </Card>
    );
}

// ─── Generador de Reportes ─────────────────────────────────────────────────
function ReportesTab() {
    const [filtros, setFiltros] = useState({});
    const [activeFiltros, setActiveFiltros] = useState(null);

    const { clients } = useClients();
    const { zones } = useZones();
    const { records, isLoading } = useRecords(activeFiltros ?? {});

    const { register, handleSubmit } = useForm({
        defaultValues: {
            fechaInicio: format(new Date(), "yyyy-MM-dd"),
            fechaFin: format(new Date(), "yyyy-MM-dd"),
            clientId: "",
            zoneId: "",
        }
    });

    function onBuscar(data) {
        setActiveFiltros({
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin,
            clientId: data.clientId || null,
            zoneId: data.zoneId || null,
        });
    }

    function exportarPDF() {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Reporte de Pesajes — Sistema Avícola", 14, 20);
        doc.setFontSize(11);
        doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);

        autoTable(doc, {
            startY: 36,
            head: [["Fecha", "Cliente", "Tipo", "Peso Bruto", "Peso Neto", "Tinas", "Corte", "Precio", "Total"]],
            body: records.map((r) => [
                format(new Date(r.created_at), "dd/MM/yyyy HH:mm"),
                r.clients?.nombre ?? "—",
                r.tipo_registro,
                `${r.peso_bruto} kg`,
                `${r.peso_neto} kg`,
                r.cant_tinas,
                r.tipo_corte ?? "—",
                r.precio_aplicado ? `S/ ${r.precio_aplicado}` : "—",
                r.precio_aplicado ? `S/ ${(r.peso_neto * r.precio_aplicado).toFixed(2)}` : "—",
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [79, 70, 229] },
        });

        doc.save(`reporte-pesajes-${format(new Date(), "yyyyMMdd")}.pdf`);
        toast.success("PDF descargado");
    }

    function exportarExcel() {
        const data = records.map((r) => ({
            Fecha: format(new Date(r.created_at), "dd/MM/yyyy HH:mm"),
            Cliente: r.clients?.nombre ?? "—",
            Tipo: r.tipo_registro,
            "Peso Bruto (kg)": r.peso_bruto,
            "Peso Neto (kg)": r.peso_neto,
            Tinas: r.cant_tinas,
            Pollos: r.cant_pollos ?? "—",
            Corte: r.tipo_corte ?? "—",
            "Precio S/./kg": r.precio_aplicado ?? "—",
            "Total S/.": r.precio_aplicado ? (r.peso_neto * r.precio_aplicado).toFixed(2) : "—",
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pesajes");
        XLSX.writeFile(wb, `reporte-pesajes-${format(new Date(), "yyyyMMdd")}.xlsx`);
        toast.success("Excel descargado");
    }

    return (
        <Card>
            <Heading as="h3">Generador de Reportes</Heading>
            <form onSubmit={handleSubmit(onBuscar)}>
                <FilterRow>
                    <FieldBox>
                        <Label>Fecha inicio</Label>
                        <Input type="date" {...register("fechaInicio")} />
                    </FieldBox>
                    <FieldBox>
                        <Label>Fecha fin</Label>
                        <Input type="date" {...register("fechaFin")} />
                    </FieldBox>
                    <FieldBox>
                        <Label>Zona</Label>
                        <Select {...register("zoneId")}>
                            <option value="">Todas las zonas</option>
                            {zones.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                        </Select>
                    </FieldBox>
                    <FieldBox>
                        <Label>Cliente</Label>
                        <Select {...register("clientId")}>
                            <option value="">Todos los clientes</option>
                            {clients.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </Select>
                    </FieldBox>
                    <Button type="submit" size="medium">Ver Reporte</Button>
                </FilterRow>
            </form>

            {activeFiltros && (
                <>
                    <BtnRow>
                        <Button variation="secondary" size="medium" onClick={exportarPDF} disabled={records.length === 0}>
                            ⬇ Descargar PDF
                        </Button>
                        <Button variation="secondary" size="medium" onClick={exportarExcel} disabled={records.length === 0}>
                            ⬇ Descargar Excel
                        </Button>
                    </BtnRow>

                    {isLoading ? <Spinner /> : (
                        <TableWrapper>
                            {records.length === 0 ? (
                                <p style={{ textAlign: "center", color: "var(--color-grey-400)", padding: "2rem" }}>
                                    No hay registros para los filtros seleccionados.
                                </p>
                            ) : (
                                <StyledTable>
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Cliente</th>
                                            <th>Tipo</th>
                                            <th>Peso Bruto</th>
                                            <th>Peso Neto</th>
                                            <th>Corte</th>
                                            <th>Total S/.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((r) => (
                                            <tr key={r.id}>
                                                <td>{format(new Date(r.created_at), "dd/MM HH:mm")}</td>
                                                <td>{r.clients?.nombre}</td>
                                                <td style={{ textTransform: "capitalize" }}>{r.tipo_registro}</td>
                                                <td>{r.peso_bruto} kg</td>
                                                <td><strong>{r.peso_neto} kg</strong></td>
                                                <td>{r.tipo_corte ?? "—"}</td>
                                                <td>{r.precio_aplicado ? `S/ ${(r.peso_neto * r.precio_aplicado).toFixed(2)}` : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </StyledTable>
                            )}
                        </TableWrapper>
                    )}
                </>
            )}
        </Card>
    );
}

// ─── Página Principal ──────────────────────────────────────────────────────
function Reportes() {
    const [activeTab, setActiveTab] = useState("apertura");

    return (
        <Row type="vertical">
            <Heading as="h1">Reportes</Heading>
            <Tabs>
                <Tab $active={activeTab === "apertura"} onClick={() => setActiveTab("apertura")}>
                    Apertura del Día
                </Tab>
                <Tab $active={activeTab === "reportes"} onClick={() => setActiveTab("reportes")}>
                    Generador de Reportes
                </Tab>
            </Tabs>
            {activeTab === "apertura" && <AperturaTab />}
            {activeTab === "reportes" && <ReportesTab />}
        </Row>
    );
}

export default Reportes;
